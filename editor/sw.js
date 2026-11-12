/* Agorà Studio: cache soltanto della schermata pubblica, mai di dati privati. */
const VERSION='agora-studio-v20261112';
const FILES=['/editor/','/editor/studio.css?v=20261112','/editor/studio.js?v=20261112','/editor/manifest.webmanifest','/assets/agora_icon.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('agora-studio-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
 if(!new URL(request.url).pathname.startsWith('/editor/'))return;
 event.respondWith(fetch(request).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(VERSION).then(c=>c.put(request,copy));}return resp;}).catch(()=>caches.match(request)));
});
