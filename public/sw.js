// MENTISERA OBE360™ Service Worker for Offline Blueprint Storage & Sync
const CACHE_NAME = 'obe360-app-shell-v1';
const DATA_CACHE_NAME = 'obe360-blueprints-data-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/logo.svg',
];

// Install: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Non-fatal asset pre-caching error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DATA_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and chrome-extension / non-http schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML pages) -> Network-first with Cache fallback to '/' or '/index.html'
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match('/index.html') || await caches.match('/');
          if (fallback) return fallback;
          return new Response('<h1>OBE360 Offline Mode</h1><p>You are disconnected. Your course blueprints are securely saved locally.</p>', {
            headers: { 'Content-Type': 'text/html' },
          });
        })
    );
    return;
  }

  // 2. Course API requests -> Network-first with fallback to local cache
  if (url.pathname.startsWith('/api/courses')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({ courses: [], offlineFallback: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // 3. Static assets, fonts, icons, JS/CSS bundles -> Cache-first with Network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next time (stale-while-revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {
            // Offline - ignore network update failure
          });
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If offline and request is an image or icon, return fallback if available
          if (request.destination === 'image') {
            return caches.match('/favicon.svg');
          }
          return new Response('', { status: 408, statusText: 'Offline Request' });
        });
    })
  );
});

// Background Sync Event (Standard Service Worker sync API)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-courses-to-firebase' || event.tag === 'sync-blueprints') {
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'TRIGGER_FIREBASE_AUTO_SYNC',
            timestamp: Date.now(),
            source: 'service-worker-sync',
          });
        });
      })
    );
  }
});

// Message listener for client coordination
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'PING') {
    event.ports[0]?.postMessage({
      type: 'PONG',
      timestamp: Date.now(),
      version: CACHE_NAME,
      offlineReady: true,
    });
  }

  // Allow clients to cache snapshot directly into Service Worker cache
  if (event.data.type === 'CACHE_COURSE_SNAPSHOT' && event.data.course) {
    const course = event.data.course;
    caches.open(DATA_CACHE_NAME).then((cache) => {
      const url = `/api/courses/${course.id}`;
      const response = new Response(JSON.stringify({ course }), {
        headers: { 'Content-Type': 'application/json' },
      });
      cache.put(url, response);
    });
  }
});
