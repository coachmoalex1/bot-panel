/* نافذة تثبيت التطبيق (مشتركة بين اللوحة والمتجر) */
(function(){
var D=document,ip=null,L=localStorage.getItem('lang')||'ar';
var X={
ar:{t:'ثبّت التطبيق على موبايلك',b:['يفتح بضغطة من الشاشة الرئيسية','شاشة كاملة بدون شريط المتصفح','أسرع وأسهل في كل مرة'],go:'تثبيت الآن',later:'مش دلوقتي',ios:['اضغط زر المشاركة ⬆️ أسفل المتصفح','اختار «إضافة إلى الشاشة الرئيسية»','اضغط «إضافة»'],and:['افتح قائمة المتصفح ⋮','اختار «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»'],ok:'التطبيق متثبّت بالفعل ✅',how:'الخطوات:'},
en:{t:'Install the app on your phone',b:['One tap from your home screen','Full screen, no browser bar','Faster every time'],go:'Install now',later:'Not now',ios:['Tap the Share button ⬆️ in your browser','Choose “Add to Home Screen”','Tap “Add”'],and:['Open the browser menu ⋮','Choose “Install app” or “Add to Home screen”'],ok:'Already installed ✅',how:'Steps:'}};
function T(){return X[L==='en'?'en':'ar']}
function std(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
function ios(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
var st=D.createElement('style');
st.textContent='#ins-o{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:60;display:none;align-items:flex-end;justify-content:center;font-family:Tajawal,system-ui,sans-serif}#ins-o>div{background:var(--card,#fff);color:var(--ink,#14231e);width:100%;max-width:560px;border-radius:24px 24px 0 0;padding:18px 18px calc(20px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(0,0,0,.35);animation:insup .28s ease}@keyframes insup{from{transform:translateY(40px);opacity:0}}#ins-o .ic{width:72px;height:72px;border-radius:18px;object-fit:cover;display:block;margin:0 auto 10px;box-shadow:0 6px 18px rgba(0,0,0,.25);background:var(--acc,#0f6b57)}#ins-o h2{margin:0 0 10px;font-size:20px;text-align:center}#ins-o ul{list-style:none;margin:0 0 14px;padding:0}#ins-o li{padding:6px 0;font-size:15px}#ins-o li:before{content:"✓";color:var(--acc,#0f6b57);font-weight:800;margin-inline-end:8px}#ins-o ol{margin:6px 0 14px;padding-inline-start:22px;line-height:1.9;font-size:15px}#ins-o button{width:100%;min-height:48px;border:0;border-radius:14px;font:700 16px Tajawal,system-ui,sans-serif;cursor:pointer;background:var(--acc,#0f6b57);color:#fff;margin-bottom:8px}#ins-o button.g{background:transparent;color:var(--mute,#6b7a73)}@media(prefers-color-scheme:dark){#ins-o button{color:#0b1f19}}';
D.head.appendChild(st);
function icon(){var l=D.querySelector('link[rel=apple-touch-icon]')||D.querySelector('link[rel=icon]');return l?l.href:'icon-192.png'}
function close(){var o=D.getElementById('ins-o');if(o)o.style.display='none'}
function show(auto){
  if(std()){if(!auto)alert(T().ok);return}
  var t=T(),o=D.getElementById('ins-o');if(!o){o=D.createElement('div');o.id='ins-o';D.body.appendChild(o);o.onclick=function(e){if(e.target===o)later()}}
  var h='<div><img class="ic" alt="" src="'+icon()+'"><h2>'+t.t+'</h2><ul>'+t.b.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>';
  if(ip)h+='<button id="ins-go">'+t.go+'</button>';
  else h+='<b>'+t.how+'</b><ol>'+(ios()?t.ios:t.and).map(function(x){return '<li>'+x+'</li>'}).join('')+'</ol>';
  h+='<button class="g" id="ins-x">'+t.later+'</button></div>';o.innerHTML=h;o.style.display='flex';
  var g=D.getElementById('ins-go');if(g)g.onclick=function(){var e=ip;ip=null;e.prompt();e.userChoice.then(close,close)};
  D.getElementById('ins-x').onclick=later}
function later(){try{localStorage.setItem('ins_off',String(Date.now()))}catch(e){}close()}
addEventListener('beforeinstallprompt',function(e){e.preventDefault();ip=e});
addEventListener('appinstalled',close);
window.raddInstall=function(){show(false)};
window.raddCanInstall=function(){return !std()};
function auto(){var off=0;try{off=+localStorage.getItem('ins_off')||0}catch(e){}
  if(std()||Date.now()-off<7*864e5)return;
  setTimeout(function(){if(ip||ios())show(true)},6000)}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',auto);else auto();
})();
