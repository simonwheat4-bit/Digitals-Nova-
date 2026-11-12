// DigitalsNova Enterprise POS Offline Service Worker & PWA Cache (Root Scope)
const CACHE_NAME = 'digitalsnova-pos-v21-offline';
const PRECACHE_ASSETS = [
  './portal/',
  './portal/index.html',
  './portal/manifest.json',
  './favicon.ico',
  './portal/favicon.ico',
  './portal/icon.svg',
  './portal/icon-192.png',
  './portal/icon-512.png',
  './portal/icon-maskable-512.png',
  './assets/index-DNv15Live.js',
  './assets/index-DNv15Live.js?v=20261111v21',
  './assets/index-Db2yxC1M.css',
  './assets/index-Db2yxC1M.css?v=20261111v21',
  './portal/assets/index-DNv15Live.js',
  './portal/assets/index-DNv15Live.js?v=20261111v21',
  './portal/assets/index-Db2yxC1M.css',
  './portal/assets/index-Db2yxC1M.css?v=20261111v21'
];

function fetchWithTimeout(req, ms) {
  return new Promise((resolve, reject) => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => {
      if (controller) try { controller.abort(); } catch {}
      reject(new Error('Network timeout'));
    }, ms);
    const opts = { cache: 'no-cache' };
    if (controller) opts.signal = controller.signal;
    fetch(req, opts).then((res) => {
      clearTimeout(timer);
      resolve(res);
    }).catch((err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_ASSETS.map((url) =>
          fetch(url, { cache: 'no-cache' }).then((res) => {
            if (res && (res.ok || res.type === 'opaque')) {
              return cache.put(url, res);
            }
          }).catch(() => {})
        )
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
    }).then(() => self.clients.claim()).then(() =>
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'SW_UPDATED', version: 'v21' }));
      })
    )
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => self.skipWaiting())
    );
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
      fetch(req, { cache: 'no-store' }).catch(() => new Response(
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

  // Network-First with timeout for HTML pages, navigations, manifests, JS, and CSS
  const isCodeOrShell =
    req.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('manifest.json');

  if (isCodeOrShell) {
    event.respondWith(
      fetchWithTimeout(req, 4500).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkResponse;
      }).catch(() =>
        caches.match(req).then((m) =>
          m ||
          caches.match(req, { ignoreSearch: true }) ||
          (req.mode === 'navigate' && (url.pathname.startsWith('/portal') || /^\/(super-admin|admin)(\/|$)/.test(url.pathname))
            ? caches.match('./portal/index.html', { ignoreSearch: true })
            : undefined)
        ).then((res) => res || new Response('Offline', { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/plain' } }))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((exactMatch) => {
      if (exactMatch) {
        fetch(req, { cache: 'no-cache' }).then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, res));
          }
        }).catch(() => {});
        return exactMatch;
      }
      return fetch(req, { cache: 'no-cache' }).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() =>
        caches.match(req, { ignoreSearch: true }).then((m) => m || new Response('Offline', { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/plain' } }))
      );
    })
  );
});
