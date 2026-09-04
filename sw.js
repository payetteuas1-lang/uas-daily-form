const CACHE_NAME = 'uas-daily-v2'; // Changing this version forces an update

// On install, take control immediately
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// On activate, delete old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// NETWORK-FIRST: Try to fetch the newest version from GitHub first. 
// If offline, fall back to the saved cache.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // Cache the fresh copy
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If offline (in the woods/mountains), load cached version
        return caches.match(e.request);
      })
  );
});
