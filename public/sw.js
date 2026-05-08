// Minimal app-shell service worker. The session experience must work
// offline (a user in a loop on the subway needs it). Auth and the
// start/end of sessions can fail gracefully.
// (playbook §10)

const CACHE_NAME = "ocd2now-shell-v1";
const SHELL = ["/", "/now", "/session", "/end", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL).catch(() => undefined)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never cache Supabase / auth requests.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/auth")) return;
  if (url.pathname.startsWith("/api")) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => undefined);
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit ?? Response.error())),
  );
});
