// AUNG Gas Solutions POS v24 — Development Branch Service Worker
// Branch: feature/aung-pos-v24
const CACHE_NAME = 'aung-gas-pos-v24-dev';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

// Install: pre-cache core offline assets and activate immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: purge outdated caches while preserving active dev cache
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

// Fetch: cache-first with network fallback, plus offline index.html fallback for navigation
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).catch(() => {
          if (event.request.mode === 'navigate' || (event.request.headers.get('accept') || '').includes('text/html')) {
            return cache.match('./index.html');
          }
          return undefined;
        });
      })
    )
  );
});