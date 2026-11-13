const CACHE="mob-board-v16";
const ASSETS=[
  "/",
  "/styles.css?v=board16",
  "/app.js?v=board16",
  "/assets/board-world.png",
  "/assets/home-background.webp",
  "/assets/crew-panel.webp",
  "/assets/schedule-panel.webp",
  "/assets/team-rentiere.svg",
  "/assets/team-gluehwein.svg",
  "/assets/team-lametta.svg",
  "/assets/icon-mission.svg",
  "/assets/icon-secret.svg",
  "/assets/icon-chaos.svg",
  "/assets/icon-song.svg",
  "/assets/icon-finish.svg",
  "/assets/nav-home.svg",
  "/assets/nav-board.svg",
  "/assets/nav-mail.svg",
  "/assets/nav-admin.svg"
];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.url.includes('/api/')) return;
  e.respondWith(
    fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match(e.request))
  )
})
