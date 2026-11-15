(function(){
'use strict';
var APPS={F:'Floor cleaner',D:'Detergent',W:'Dishwash',T:'Toilet & bathroom',P:'Phenyl / disinfectant',S:'Fabric softener',A:'Air freshener / room spray'};
var ALIAS={F:'floor mop surface',D:'detergent powder liquid washing wash',W:'dishwash dish vessel utensil',T:'toilet bathroom bowl lavatory',P:'phenyl disinfectant',S:'softener conditioner fabric',A:'air freshener room spray freshner'};
var db, $=function(s){return document.querySelector(s)}, app=$('#app'), q=$('#q');
var st={apps:[],fam:'',star:false};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
function uid(){if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16)})}
function toast(m){var t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}
function seed(){
  var f=window.SEED_RAW.split('\n').map(function(l){var p=l.split('|');
    return{id:uid(),name:p[0],apps:p[1].split(''),family:p[2],smell:p[3],top:p[4],heart:p[5],base:p[6],sell:p[7],keywords:p[8],avoid:p[9],notes:'',tier:p[10]||'Standard',star:false}});
  return{f:f,w:window.SEED_WORDS.map(function(w){return{id:uid(),word:w[0],meaning:w[1]}})};
}
var sb=null,snapF={},snapW={},syncing=false,pending=false,syncT=null,CK='trv_cache_v2';
function rowF(f){return{id:f.id,name:f.name,family:f.family||'',apps:f.apps||[],smell:f.smell||'',top:f.top||'',middle:f.heart||'',base:f.base||'',sell:f.sell||'',keywords:f.keywords||'',avoid:f.avoid||'',notes:f.notes||'',tier:f.tier||'Standard',star:!!f.star}}
function fromF(r){return{id:r.id,name:r.name,family:r.family||'',apps:r.apps||[],smell:r.smell||'',top:r.top||'',heart:r.middle||'',base:r.base||'',sell:r.sell||'',keywords:r.keywords||'',avoid:r.avoid||'',notes:r.notes||'',tier:r.tier||'Standard',star:!!r.star}}
function rowW(w){return{id:w.id,word:w.word,meaning:w.meaning||''}}
function curMap(list,fn){var o={};list.forEach(function(x){o[x.id]=JSON.stringify(fn(x))});return o}
function dirty(){var a=curMap(db.f,rowF),b=curMap(db.w,rowW);return JSON.stringify(a)!==JSON.stringify(snapF)||JSON.stringify(b)!==JSON.stringify(snapW)}
function save(){try{localStorage.setItem(CK,JSON.stringify(db))}catch(e){}
  if(sb){clearTimeout(syncT);syncT=setTimeout(sync,400)}}
async function pushTable(tab,list,fn,snap){
  var cur=curMap(list,fn),del=Object.keys(snap).filter(function(id){return !(id in cur)}),
      up=list.filter(function(x){return snap[x.id]!==cur[x.id]}).map(fn),r;
  if(del.length){r=await sb.from(tab).delete().in('id',del);if(r.error)throw r.error}
  for(var i=0;i<up.length;i+=100){r=await sb.from(tab).upsert(up.slice(i,i+100),{onConflict:'id'});if(r.error)throw r.error}
  return cur}
async function sync(){
  if(!sb)return;if(syncing){pending=true;return}syncing=true;
  try{snapF=await pushTable('fragrances',db.f,rowF,snapF)}catch(e){syncing=false;toast('Saved on phone. Will sync when online.');console.warn(e);return}
  try{snapW=await pushTable('words',db.w,rowW,snapW)}catch(e){console.warn('words not synced',e)}
  syncing=false;if(pending){pending=false;sync()}}
