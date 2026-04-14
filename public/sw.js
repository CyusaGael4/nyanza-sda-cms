const CACHE_NAME = "nyanza-sda-v2";
const STATIC_ASSETS = [
  "/",
  "/login",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
            return Promise.resolve();
          })
        )
      )
    ])
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isPageRequest = event.request.mode === "navigate";

  if (!isSameOrigin) return;

  if (!isPageRequest) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached ||
        fetch(event.request).then((response) => {
          if (!response.ok) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
      )
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response.ok) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          return caches.match("/");
        })
      )
  );
});
        .then((response) => {
          if (!response.ok) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("/"));
    })
  );
});
