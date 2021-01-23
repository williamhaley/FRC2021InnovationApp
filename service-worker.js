// Use a cacheName for cache versioning and busting resources.
var cacheName = 'v1:static';

console.log('1');

self.addEventListener('install', function (event) {
  console.log('installed service worker');

  // Cache offline static assets.
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll([
        './',
        './styles.css',
        './dependencies.js',
      ]).then(function() {
        self.skipWaiting();
      });
    })
  );
});

// when the browser fetches a URL…
self.addEventListener('fetch', function(event) {
  console.log('fetch', event);

  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Cached resource. Load the cache.
      if (response) {
        // retrieve from cache
        return response;
      }
      // fetch as normal
      return fetch(event.request);
    })
  );
});