async function pull(){
  var r=await sb.from('fragrances').select('*').order('name');if(r.error)throw r.error;
  var w=await sb.from('words').select('*'),words=w.error?null:w.data,sd=null;
  if(!r.data.length){sd=seed();db={f:sd.f,w:words&&words.length?words.map(function(x){return{id:x.id,word:x.word,meaning:x.meaning}}):sd.w};snapF={};snapW=words?curMap(words,rowW):{};save();return}
  db={f:r.data.map(fromF),w:db&&db.w&&db.w.length?db.w:[]};
  snapF=curMap(db.f,rowF);
  if(words&&words.length){db.w=words.map(function(x){return{id:x.id,word:x.word,meaning:x.meaning||''}});snapW=curMap(db.w,rowW)}
  else{db.w=seed().w;snapW={};if(words)save()}
  try{localStorage.setItem(CK,JSON.stringify(db))}catch(e){}}
function loginView(msg){
  $('.sb').style.display='none';$('#nav').style.display='none';$('#fab').style.display='none';$('#cnt').textContent='';
  app.innerHTML='<div class="card"><h2>Login</h2><div class="mut">Use the email and password created in Supabase.</div><label>Email</label><input type="text" id="em" autocomplete="username" autocapitalize="off"><label>Password</label><input type="password" id="pw" autocomplete="current-password" style="width:100%;border:1px solid #888;border-radius:4px;padding:9px;font:inherit"><p style="color:var(--bad)" id="lm">'+esc(msg||'')+'</p><button class="btn y" id="li">Sign in</button></div>';
  var go=async function(){var r=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value});if(r.error){$('#lm').textContent=r.error.message;return}start()};
  $('#li').onclick=go;$('#pw').onkeydown=function(e){if(e.key==='Enter')go()}}
async function start(){
  $('.sb').style.display='';$('#nav').style.display='';
  var ok=false;
  if(sb){try{await pull();ok=true}catch(e){console.warn(e)}}
  if(!ok){try{var c=localStorage.getItem(CK);if(c)db=JSON.parse(c)}catch(e){}
    if(!db||!db.f){if(sb){loginView('Could not connect. Check internet and try again.');return}db=seed();save()}
    if(sb)toast('Offline: showing saved copy')}
  route()}
async function boot(){
  var cfg=window.SUPA,lib=window.supabase;
  if(cfg&&cfg.url&&cfg.key&&lib&&lib.createClient){
    sb=lib.createClient(cfg.url,cfg.key);
    var s=await sb.auth.getSession();if(!s.data.session){loginView();return}}
  await start()}
document.addEventListener('visibilitychange',function(){
  if(document.visibilityState!=='visible'||!sb||!db||syncing||dirty())return;
  var before=JSON.stringify(db.f);pull().then(function(){if(JSON.stringify(db.f)!==before)route()}).catch(function(){})});
window.addEventListener('online',function(){if(sb&&db)sync()});
function byId(id){return db.f.find(function(x){return x.id===id})}
function lev1(a,b){if(Math.abs(a.length-b.length)>1)return false;var i=0,j=0,d=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue}if(++d>1)return false;if(a.length>b.length)i++;else if(a.length<b.length)j++;else{i++;j++}}return d+(a.length-i)+(b.length-j)<=1}
function hay(f){return{
  nm:norm(f.name),kw:norm(f.keywords),fam:norm(f.family),
  ap:norm(f.apps.map(function(c){return APPS[c]+' '+ALIAS[c]}).join(' ')),
  sm:norm(f.smell),nt:norm([f.top,f.heart,f.base,f.sell,f.notes,f.avoid,f.tier].join(' '))}}
