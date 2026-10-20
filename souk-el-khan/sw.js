// network first so updates show at once; the cache is only the offline fallback
// shortcut: caches every GET (fonts included) with no size cap, fine for one small game
const C='souk-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone(); caches.open(C).then(k=>k.put(e.request,c)); return r;})
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
