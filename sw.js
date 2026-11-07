const V='ca-v21',SHELL=['./','index.html','owner.html','shop.html','icon-192.png','lang.js','install.js','rate.js','og-image.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin)return; // لا نخزّن أي بيانات من Supabase
 e.respondWith(fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(ch=>ch.put(r,c))}return x}).catch(()=>caches.match(r,{ignoreSearch:true})))});

// إشعارات الموبايل (Web Push): بتوصل حتى لو التطبيق مقفول
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={title:'AI Agent',body:e.data&&e.data.text()}}
 e.waitUntil(self.registration.showNotification(d.title||'AI Agent',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',dir:'rtl',lang:'ar',tag:d.tag||'radd',renotify:true,data:{url:d.url||'./'}}))});
// الضغط على الإشعار يفتح الصفحة الصح (لوحة الأونر أو لوحة الأدمن)، مش أي نافذة مفتوحة
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope);
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){const w=new URL(c.url);if(w.origin===u.origin&&w.pathname===u.pathname&&'focus' in c)return c.focus()}return clients.openWindow(u.href)}))});
