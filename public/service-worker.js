// DelcoHelp Service Worker — enables offline support and "Add to Home Screen"
const CACHE_NAME = "delcohelp-v1";
const OFFLINE_URL = "/offline.html";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Install — cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Don't cache API calls
  if (event.request.url.includes("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match(OFFLINE_URL);
        });
      })
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || "Open DelcoHelp for details",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "delcohelp-notification",
    data: { url: data.url || "/" },
    actions: [
      { action: "open", title: "Open App" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title || "DelcoHelp", options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/")
  );
});