function score(f,query){
  var toks=norm(query).split(' ').filter(Boolean);if(!toks.length)return 0;
  var h=hay(f),nmc=h.nm.replace(/ /g,''),tot=0;
  for(var i=0;i<toks.length;i++){var t=toks[i],s=0;
    if(h.nm===t||nmc===t)s=100;
    else if(h.nm.indexOf(t)===0||nmc.indexOf(t)===0)s=85;
    else if(h.nm.split(' ').some(function(w){return w.indexOf(t)===0}))s=75;
    else if(h.nm.indexOf(t)>-1||nmc.indexOf(t)>-1)s=60;
    else if((' '+h.kw).indexOf(' '+t)>-1)s=50;
    else if(h.fam.indexOf(t)>-1)s=40;
    else if(h.ap.indexOf(t)>-1)s=35;
    else if(h.sm.indexOf(t)>-1)s=30;
    else if(h.nt.indexOf(t)>-1)s=15;
    else if(t.length>=4&&h.nm.split(' ').some(function(w){return lev1(w,t)}))s=45;
    else if(t.length>=4&&h.kw.split(' ').some(function(w){return lev1(w,t)}))s=25;
    else return 0;
    tot+=s}
  return tot+(f.star?6:0)}
function results(){
  var query=q.value,list=db.f.filter(function(f){
    if(st.star&&!f.star)return false;
    if(st.fam&&f.family!==st.fam)return false;
    return st.apps.every(function(c){return f.apps.indexOf(c)>-1})});
  if(norm(query)){
    list=list.map(function(f){return{f:f,s:score(f,query)}}).filter(function(x){return x.s>0}).sort(function(a,b){return b.s-a.s||a.f.name.localeCompare(b.f.name)}).map(function(x){return x.f})}
  else list.sort(function(a,b){return (b.star-a.star)||a.name.localeCompare(b.name)});
  return list}
function appChips(f,full){return f.apps.map(function(c){return '<span class="ap">'+esc(full?APPS[c]:APPS[c].split(' ')[0].replace('&',''))+'</span>'}).join('')}
function card(f,i,hasQ){
  return '<a class="card item" href="#/f/'+f.id+'"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><div style="min-width:0"><h3>'+
   (hasQ&&i===0?'<span class="tag">Best match</span>':'')+esc(f.name)+(f.tier==='Premium'?' <span class="tag p">Premium</span>':'')+'</h3><span class="fam"><i></i>'+esc(f.family||'')+'</span></div>'+
   '<button class="star'+(f.star?' on':'')+'" data-star="'+f.id+'" aria-label="Priority">'+(f.star?'\u2605':'\u2606')+'</button></div>'+
   '<div class="smell">'+esc(f.smell)+'</div><div style="margin-top:8px">'+appChips(f)+'</div>'+
   '<div class="row" style="justify-content:space-between;margin-top:8px">'+(f.sell?'<span class="mut">'+esc(f.sell)+'</span>':'<span></span>')+'<span class="fl">Formula \u203A</span></div></a>'}
function families(){var o={};db.f.forEach(function(f){if(f.family)o[f.family]=1});return Object.keys(o).sort()}
function home(top){
  if(top){st.star=true}
  var h='<div class="chips" id="ac">'+Object.keys(APPS).map(function(c){return '<button class="chip'+(st.apps.indexOf(c)>-1?' on':'')+'" data-app="'+c+'">'+esc(APPS[c])+'</button>'}).join('')+'</div>'+
   '<div class="chips" id="fc"><button class="chip'+(st.star?' on':'')+'" data-star-f="1">\u2605 Top picks</button>'+families().map(function(x){return '<button class="chip'+(st.fam===x?' on':'')+'" data-fam="'+esc(x)+'">'+esc(x)+'</button>'}).join('')+'</div><div id="res"></div>';
  app.innerHTML=h;renderRes()}
function renderRes(){
  var r=results(),hasQ=!!norm(q.value),el=$('#res');if(!el)return;
  $('#clr').hidden=!q.value;
  el.innerHTML='<div class="mut">'+r.length+' of '+db.f.length+' fragrances'+(hasQ?' for "'+esc(q.value)+'"':'')+(st.apps.length||st.fam||st.star?' <a href="#/" id="rst">Clear filters</a>':'')+'</div>'+
   (r.length?r.map(function(f,i){return card(f,i,hasQ)}).join(''):'<div class="card">No match. Try fewer words, a smell (rose, lemon, camphor) or a product (dishwash, softener). <a href="#/new">Add this fragrance</a> or <a href="#/ai" data-ask="'+esc('Customer is asking for: '+q.value+'. Which of our fragrances fit?')+'">Ask</a></div>')}
