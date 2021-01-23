console.log('service-worker:start');

// Force loading a new version of the service-worker by changing this.
const version = 'v1.0.5';

self.addEventListener('error', function (error) {
  console.log(error.filename, error.lineno, error.colno, error.message);
});

// Use a cacheName for cache versioning and busting resources.
let cacheName = `${version}:static`;

console.log(`service-worker:version ${version}`);
console.log(`service-worker:cacheName: ${cacheName}`);

const filesToCache = [
  './',
  './index.html',
  './map.html',
  './styles.css',
  './dependencies.js',
];

self.addEventListener('install', function (event) {
  console.log('service-worker:install');

  // Cache offline static assets.
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(filesToCache).then(function() {
        console.log('service-worker:cacheAll complete');
        self.skipWaiting();
      });
    })
  );
});

// Remove old cache if any.
self.addEventListener('activate', function (event) {
  console.log('service-worker:activate');

  event.waitUntil((async function () {
    const cacheNames = await caches.keys();

    await Promise.all(cacheNames.map(async function (cacheName) {
      if (self.cacheName !== cacheName) {
        console.log(`service:worker:activate [${cacheName}] clean item from cache`);
        await caches.delete(cacheName);
      }
    }));
  })());
});

// when the browser fetches a URL…
self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    // caches.match() always resolves
    // but in case of success response will have value
    if (response !== undefined) {
      console.log(`service-worker:fetch [${event.request.method}] ${event.request.url} (cached)`);
      return response;
    }

    return fetch(event.request).then(function (response) {
      console.log(`service-worker:fetch [${event.request.method}] ${event.request.url} (not-cached)`);

      // response may be used only once
      // we need to save clone to put one copy in cache
      // and serve second one
      let responseClone = response.clone();

      caches.open(cacheName).then(function (cache) {
        cache.put(event.request, responseClone);
      });
      return response;
    }).catch(function () {
      console.log('service-worker:error');
      // return caches.match('/sw-test/gallery/myLittleVader.jpg');
    });
  }));
});

console.log('service-worker:end');
