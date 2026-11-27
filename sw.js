// AUNG Gas Solutions POS v24-s14.1 Service Worker
// Cache version identifier for offline-first PWA updates
const CACHE_NAME = 'aung-gas-pos-v24-s14.1';

// Core application shell assets to pre-cache on install
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png'
];

// Install event: activate immediately and pre-cache core assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
});

// Activate event: delete outdated caches and take control of all open clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Message event: allow immediate update trigger from the UI
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event: bypass Google Apps Script Cloud Sync URLs, network-first with cache fallback for app assets
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('script.google.com') || event.request.url.includes('script.googleusercontent.com')) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
