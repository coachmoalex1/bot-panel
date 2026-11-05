/* نافذة تثبيت التطبيق (مشتركة بين اللوحة والمتجر) */
(function(){
var D=document,ip=null,L=localStorage.getItem('lang')||'ar';
var X={
ar:{t:'ثبّت التطبيق على موبايلك',b:['يفتح بضغطة من الشاشة الرئيسية','شاشة كاملة بدون شريط المتصفح','أسرع وأسهل في كل مرة'],go:'تثبيت الآن',later:'مش دلوقتي',ios:['اضغط زر المشاركة ⬆️ أسفل المتصفح','اختار «إضافة إلى الشاشة الرئيسية»','اضغط «إضافة»'],and:['افتح قائمة المتصفح ⋮','اختار «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»'],ok:'التطبيق متثبّت بالفعل ✅',must:'التثبيت مطلوب لاستخدام لوحة التحكم',bar:'📲 ثبّت التطبيق على موبايلك',done:'تم التثبيت ✅ افتح التطبيق من الشاشة الرئيسية',how:'الخطوات:'},
en:{t:'Install the app on your phone',b:['One tap from your home screen','Full screen, no browser bar','Faster every time'],go:'Install now',later:'Not now',ios:['Tap the Share button ⬆️ in your browser','Choose “Add to Home Screen”','Tap “Add”'],and:['Open the browser menu ⋮','Choose “Install app” or “Add to Home screen”'],ok:'Already installed ✅',must:'Installing the app is required to use the dashboard',bar:'📲 Install the app on your phone',done:'Installed ✅ Open it from your home screen',how:'Steps:'}};
var gate=D.documentElement.getAttribute('data-gate')==='1'&&/android|iphone|ipad|ipod/i.test(navigator.userAgent)&&!std()&&location.search.indexOf('nogate=1')<0;
function T(){return X[L==='en'?'en':'ar']}
function std(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
function ios(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
var st=D.createElement('style');
st.textContent='#ins-o{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:60;display:none;align-items:flex-end;justify-content:center;font-family:Tajawal,system-ui,sans-serif}#ins-o>div{background:var(--card,#fff);color:var(--ink,#0f2238);width:100%;max-width:560px;border-radius:24px 24px 0 0;padding:18px 18px calc(20px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(0,0,0,.35);animation:insup .28s ease}@keyframes insup{from{transform:translateY(40px);opacity:0}}#ins-o .ic{width:72px;height:72px;border-radius:18px;object-fit:cover;display:block;margin:0 auto 10px;box-shadow:0 6px 18px rgba(0,0,0,.25);background:var(--acc,#1e6fd9)}#ins-o h2{margin:0 0 10px;font-size:20px;text-align:center}#ins-o ul{list-style:none;margin:0 0 14px;padding:0}#ins-o li{padding:6px 0;font-size:15px}#ins-o li:before{content:"✓";color:var(--acc,#1e6fd9);font-weight:800;margin-inline-end:8px}#ins-o ol{margin:6px 0 14px;padding-inline-start:22px;line-height:1.9;font-size:15px}#ins-o button{width:100%;min-height:48px;border:0;border-radius:14px;font:700 16px Tajawal,system-ui,sans-serif;cursor:pointer;background:var(--acc,#1e6fd9);color:#fff;margin-bottom:8px}#ins-o button.g{background:transparent;color:var(--mute,#5b7089)}@media(prefers-color-scheme:dark){#ins-o button{color:#06182c}}';
D.head.appendChild(st);
function icon(){var l=D.querySelector('link[rel=apple-touch-icon]')||D.querySelector('link[rel=icon]');return l?l.href:'icon-192.png'}
function close(){if(gate&&!std())return;var o=D.getElementById('ins-o');if(o)o.style.display='none'}
function show(auto,force){
  if(std()){if(!auto)alert(T().ok);return}
  var t=T(),o=D.getElementById('ins-o');if(!o){o=D.createElement('div');o.id='ins-o';D.body.appendChild(o);}
  var h='<div><img class="ic" alt="" src="'+icon()+'"><h2>'+t.t+'</h2><ul>'+t.b.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>';
  if(ip)h+='<button id="ins-go">'+t.go+'</button>';
  else h+='<b>'+t.how+'</b><ol>'+(ios()?t.ios:t.and).map(function(x){return '<li>'+x+'</li>'}).join('')+'</ol>';
  if(!force)h+='<button class="g" id="ins-x">'+t.later+'</button>';else h+='<p style="text-align:center;opacity:.7;font-size:13px;margin:4px 0 0">'+t.must+'</p>';h+='</div>';o.innerHTML=h;o.style.display='flex';o.style.background=force?'var(--bg,#0a1626)':'';
  var g=D.getElementById('ins-go');if(g)g.onclick=function(){var e=ip;ip=null;e.prompt();e.userChoice.then(close,close)};
  var xx=D.getElementById('ins-x');if(xx)xx.onclick=later}
function later(){try{sessionStorage.setItem('ins_off','1')}catch(e){}close()}
addEventListener('beforeinstallprompt',function(e){e.preventDefault();ip=e});
addEventListener('appinstalled',close);
window.raddInstall=function(){show(false)};
window.raddCanInstall=function(){return !std()};
function auto(){if(gate)return;var off=0;try{off=sessionStorage.getItem('ins_off')}catch(e){}
  if(std()||off)return;
  var n=0,iv=setInterval(function(){n++;if(ip){clearInterval(iv);show(true)}else if(ios()||n>6){clearInterval(iv);show(true)}},700)}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',auto);else auto();

function bar(){if(std()||D.getElementById('ins-bar'))return;var b=D.createElement('button');b.id='ins-bar';b.textContent=T().bar;
  b.style.cssText='display:block;width:100%;border:0;padding:11px 8px;background:var(--acc,#1e6fd9);color:#fff;font:700 15px Tajawal,system-ui,sans-serif;cursor:pointer';
  b.onclick=function(){show(false,gate)};D.body.insertBefore(b,D.body.firstChild)}
function boot(){bar();if(gate)show(true,true)}
addEventListener('appinstalled',function(){var o=D.getElementById('ins-o'),bb=D.getElementById('ins-bar');if(bb)bb.remove();if(gate&&o){o.innerHTML='<div><h2>'+T().done+'</h2></div>';o.style.display='flex'}});
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
})();
