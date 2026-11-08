const SHELL = "giappone-shell-v1", TILES = "giappone-tiles-v1";
const FILES = ["./", "index.html", "data.enc.json", "manifest.json", "icon-192.png", "icon-512.png",
  "leaflet/leaflet.js", "leaflet/leaflet.css", "leaflet/images/marker-icon.png",
  "leaflet/images/marker-icon-2x.png", "leaflet/images/marker-shadow.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => ![SHELL, TILES].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.hostname.endsWith("arcgisonline.com")) {
    // Le tessere giÃ  viste restano disponibili offline
    e.respondWith(caches.open(TILES).then(c => c.match(e.request).then(hit => hit ||
      fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (u.origin === location.origin) {
    // Network first per avere sempre i dati aggiornati, cache come ripiego offline
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(SHELL).then(c => c.put(e.request, copy)); return r;
    }).catch(() => caches.match(e.request)));
  }
});
