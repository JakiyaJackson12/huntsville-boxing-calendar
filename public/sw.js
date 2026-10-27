const CACHE_NAME = 'hbc-app-shell-v3';
const APP_SHELL = [
  '/',
  '/styles.css',
  '/js/app.js',
  '/js/api.js',
  '/js/renderer.js',
  '/js/state.js',
  '/js/utils.js',
  '/assets/anime-boxer.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            const key = request.mode === 'navigate' ? '/' : request;
            cache.put(key, copy);
          });
        }
        return response;
      })
      .catch(async () => {
        if (request.mode === 'navigate') return caches.match('/');
        return caches.match(request);
      }),
  );
});
