const CACHE = 'soluna-v1';
const PRECACHE = [
  '/',
  '/collection',
  '/scheme',
  '/app',
  '/js/sln-admin.js',
  '/js/lang.js',
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(PRECACHE); }).catch(function(){})
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  // Only cache GET requests for same origin
  if(req.method !== 'GET') return;
  var url = new URL(req.url);
  if(url.origin !== self.location.origin) return;
  // Skip API and admin routes
  if(url.pathname.startsWith('/api/') || url.pathname.startsWith('/cabin/')) return;

  e.respondWith(
    caches.match(req).then(function(cached){
      var fetchPromise = fetch(req).then(function(res){
        if(res && res.status === 200 && res.type === 'basic'){
          var clone = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, clone); });
        }
        return res;
      }).catch(function(){ return cached; });
      // Return cached first (stale-while-revalidate for HTML/JS/CSS/images)
      var ext = url.pathname.split('.').pop();
      if(['html','js','css','webp','jpg','png','woff2','svg'].includes(ext) && cached){
        return cached;
      }
      return fetchPromise;
    })
  );
});
