// AUNG Gas Solutions POS v24 — Development Branch Service Worker
// Branch: feature/aung-pos-v24 (Isolated from production main)

const CACHE_NAME = 'aung-gas-pos-v24-s1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
];

// Install: Pre-cache core offline PWA shell and activate immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up outdated caches while keeping the active v24 cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && (key.startsWith('aung-gas-pos-') || /^aung-pos-v\d+/.test(key)))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Message: Support immediate activation from "နောက်ဆုံး version ကိုယူရန်"
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: Cache-first for offline reliability, falling back to './index.html' on navigation
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            const acceptHeader = event.request.headers.get('accept') || '';
            if (event.request.mode === 'navigate' || acceptHeader.includes('text/html')) {
              return cache.match('./index.html');
            }
            return undefined;
          });
      })
    )
  );
});