function detail(id){
  var f=byId(id);if(!f){app.innerHTML='<div class="card">Not found. <a href="#/">Back</a></div>';return}
  var ok=f.apps.map(function(c){return '<span class="ap ok">\u2713 '+esc(APPS[c])+'</span>'}).join('');
  var sim=db.f.filter(function(x){return x.id!==f.id&&x.family===f.family}).slice(0,6).map(function(x){return '<a class="ap" href="#/f/'+x.id+'">'+esc(x.name)+'</a>'}).join('');
  app.innerHTML='<a class="back" href="#/">\u2039 Back to results</a>'+
   '<div class="dhead"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><div style="min-width:0"><span class="fam"><i></i>'+esc(f.family||'Fragrance')+'</span>'+(f.tier==='Premium'?' <span class="tag p">Premium</span>':'')+'<h2 class="dname">'+esc(f.name)+'</h2></div>'+
   '<button class="star big-star'+(f.star?' on':'')+'" data-star="'+f.id+'" aria-label="Top pick">'+(f.star?'\u2605':'\u2606')+'</button></div></div>'+
   '<div class="card"><div class="sec-t"><span class="ico">\u266A</span> Smell profile</div><p class="smelltxt">'+esc(f.smell||'-')+'</p></div>'+
   '<div class="card"><div class="sec-t">Notes (top, middle, base)</div>'+
   '<div class="note"><b>TOP NOTES</b><span>'+esc(f.top||'-')+'</span></div>'+
   '<div class="note"><b>MIDDLE NOTES</b><span>'+esc(f.heart||'-')+'</span></div>'+
   '<div class="note"><b>BASE NOTES</b><span>'+esc(f.base||'-')+'</span></div></div>'+
   '<div class="card"><div class="sec-t">Suitable applications</div><div>'+(ok||'<span class="mut">None listed. Edit to add.</span>')+'</div></div>'+
   (f.sell?'<div class="pitch"><div class="sec-t">Tell the customer</div><p>'+esc(f.sell)+'</p><button class="btn" id="cp">Copy pitch</button></div>':'')+
   (f.avoid?'<div class="card warnc"><b>Note:</b> '+esc(f.avoid)+'</div>':'')+
   (f.keywords?'<div class="card"><div class="sec-t">Customer may say</div><div class="mut">'+esc(f.keywords.split(',').join(', '))+'</div></div>':'')+
   '<div class="card"><div class="sec-t">My notes</div><div style="white-space:pre-wrap">'+(f.notes?esc(f.notes):'<span class="mut">Nothing yet. Tap Edit to add price, stock or customer feedback.</span>')+'</div></div>'+
   (sim?'<div class="card"><div class="sec-t">Similar ('+esc(f.family)+')</div><div>'+sim+'</div></div>':'')+
   '<p class="mut small">Always ask the customer to test the sample in their own base. Confirm dosage and stability with Givaudan.</p>'+
   '<div class="dbtns"><a class="btn y" href="#/edit/'+f.id+'">Edit</a><button class="btn" id="shr">Share</button><button class="btn" data-ask="'+esc('Tell me about '+f.name+': best uses, how to pitch it, and what to tell a customer who has doubts about it.')+'">Ask AI</button><button class="btn r" id="del">Delete</button></div>';
  var cp=$('#cp');if(cp)cp.onclick=function(){var t=f.sell||'';if(navigator.clipboard){navigator.clipboard.writeText(t);toast('Pitch copied')}else toast('Copy not supported')};
  $('#shr').onclick=function(){var t=f.name+' ('+f.family+')\n'+f.smell+'\nTop: '+f.top+' | Heart: '+f.heart+' | Base: '+f.base+'\nSuitable for: '+f.apps.map(function(c){return APPS[c]}).join(', ')+(f.sell?'\n'+f.sell:'');
    if(navigator.share)navigator.share({text:t}).catch(function(){});else if(navigator.clipboard){navigator.clipboard.writeText(t);toast('Copied')}};
  $('#del').onclick=function(){if(confirm('Delete '+f.name+'?')){db.f=db.f.filter(function(x){return x.id!==f.id});save();location.hash='#/'}}}
