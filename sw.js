// service worker: temel dosyaları önbelleğe al, görselleri kullanıldıkça sakla
// CACHE adını değiştirmek eski önbelleği temizletir (sürüm yükseltme yöntemi)
const CACHE = "nt2-spreken-v1";
const CORE = [
  "./",
  "./index.html",
  "./spreken_data.js",
  "./spreken_extra.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // eski sürüm önbelleklerini temizle
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit; // önbellekte varsa oradan (çevrimdışı çalışma)
      return fetch(e.request).then((res) => {
        // başarılı yanıtları önbelleğe ekle (görseller dahil)
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});
