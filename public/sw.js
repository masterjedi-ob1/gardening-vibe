// GardZen service worker — offline shell + cache-first for static assets
const CACHE = "gardzen-v1";
const SHELL = ["/", "/garden", "/journal", "/checkin", "/coach", "/diagnose"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Let API and Supabase requests always go to network
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase")) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => cached ?? fetch(e.request))
  );
});
