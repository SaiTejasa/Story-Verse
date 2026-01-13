
const CACHE_NAME = 'gpt-verse-v1.1.1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    ))
  );
});

self.addEventListener('fetch', event => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(fetchResponse => {
        // Only cache successful PDF responses
        if (event.request.url.endsWith('.pdf') && fetchResponse.ok) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      }).catch(err => {
        console.error('SW fetch failed:', err);
        throw err;
      });
    })
  );
});
