// DigitalsNova Enterprise POS Offline Service Worker & PWA Cache (Mirror)
const CACHE_NAME = 'digitalsnova-pos-v18-offline';
const PRECACHE_ASSETS = [
  './portal/',
  './portal/index.html',
  './portal/manifest.json',
  './portal/icon.svg',
  './portal/icon-192.png',
  './portal/icon-512.png',
  './portal/icon-maskable-512.png',
  './assets/index-DNv15Live.js',
  './assets/index-DNv15Live.js?v=20261110v18',
  './assets/index-Db2yxC1M.css',
  './assets/index-Db2yxC1M.css?v=20261110v18'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_ASSETS.map((url) => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'digitalsnova-sync-offline') {
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'SYNC_OFFLINE_QUEUES' }));
      })
    );
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.pathname.includes('/downloads/')) return;

  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(req).catch(() => new Response(
        JSON.stringify({
          offline: true,
          status: 'offline_buffered',
          message: 'Device is offline. Transaction safely queued in IndexedDB & local storage.'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((exactMatch) => {
      if (exactMatch) {
        fetch(req).then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, res));
          }
        }).catch(() => {});
        return exactMatch;
      }
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }));
    })
  );
});
