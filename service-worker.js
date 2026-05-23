const CACHE_NAME = 'fdp-calc-v1';
const ASSETS = [
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/984/984233.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});