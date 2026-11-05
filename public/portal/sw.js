// DigitalsNova Enterprise POS Offline Service Worker & PWA Cache
const CACHE_NAME = 'digitalsnova-pos-v15-offline';
const PRECACHE_ASSETS = [
  './index.html',
  './manifest.json',
  './assets/index-DNv14Live.js',
  './assets/index-Db2yxC1M.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline POS shell');
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If calling an API route, use Network First, failover to offline response
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ 
            offline: true, 
            status: 'offline_buffered',
            message: 'Device is offline. Transaction safely queued in local memory.' 
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Stale-While-Revalidate / Cache-First for assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const toCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
