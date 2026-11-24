// AUNG Gas Solutions POS v24 — Development Branch Service Worker
// Branch: feature/aung-pos-v24 (Isolated from production main)

const CACHE_NAME = 'aung-gas-pos-v24-s2';
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

// Activate: Clean up older caches and take control immediately
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

// Message: Support immediate activation when "နောက်ဆုံး version ကိုယူရန်" is triggered
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: Network-first for navigation/HTML so updates load reliably,
// cache-first with background refresh for static assets, and offline './index.html' fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const acceptHeader = event.request.headers.get('accept') || '';
  const isNavigation = event.request.mode === 'navigate' || acceptHeader.includes('text/html');

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    )
  );
});