function form(id){
  var f=id?byId(id):{name:'',apps:[],family:'',smell:'',top:'',heart:'',base:'',sell:'',keywords:'',avoid:'',notes:'',tier:'Standard',star:false};
  if(!f){location.hash='#/';return}
  function tx(k,l,ph){return '<label>'+l+'</label><input type="text" id="e_'+k+'" value="'+esc(f[k])+'" placeholder="'+(ph||'')+'">'}
  var pills=Object.keys(APPS).map(function(c){return '<label class="pill"><input type="checkbox" class="ea" value="'+c+'"'+(f.apps.indexOf(c)>-1?' checked':'')+'><span>'+esc(APPS[c])+'</span></label>'}).join('');
  app.innerHTML='<div class="card fhead"><div class="sec-t">'+(id?'Edit fragrance':'Add new fragrance')+'</div><div class="mut">Fill in what staff need to explain it to a customer.</div></div>'+
   '<div class="card"><div class="sec-t">Fragrance name *</div>'+tx('name','','e.g. Arabian Rose')+'</div>'+
   '<div class="card"><div class="sec-t">Family</div><input type="text" id="e_family" list="fl" value="'+esc(f.family)+'" placeholder="e.g. Citrus, Rose, Woody"><datalist id="fl">'+families().map(function(x){return '<option value="'+esc(x)+'">'}).join('')+'</datalist></div>'+
   '<div class="card"><div class="sec-t">Smell description</div>'+tx('smell','','One line on how it smells')+'</div>'+
   '<div class="card"><div class="sec-t">Notes (top, middle, base)</div>'+tx('top','Top note (first smell)')+tx('heart','Middle note (heart, main character)')+tx('base','Base note (lasting smell)')+'</div>'+
   '<div class="card"><div class="sec-t">Suitable applications</div><p class="mut">Tap the products this fragrance suits.</p><div class="pills">'+pills+'</div></div>'+
   '<div class="pitch"><div class="sec-t">Tell the customer (selling line)</div><textarea id="e_sell" placeholder="What to say to the customer">'+esc(f.sell)+'</textarea></div>'+
   '<div class="card"><div class="sec-t">Customer words and other details</div>'+tx('keywords','Customer words (comma separated)','rose, gulab, premium')+tx('avoid','Not suitable note (optional)')+
   '<label>Level</label><select id="e_tier"><option'+(f.tier!=='Premium'?' selected':'')+'>Standard</option><option'+(f.tier==='Premium'?' selected':'')+'>Premium</option></select>'+
   '<label>My notes (price, stock, customer feedback)</label><textarea id="e_notes">'+esc(f.notes)+'</textarea>'+
   '<label class="chk"><input type="checkbox" id="e_star"'+(f.star?' checked':'')+'> \u2605 Top pick (shows first in search)</label></div>'+
   '<div class="bar"><a class="btn" href="#/'+(id?'f/'+id:'')+'">Cancel</a><button class="btn y" id="sv">Save fragrance</button></div>';
  $('#sv').onclick=function(){var n=$('#e_name').value.trim();if(!n){toast('Name is required');return}
    var dup=db.f.find(function(x){return norm(x.name)===norm(n)&&x.id!==(id||'')});if(dup){toast('Name already exists');return}
    var o=f;['name','family','smell','top','heart','base','sell','keywords','avoid','notes'].forEach(function(k){o[k]=$('#e_'+k).value.trim()});
    o.name=n;o.tier=$('#e_tier').value;o.star=$('#e_star').checked;o.apps=[].slice.call(document.querySelectorAll('.ea:checked')).map(function(x){return x.value});
    if(!id){o.id=uid();db.f.push(o)}save();toast('Saved');location.hash='#/f/'+o.id}}
