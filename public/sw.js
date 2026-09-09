// SmokeAR service worker — minimal, hand-rolled (no build-time asset manifest).
//
// Scope on purpose: this does NOT try to precache Next.js's hashed JS/CSS
// chunks (they change every deploy and chasing them here would just cause
// stale-bundle bugs). It only guarantees two things offline: the app shell
// can always fall back to a "you're offline" page instead of the browser's
// default error screen, and a handful of static assets (icons, manifest)
// are available without a network round-trip.
const CACHE_NAME = "smokear-v1";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: always prefer live data, only fall back when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(request)) ?? (await cache.match(OFFLINE_URL));
      }),
    );
    return;
  }

  // Static, rarely-changing assets: cache-first, filling the cache lazily.
  if (url.pathname.startsWith("/icons/") || url.pathname === "/manifest.webmanifest") {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
  }
});
