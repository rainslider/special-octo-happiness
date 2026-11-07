const $=s=>document.querySelector(s),h=(t,a={},...k)=>{const e=document.createElement(t);for(const[x,v]of Object.entries(a))x==='class'?e.className=v:x.startsWith('on')?e[x]=v:e.setAttribute(x,v);e.append(...k);return e};
const api=async(p,o={})=>{const r=await fetch(p,o),j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Er ging iets mis.');return j};
let user=null,mode='signup',kind='email';
const open=e=>$(e).classList.add('on'),shut=()=>{document.querySelectorAll('.ov').forEach(o=>o.classList.remove('on'));stopRain();$('#wb').replaceChildren()};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=shut);
addEventListener('keydown',e=>{if(e.key==='Escape')shut()});
function who(){const w=$('#who');w.replaceChildren();if(user){w.append(h('span',{class:'m'},user.name+'  '),h('button',{class:'btn g',onclick:async()=>{await api('/api/logout',{method:'POST'});user=null;who()}},'Uitloggen'))}else w.append(h('button',{class:'btn g',onclick:()=>auth('signup')},'Inloggen'))}
async function list(){const v=await api('/api/videos'),g=$('#grid');g.replaceChildren();
if(!v.length)return g.append(h('div',{class:'empty'},'Nog geen video\'s. Upload de eerste video op SocialRain.'));
v.forEach(x=>g.append(h('button',{class:'card',onclick:()=>watch(x.id)},h('video',{src:'/media/'+x.file+'#t=0.5',preload:'metadata',muted:''}),h('h3',{},x.title),h('div',{class:'m'},x.author+' · '+x.views+' weergaven · '+x.likes+' likes'))))}
async function watch(id){const d=await api('/api/videos/'+id),v=d.video,b=$('#wb');b.replaceChildren();
const lk=h('button',{class:'btn g'},(d.liked?'Geliked':'Like')+' · '+v.likes),cl=h('div'),inp=h('input',{placeholder:'Schrijf een reactie',maxlength:'500','aria-label':'Reactie'}),er=h('p',{class:'err'});
lk.onclick=async()=>{if(!user)return auth('signup');try{const r=await api('/api/like/'+id,{method:'POST'});lk.textContent=(r.liked?'Geliked':'Like')+' · '+r.likes}catch(e){er.textContent=e.message}};
const add=c=>cl.append(h('div',{class:'cm'},h('b',{},c.name||'onbekend'),' '+c.text));d.comments.forEach(add);
const post=h('button',{class:'btn',onclick:async()=>{if(!user)return auth('signup');try{add(await api('/api/comment/'+id,{method:'POST',body:JSON.stringify({text:inp.value})}));inp.value='';er.textContent=''}catch(e){er.textContent=e.message}}},'Reageren');
b.append(h('video',{src:'/media/'+v.file,controls:'',autoplay:''}),h('h2',{},v.title),h('div',{class:'m'},v.author+' · '+v.views+' weergaven'),h('p',{},v.desc||''),lk,h('h3',{},v.comments+' reacties'),inp,er,post,cl);open('#watch')}
$('#up').onclick=()=>user?open('#upl'):auth('signup');
$('#go').onclick=async()=>{const f=$('#uf').files[0],e=$('#ue');e.textContent='';if(!f)return e.textContent='Kies eerst een video.';
$('#go').disabled=true;$('#go').textContent='Bezig met uploaden…';
try{await api('/api/upload?title='+encodeURIComponent($('#ut').value)+'&desc='+encodeURIComponent($('#ud').value),{method:'PUT',headers:{'Content-Type':f.type},body:f});shut();$('#ut').value=$('#ud').value=$('#uf').value='';list()}catch(x){e.textContent=x.message}$('#go').disabled=false;$('#go').textContent='Uploaden'};
let raf,dr=[],fl;const cv=$('#rain'),cx=cv.getContext('2d');
function size(){cv.width=innerWidth;cv.height=innerHeight;dr=Array.from({length:Math.floor(innerWidth/9)},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,l:10+Math.random()*18,s:7+Math.random()*8}))}
function loop(){cx.clearRect(0,0,cv.width,cv.height);cx.strokeStyle='rgba(120,200,255,.35)';cx.beginPath();for(const d of dr){cx.moveTo(d.x,d.y);cx.lineTo(d.x-2,d.y+d.l);d.y+=d.s;if(d.y>cv.height){d.y=-20;d.x=Math.random()*cv.width}}cx.stroke();raf=requestAnimationFrame(loop)}
function stopRain(){cancelAnimationFrame(raf);clearInterval(fl)}
function auth(m){mode=m;open('#auth');if(!matchMedia('(prefers-reduced-motion:reduce)').matches){size();loop();fl=setInterval(()=>{const a=$('#auth');a.classList.remove('flash');void a.offsetWidth;a.classList.add('flash')},5000+Math.random()*3000)}view1()}
function view1(){$('#v1').hidden=false;$('#v2').hidden=true;$('#ae1').textContent='';const s=mode==='signup';$('#tS').className=s?'on':'';$('#tL').className=s?'':'on';$('#at').textContent=s?'Maak je account':'Welkom terug';$('#as').textContent=s?'Kies hoe je wilt beginnen.':'Log in en ga verder.'}
$('#tS').onclick=()=>{mode='signup';view1()};$('#tL').onclick=()=>{mode='login';view1()};
document.querySelectorAll('[data-p]').forEach(b=>b.onclick=async()=>{const p=b.dataset.p;
if(p==='google'||p==='apple')try{await api('/api/oauth/'+p)}catch(e){$('#ae1').textContent=e.message}
else{kind=p;$('#v1').hidden=true;$('#v2').hidden=false;const s=mode==='signup';$('#fn').hidden=!s;$('#fe').hidden=p==='rain';$('#fr').hidden=p!=='rain';$('#sub').textContent=s?'Account maken':'Inloggen';$('#ae2').textContent=''}});
$('#bk').onclick=view1;
$('#v2').onsubmit=async e=>{e.preventDefault();const em=kind==='rain'?$('#ar').value.trim()+'@rainslidermail':$('#ae').value,name=kind==='rain'&&!$('#an').value?$('#ar').value:$('#an').value;
try{user=await api(mode==='signup'?'/api/signup':'/api/login',{method:'POST',body:JSON.stringify({name,email:em,password:$('#ap').value})});shut();who()}catch(x){$('#ae2').textContent=x.message}};
(async()=>{try{const m=await api('/api/me');user=m.id?m:null}catch{}who();list()})();
