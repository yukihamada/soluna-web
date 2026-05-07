// SOLUNA BIM Service Worker — offline cache for /bim
const CACHE = 'soluna-bim-v1';
const PRECACHE = [
  '/bim',
  '/cabin/bim.html',
  '/cabin/js/bim.js',
  '/cabin/bim-manifest.webmanifest',
];
// Three.js + dependencies cached on first use (stale-while-revalidate)
const RUNTIME_HOSTS = [
  'unpkg.com',
  'cdn.jsdelivr.net',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Skip API endpoints (always fresh)
  if (url.pathname.startsWith('/api/')) return;

  const isAsset =
    url.origin === self.location.origin ||
    RUNTIME_HOSTS.some((h) => url.host.endsWith(h));
  if (!isAsset) return;

  e.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      const ext = url.pathname.split('.').pop();
      // stale-while-revalidate for static assets
      if (cached && ['html', 'js', 'css', 'webp', 'jpg', 'png', 'woff2', 'svg', 'webmanifest'].includes(ext)) {
        return cached;
      }
      return fetchPromise;
    })
  );
});
