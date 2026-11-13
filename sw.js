const C='aung-gas-pos-v4',F=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>(x.startsWith('aung-gas-pos-')&&x!==C)||/^aung-pos-v\d+$/.test(x)).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.open(C).then(c=>c.match(e.request,{ignoreSearch:true})).then(r=>r||fetch(e.request).catch(()=>caches.open(C).then(c=>c.match('./index.html')))))});
