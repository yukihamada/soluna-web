// SOLUNA Analytics v2 — self-hosted, no Google
// Tracks: page_view, scroll depth, time on page, section views, CTA clicks, exit intent
(function () {
  'use strict';
  var API       = 'https://kagi-server.fly.dev/api/v1/soluna';
  var KEY_VID   = 'soluna_vid';
  var KEY_EMAIL = 'soluna_ve';

  // ── Visitor ID (persists across sessions) ─────────────────────
  var vid = localStorage.getItem(KEY_VID);
  if (!vid) {
    vid = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem(KEY_VID, vid);
  }
  window._solunaVid = vid;

  var storedEmail = localStorage.getItem(KEY_EMAIL) || '';

  // ── Helpers ───────────────────────────────────────────────────
  var device = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop';
  var sp = new URLSearchParams(location.search);
  var page = location.pathname.replace(/\/$/, '') || '/';

  function send(event, meta) {
    var body = {
      event       : event,
      session_id  : vid,
      page        : page,
      page_title  : document.title,
      referrer    : document.referrer || '',
      device      : device,
      utm_source  : sp.get('utm_source')   || '',
      utm_medium  : sp.get('utm_medium')   || '',
      utm_campaign: sp.get('utm_campaign') || ''
    };
    if (storedEmail) body.email = storedEmail;
    if (meta && Object.keys(meta).length) body.metadata = meta;
    var blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(API + '/track', blob);
      } else {
        fetch(API + '/track', { method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body), keepalive: true
        }).catch(function(){});
      }
    } catch(e) {}
  }

  // ── Public API ────────────────────────────────────────────────
  window._sln_track = function(event, extra) {
    send(event, extra || {});
  };

  window.solunaIdentify = function(email, name) {
    if (!email || email.indexOf('@') < 0) return;
    localStorage.setItem(KEY_EMAIL, email);
    storedEmail = email;
    send('visitor_identified', { email: email, name: name || '' });
  };

  // ── Page view ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ send('page_view'); });
  } else {
    send('page_view');
  }

  // ── Scroll depth (25 / 50 / 75 / 100 %) ─────────────────────
  var scrollFired = {};
  function onScroll() {
    var pct = Math.round(
      window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1) * 100
    );
    [25, 50, 75, 100].forEach(function(p) {
      if (pct >= p && !scrollFired[p]) {
        scrollFired[p] = true;
        send('scroll_' + p, { depth: p });
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Time on page (30 / 60 / 120 / 300 s) ────────────────────
  [30, 60, 120, 300].forEach(function(s) {
    setTimeout(function() { send('time_on_page_' + s, { seconds: s }); }, s * 1000);
  });

  // ── Exit intent (mouse leaves top of viewport, desktop only) ─
  if (device === 'desktop') {
    var exitFired = false;
    document.addEventListener('mouseleave', function(e) {
      if (e.clientY < 10 && !exitFired) {
        exitFired = true;
        send('exit_intent');
      }
    });
  }

  // ── Section visibility (IntersectionObserver) ────────────────
  // Tracks which named sections the user actually saw
  if (window.IntersectionObserver) {
    var sectionObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id || entry.target.dataset.track;
          if (id) {
            send('section_view', { section: id });
          }
          sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    // Wait for DOM
    function observeSections() {
      // Track any element with data-track attribute
      document.querySelectorAll('[data-track]').forEach(function(el) {
        sectionObserver.observe(el);
      });
      // Also track key sections by common IDs
      ['hero', 'tapkop', 'properties', 'drone-video', 'owner-voices',
       'docs', 'contact', 'faq', 'price', 'buy', 'screen1', 'screen2', 'screen3'
      ].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observeSections);
    } else {
      observeSections();
    }
  }

  // ── CTA link click tracking ──────────────────────────────────
  function trackLinks() {
    var ctaPatterns = [
      { match: /buy\.html/,        label: 'cta_buy'        },
      { match: /pay\.html/,        label: 'cta_pay'        },
      { match: /owners\.html/,     label: 'cta_owners'     },
      { match: /contact\.html/,    label: 'cta_contact'    },
      { match: /collection\.html/, label: 'cta_collection' },
      { match: /crypto\.html/,     label: 'cta_crypto'     },
      { match: /community\.html/,  label: 'cta_community'  },
    ];

    document.addEventListener('click', function(e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      for (var i = 0; i < ctaPatterns.length; i++) {
        if (ctaPatterns[i].match.test(href)) {
          send('link_click', { label: ctaPatterns[i].label, href: href, text: (a.textContent||'').trim().slice(0,50) });
          break;
        }
      }
      // Track external links
      if (href.startsWith('http') && href.indexOf('solun.art') < 0 && href.indexOf('soluna-teshikaga') < 0) {
        send('external_link', { href: href, text: (a.textContent||'').trim().slice(0,50) });
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackLinks);
  } else {
    trackLinks();
  }

})();
