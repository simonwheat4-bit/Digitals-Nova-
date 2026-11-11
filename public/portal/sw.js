// DigitalsNova Enterprise POS Offline Service Worker & PWA Cache
const CACHE_NAME = 'digitalsnova-pos-v19-offline';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './assets/index-DNv15Live.js',
  './assets/index-DNv15Live.js?v=20261111v19',
  './assets/index-Db2yxC1M.css',
  './assets/index-Db2yxC1M.css?v=20261111v19',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline POS shell v19');
      return Promise.all(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Pre-cache skipped for:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging obsolete cache:', key);
            return caches.delete(key);
          }
        })
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
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_OFFLINE_QUEUES' });
        });
      })
    );
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never intercept downloadable setup packages
  if (url.pathname.includes('/downloads/')) {
    return;
  }

  // If calling an API route, use Network First, failover to offline response
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(
          JSON.stringify({
            offline: true,
            status: 'offline_buffered',
            message: 'Device is offline. Transaction safely queued in IndexedDB & local storage.'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Network-First for HTML shell & manifest so deployed updates appear immediately when online
  const isDocumentOrManifest =
    req.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('manifest.json');

  if (isDocumentOrManifest) {
    event.respondWith(
      fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const toCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, toCache));
        }
        return networkResponse;
      }).catch(() =>
        caches.match(req).then((exactMatch) => exactMatch || caches.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? caches.match('./index.html', { ignoreSearch: true }) : undefined))
      )
    );
    return;
  }

  // Stale-While-Revalidate / Cache-First for static assets (with ignoreSearch fallback)
  event.respondWith(
    caches.match(req).then((exactMatch) => {
      if (exactMatch) {
        fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
          }
        }).catch(() => {});
        return exactMatch;
      }

      return caches.match(req, { ignoreSearch: true }).then((searchIgnoredMatch) => {
        return fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const toCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, toCache));
          }
          return networkResponse;
        }).catch(() => {
          if (searchIgnoredMatch) return searchIgnoredMatch;
          if (req.mode === 'navigate') {
            return caches.match('./index.html', { ignoreSearch: true });
          }
        });
      });
    })
  );
});
