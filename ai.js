(function(){
'use strict';
var cfg=window.AI_CONFIG||{},hist=[],busy=false,pre='';
var STOP='the a an is are of for to in on and or with what which how do does can i me my we our you your it this that give tell about want wants need customer says say please any best use used using'.split(' ');
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function T(){return window.TRV}
function toks(t){return String(t||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(function(x){return x.length>2&&STOP.indexOf(x)<0})}
function rank(text){
  var db=T().db(),tk=toks(text);if(!tk.length)return[];
  return db.f.map(function(f){var s=0;tk.forEach(function(t){s+=T().score(f,t)});return{f:f,s:s}})
    .filter(function(x){return x.s>0}).sort(function(a,b){return b.s-a.s}).map(function(x){return x.f})}
var APPN={F:'Floor cleaner',D:'Detergent',W:'Dishwash',T:'Toilet/bathroom',P:'Phenyl',S:'Fabric softener',A:'Air freshener'};
// Private "My notes" (price, stock, feedback) are NEVER sent.
function ctx(text){
  var db=T().db(),top=rank(text).slice(0,5);
  var all=db.f.map(function(f){return f.name+' ('+f.family+'; '+f.apps.map(function(c){return APPN[c]}).join('/')+')'}).join('\n');
  var det=top.map(function(f){return f.name+' | '+f.family+' | '+f.smell+' | Top: '+f.top+' | Heart: '+f.heart+' | Base: '+f.base+' | Suitable: '+f.apps.map(function(c){return APPN[c]}).join(', ')+' | Sell: '+f.sell+(f.avoid?' | Note: '+f.avoid:'')}).join('\n');
  var tk=toks(text),w=db.w.filter(function(x){var k=x.word.toLowerCase();return tk.some(function(t){return k.indexOf(t)>-1})}).slice(0,6).map(function(x){return x.word+': '+x.meaning}).join('\n');
  return 'CATALOGUE (all fragrances):\n'+all+'\n\nMOST RELEVANT DETAILS:\n'+(det||'none')+(w?'\n\nGLOSSARY:\n'+w:'')}
function fmt(t){
  var h=esc(t).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>'),out='',inl=false;
  h.split('\n').forEach(function(l){
    if(/^\s*[-*]\s+/.test(l)){if(!inl){out+='<ul>';inl=true}out+='<li>'+l.replace(/^\s*[-*]\s+/,'')+'</li>'}
    else{if(inl){out+='</ul>';inl=false}if(l.trim())out+='<p>'+l+'</p>'}});
  return out+(inl?'</ul>':'')}
function localAnswer(text){
  var r=rank(text).slice(0,3);
  if(!r.length)return{html:'<p>No match in the catalogue. Try a smell (rose, lemon, camphor) or a product (dishwash, softener).</p>'};
  return{html:'<p>From your catalogue:</p><ul>'+r.map(function(f){return '<li><a href="#/f/'+f.id+'"><b>'+esc(f.name)+'</b></a> - '+esc(f.smell)+'</li>'}).join('')+'</ul>'}}
function bubble(m){
  if(m.role==='user')return '<div class="msg u">'+esc(m.content)+'</div>';
  var src=(m.sources||[]).map(function(s){return '<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||s.url)+'</a>'}).join('');
  return '<div class="msg a'+(m.err?' err':'')+'">'+(m.html||fmt(m.content))+(src?'<div class="src">Web sources:'+src+'</div>':'')+'</div>'}
function render(){
  var el=document.getElementById('chat');if(!el)return;
  el.innerHTML=hist.map(bubble).join('')+(busy?'<div class="msg a"><span class="dots"><span>&bull;</span><span>&bull;</span><span>&bull;</span></span></div>':'');
  window.scrollTo(0,document.body.scrollHeight)}
async function ask(text){
  text=String(text||'').trim();if(!text||busy)return;
  hist.push({role:'user',content:text});busy=true;render();
  var web=document.getElementById('web');web=web?web.checked:true;
  try{
    if(!cfg.endpoint)throw new Error('noendpoint');
    if(!navigator.onLine)throw new Error('offline');
    var msgs=hist.filter(function(m){return !m.err&&!m.local}).slice(-8).map(function(m){return{role:m.role,content:m.content.slice(0,1500)}});
    while(msgs.length&&msgs[0].role!=='user')msgs.shift();
    var ac=new AbortController(),to=setTimeout(function(){ac.abort()},60000);
    var r=await fetch(cfg.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},signal:ac.signal,body:JSON.stringify({messages:msgs,context:ctx(text+' '+hist.slice(-3).map(function(m){return m.content}).join(' ')),web:web})});
    clearTimeout(to);
    var j=await r.json().catch(function(){return{}});
    if(!r.ok||!j.answer)throw new Error(j.error||'server');
    hist.push({role:'assistant',content:j.answer,sources:j.sources||[]})
  }catch(e){
    var la=localAnswer(text),why=e.message==='noendpoint'?'AI is not set up yet (see README, step B). Showing catalogue search instead.':!navigator.onLine||e.message==='offline'?'You are offline. Showing catalogue search instead.':'AI is not reachable right now. Showing catalogue search instead.';
    hist.push({role:'assistant',content:why,html:'<p><i>'+esc(why)+'</i></p>'+la.html,local:true})}
  busy=false;render()}
function view(root){
  var sugg=['Which fragrance is best for dishwash?','Customer wants a strong kapoor (camphor) smell','What is the difference between top, middle and base notes?','What dosage is normal for fragrance in floor cleaner?'];
  root.innerHTML='<div class="card"><h2>Ask AI</h2><div class="mut">Answers customer doubts using your catalogue'+(cfg.endpoint?' and the internet':'')+'. Do not type customer phone numbers or personal details. <a href="privacy.html">Privacy</a></div>'+
   '<label class="chk"><input type="checkbox" id="web" checked> Search the internet if needed</label></div>'+
   '<div id="chat"></div>'+
   (hist.length?'':'<div class="chips" style="flex-wrap:wrap">'+sugg.map(function(s){return '<button class="chip" data-q="'+esc(s)+'">'+esc(s)+'</button>'}).join('')+'</div>')+
   '<div class="composer"><div class="row"><input type="text" id="aq" placeholder="Type the customer\'s doubt..." autocomplete="off"><button class="btn y" id="as">Ask</button></div>'+
   (hist.length?'<div class="mut" style="margin-top:6px"><a href="#" id="ac2">Clear chat</a> &middot; AI can make mistakes. Confirm technical details with Givaudan.</div>':'')+'</div>';
  var go=function(){var i=document.getElementById('aq'),v=i.value;i.value='';ask(v).then(function(){if(!document.getElementById('ac2'))view(root)})};
  document.getElementById('as').onclick=go;
  document.getElementById('aq').onkeydown=function(e){if(e.key==='Enter')go()};
  root.querySelectorAll('[data-q]').forEach(function(b){b.onclick=function(){ask(b.dataset.q).then(function(){view(root)})}});
  var c=document.getElementById('ac2');if(c)c.onclick=function(e){e.preventDefault();hist=[];view(root)};
  render();
  if(pre){var p=pre;pre='';ask(p).then(function(){view(root)})}}
document.addEventListener('click',function(e){
  var a=e.target.closest('[data-ask]');if(!a)return;
  e.preventDefault();pre=a.getAttribute('data-ask');location.hash='#/ai'});
window.TRV_AI={view:view,ask:ask};
})();