function words(){
  var w=db.w.slice().sort(function(a,b){return a.word.localeCompare(b.word)}),s=norm(q.value);
  if(s)w=w.filter(function(x){return norm(x.word+' '+x.meaning).indexOf(s)>-1});
  var letters={};db.w.forEach(function(x){letters[(x.word||'#').charAt(0).toUpperCase()]=1});
  app.innerHTML='<div class="sec-t" style="margin-top:4px">Smell glossary</div><p class="mut">Simple meanings of smell words for explaining to customers. The search box above filters this list.</p>'+
   '<div class="chips">'+Object.keys(letters).sort().map(function(L){return '<span class="chip">'+esc(L)+'</span>'}).join('')+'</div>'+
   '<div class="mut" style="margin:4px 0 10px">Showing '+w.length+' words</div>'+
   w.map(function(x){return '<div class="card wcard"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b class="wword">'+esc(x.word)+'</b><a href="#" data-dw="'+x.id+'" class="mut">Remove</a></div><div style="margin-top:4px">'+esc(x.meaning)+'</div></div>'}).join('')+
   '<div class="card"><div class="sec-t">Add a word</div><input type="text" id="nw" placeholder="Word"><label>Meaning</label><input type="text" id="nm" placeholder="Meaning in simple words"><p><button class="btn y" id="aw">Add word</button></p></div>';
  $('#aw').onclick=function(){var a=$('#nw').value.trim(),b=$('#nm').value.trim();if(!a||!b){toast('Enter word and meaning');return}db.w.push({id:uid(),word:a,meaning:b});save();words()}}
function dl(name,text,type){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type}));a.download=name;document.body.appendChild(a);a.click();a.remove()}
var COLS=['name','family','applications','smell','top','middle','base','sell','keywords','avoid','notes','tier','priority'];
function csvEsc(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function toCSV(rows){return '\ufeff'+rows.map(function(r){return r.map(csvEsc).join(',')}).join('\r\n')}
function fRow(f){return [f.name,f.family,f.apps.map(function(c){return APPS[c]}).join('|'),f.smell,f.top,f.heart,f.base,f.sell,f.keywords,f.avoid,f.notes,f.tier,f.star?'yes':'']}
function parseCSV(t){t=t.replace(/^\ufeff/,'');var rows=[],r=[],c='',i=0,qt=false;
  for(;i<t.length;i++){var ch=t[i];
    if(qt){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++}else qt=false}else c+=ch}
    else if(ch==='"')qt=true;else if(ch===','){r.push(c);c=''}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&t[i+1]==='\n')i++;r.push(c);c='';if(r.some(function(x){return x!==''}))rows.push(r);r=[]}
    else c+=ch}
  if(c!==''||r.length){r.push(c);rows.push(r)}return rows}
function appCode(t){t=norm(t);if(!t)return null;if(/^[fdwtpsa]$/.test(t))return t.toUpperCase();
  var k=Object.keys(APPS);for(var i=0;i<k.length;i++){if(norm(APPS[k[i]]).indexOf(t)>-1||ALIAS[k[i]].indexOf(t)>-1)return k[i]}return null}
function fromRow(h,r){var o={};h.forEach(function(k,i){o[k]=(r[i]||'').trim()});if(!o.name)return null;
  var codes=[];(o.applications||'').split(/[|;]/).forEach(function(x){var c=appCode(x);if(c&&codes.indexOf(c)<0)codes.push(c)});
  return{id:uid(),name:o.name,family:o.family||'',apps:codes,smell:o.smell||'',top:o.top||'',heart:o.heart||'',base:o.base||'',sell:o.sell||'',keywords:o.keywords||'',avoid:o.avoid||'',notes:o.notes||'',tier:/prem/i.test(o.tier)?'Premium':'Standard',star:/^(y|yes|1|true|\u2605)/i.test(o.priority||'')}}
