const cacheName = "solo-v1";
const files = ["./", "./index.html", "./style.css", "./script.js"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(cacheName).then(c => c.addAll(files)));
});

self.addEventListener("activate", e => {
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
