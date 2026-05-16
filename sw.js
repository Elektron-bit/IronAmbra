const CACHE = "ironambra-cache-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
];

// install: cache solo file locali (così non fallisce per CDN)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null)))
      .then(() => self.clients.claim())
  );
});

// fetch: cache-first per locali, network-first per il resto
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // stessi origin (GitHub Pages): cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
    return;
  }

  // CDN/altro: network-first (così online funziona sempre)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