function importData(text,fname,mode){var list=[],words=null;
  try{if(/\.json$/i.test(fname)||/^\s*[\[{]/.test(text)){var j=JSON.parse(text);var a=Array.isArray(j)?j:j.f||j.fragrances||[];
      list=a.map(function(x){var apps=Array.isArray(x.apps)?x.apps:String(x.applications||'').split(/[|;]/).map(appCode).filter(Boolean);
        return{id:uid(),name:String(x.name||'').trim(),family:x.family||'',apps:apps,smell:x.smell||'',top:x.top||'',heart:x.heart||'',base:x.base||'',sell:x.sell||'',keywords:x.keywords||'',avoid:x.avoid||'',notes:x.notes||'',tier:x.tier==='Premium'?'Premium':'Standard',star:!!x.star}}).filter(function(x){return x.name});
      if(j.w&&j.w.length)words=j.w}
    else{var rows=parseCSV(text);if(rows.length<2)throw 0;var h=rows[0].map(function(x){return norm(x).replace(/ /g,'')});
      h=h.map(function(x){return x==='priority'||x==='star'?'priority':x==='apps'?'applications':(x==='middle'||x==='mid'||x==='middlenote'||x==='heartnote')?'heart':x==='topnote'?'top':x==='basenote'?'base':x});
      list=rows.slice(1).map(function(r){return fromRow(h,r)}).filter(Boolean)}}
  catch(e){toast('Could not read file. Use the template.');return}
  if(!list.length){toast('No fragrances found in file');return}
  var add=0,upd=0;
  if(mode==='replace'){db.f=list;add=list.length}
  else list.forEach(function(n){var ex=db.f.find(function(x){return norm(x.name)===norm(n.name)});if(ex){n.id=ex.id;n.star=ex.star||n.star;db.f[db.f.indexOf(ex)]=n;upd++}else{db.f.push(n);add++}});
  if(words){words.forEach(function(w){if(w.word&&!db.w.some(function(x){return norm(x.word)===norm(w.word)}))db.w.push({id:uid(),word:w.word,meaning:w.meaning||''})})}
  save();toast('Imported: '+add+' new, '+upd+' updated');tools()}
function tools(){
  app.innerHTML='<div class="card"><h2>Import / Export</h2><div class="mut">'+db.f.length+' fragrances, '+db.w.length+' words. '+(sb?'Synced with Supabase (shared on all your devices).':'Saved on this phone only.')+'</div>'+(sb?'<p><button class="btn" id="lo">Log out</button></p>':'')+'</div>'+
   '<div class="card"><h4>Export (backup)</h4><p class="mut">Take a backup after every update. Open the CSV in Excel to edit many items.</p><div class="row"><button class="btn y" id="xj">Backup (JSON)</button><button class="btn" id="xc">Excel (CSV)</button><button class="btn" id="xt">Blank template</button></div></div>'+
   '<div class="card"><h4>Import</h4><p class="mut">CSV or JSON. Same name = updated, new name = added. In CSV, "applications" can be words like Floor cleaner|Dishwash or letters F|W.</p>'+
   '<label class="chk"><input type="radio" name="im" value="merge" checked> Add and update</label><label class="chk"><input type="radio" name="im" value="replace"> Replace everything</label><p><input type="file" id="fi" accept=".csv,.json,text/csv,application/json"></p></div>'+
   '<div class="card"><h4>Reset</h4><p class="mut">Remove all changes and go back to the original 42 fragrances.</p><button class="btn r" id="rs">Reset to catalogue</button></div>';
  if($('#lo'))$('#lo').onclick=function(){sb.auth.signOut().then(function(){try{localStorage.removeItem(CK)}catch(e){}location.reload()})};
  $('#xj').onclick=function(){dl('fragrances-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(db,null,1),'application/json')};
  $('#xc').onclick=function(){dl('fragrances-'+new Date().toISOString().slice(0,10)+'.csv',toCSV([COLS].concat(db.f.map(fRow))),'text/csv')};
  $('#xt').onclick=function(){dl('fragrance-template.csv',toCSV([COLS,['Sample Rose','Rose','Floor cleaner|Detergent|Fabric softener','Soft rose with woody base','Fresh rose','Sweet rose','Amber','Elegant rose','rose,gulab','','Price Rs ___ /kg','Standard','']]),'text/csv')};
  $('#fi').onchange=function(e){var fl=e.target.files[0];if(!fl)return;var mode=document.querySelector('input[name=im]:checked').value;
    if(mode==='replace'&&!confirm('Replace ALL current data with this file?')){e.target.value='';return}
    var rd=new FileReader();rd.onload=function(){importData(String(rd.result),fl.name,mode)};rd.readAsText(fl)};
  $('#rs').onclick=function(){if(confirm('Reset to the original catalogue? Your changes will be lost (also in Supabase).')){db=seed();save();toast('Reset done')}}}
function route(){
  $('#cnt').textContent=db.f.length+' fragrances';
  var h=location.hash||'#/',p=h.split('/');var t=p[1]||'';
  document.querySelectorAll('#nav a').forEach(function(a){a.classList.toggle('on',a.dataset.t===(t===''?'home':t==='f'||t==='new'||t==='edit'?'':t))});
  $('#fab').style.display=(t===''||t==='top')?'block':'none';
  if(t==='f')detail(p[2]);else if(t==='edit')form(p[2]);else if(t==='new')form();
  else if(t==='tools')tools();else if(t==='words')words();
  else if(t==='ai'&&window.TRV_AI)window.TRV_AI.view(app);
  else if(t==='top'){st.star=true;home()}
  else home();
  window.scrollTo(0,0)}
document.addEventListener('click',function(e){
  var nv=e.target.closest('#nav a[data-t=home]');if(nv){st={apps:[],fam:'',star:false}}
  var s=e.target.closest('[data-star]');if(s){e.preventDefault();e.stopPropagation();var f=byId(s.dataset.star);f.star=!f.star;save();
    if(location.hash.indexOf('#/f/')===0)detail(f.id);else renderRes();return}
  var a=e.target.closest('[data-app]');if(a){var c=a.dataset.app,i=st.apps.indexOf(c);i>-1?st.apps.splice(i,1):st.apps.push(c);a.classList.toggle('on');renderRes();return}
  var fm=e.target.closest('[data-fam]');if(fm){st.fam=st.fam===fm.dataset.fam?'':fm.dataset.fam;home();return}
  if(e.target.closest('[data-star-f]')){st.star=!st.star;home();return}
  var dw=e.target.closest('[data-dw]');if(dw){e.preventDefault();if(confirm('Remove this word?')){db.w=db.w.filter(function(x){return x.id!==dw.dataset.dw});save();words()}return}
  if(e.target.id==='rst'){e.preventDefault();st={apps:[],fam:'',star:false};q.value='';location.hash='#/';home()}});
q.addEventListener('input',function(){var t=(location.hash.split('/')[1]||'');if(t==='words'){words();return}if(t!==''&&t!=='top'){location.hash='#/';return}renderRes()});
$('#clr').onclick=function(){q.value='';q.focus();var t=(location.hash.split('/')[1]||'');t==='words'?words():renderRes();$('#clr').hidden=true};
q.addEventListener('focus',function(){q.select()});
window.addEventListener('hashchange',route);
boot();window.TRV={parseCSV:parseCSV,toCSV:toCSV,fRow:fRow,COLS:COLS,fromRow:fromRow,results:results,score:score,db:function(){return db},sync:sync,boot:boot,dirty:dirty};
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(function(){});
})();
