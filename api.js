const {fs,path,VID,MAX,db,save,hash,id,send,me,body,login,pv}=require('./ctx');
const auth=async(req,res,u)=>{const P=u.pathname;let m;
if(P==='/api/me')return send(res,200,me(req)?{id:me(req).id,name:me(req).name}:{});
if(req.method==='POST'&&P==='/api/signup'){const b=await body(req),name=String(b.name||'').trim().slice(0,30),email=String(b.email||'').trim().toLowerCase().slice(0,80),pw=String(b.password||'');
if(name.length<2)return send(res,400,{error:'Kies een naam van minstens 2 tekens.'});
if(!/^[^\s@]+@[^\s@]+$/.test(email))return send(res,400,{error:'Dit e-mailadres klopt niet.'});
if(pw.length<6)return send(res,400,{error:'Je wachtwoord moet minstens 6 tekens hebben.'});
if(db.users.some(x=>x.email===email))return send(res,409,{error:'Dit e-mailadres heeft al een account. Log in.'});
const salt=id(),usr={id:id(),name,email,salt,pw:hash(pw,salt)};db.users.push(usr);return login(res,usr)}
if(req.method==='POST'&&P==='/api/login'){const b=await body(req),usr=db.users.find(x=>x.email===String(b.email||'').trim().toLowerCase());
if(!usr||usr.pw!==hash(String(b.password||''),usr.salt))return send(res,401,{error:'E-mailadres of wachtwoord klopt niet.'});return login(res,usr)}
if(req.method==='POST'&&P==='/api/logout'){const c=/sr=(\w+)/.exec(req.headers.cookie||'');if(c){delete db.sessions[c[1]];save()}return send(res,200,{})}
if((m=/^\/api\/oauth\/(google|apple)$/.exec(P)))return send(res,501,{error:'Inloggen met '+(m[1]==='google'?'Google':'Apple')+' is nog niet gekoppeld. Gebruik e-mail of RainSlider Mail.'});
};
const videos=async(req,res,u)=>{const P=u.pathname;let m;
if(P==='/api/videos')return send(res,200,db.videos.slice().reverse().map(pv));
if((m=/^\/api\/videos\/(\w+)$/.exec(P))){const v=db.videos.find(x=>x.id===m[1]);if(!v)return send(res,404,{error:'Video niet gevonden.'});v.views++;save();const usr=me(req);
return send(res,200,{video:pv(v),liked:!!usr&&db.likes.some(l=>l.v===v.id&&l.u===usr.id),comments:db.comments.filter(c=>c.v===v.id).map(c=>({name:(db.users.find(x=>x.id===c.u)||{}).name,text:c.text}))})}
};
const upload=async(req,res,u)=>{const P=u.pathname;let m;
if(req.method==='PUT'&&P==='/api/upload'){const usr=me(req);if(!usr)return send(res,401,{error:'Log eerst in.'});
const ct=req.headers['content-type']||'',ext=ct.includes('webm')?'webm':ct.includes('mp4')?'mp4':null,title=String(u.query.title||'').trim().slice(0,100);
if(!ext)return send(res,400,{error:'Alleen mp4- of webm-video\'s.'});if(!title)return send(res,400,{error:'Geef je video een titel.'});
const f=id()+'.'+ext,p=path.join(VID,f),ws=fs.createWriteStream(p);let n=0,bad=false;
req.on('data',d=>{n+=d.length;if(n>MAX&&!bad){bad=true;req.unpipe(ws);ws.end();req.resume();send(res,413,{error:'Deze video is te groot (max 200 MB).'})}});
req.pipe(ws);ws.on('finish',()=>{if(bad){fs.unlink(p,()=>{});return}const v={id:id(),u:usr.id,title,desc:String(u.query.desc||'').slice(0,500),file:f,views:0,at:Date.now()};db.videos.push(v);save();send(res,200,{id:v.id})});return true}
};
const social=async(req,res,u)=>{const P=u.pathname;let m;
if(req.method==='POST'&&(m=/^\/api\/like\/(\w+)$/.exec(P))){const usr=me(req);if(!usr)return send(res,401,{error:'Log in om te liken.'});
const i=db.likes.findIndex(l=>l.v===m[1]&&l.u===usr.id);i<0?db.likes.push({v:m[1],u:usr.id}):db.likes.splice(i,1);save();return send(res,200,{liked:i<0,likes:db.likes.filter(l=>l.v===m[1]).length})}
if(req.method==='POST'&&(m=/^\/api\/comment\/(\w+)$/.exec(P))){const usr=me(req);if(!usr)return send(res,401,{error:'Log in om te reageren.'});
const b=await body(req),text=String(b.text||'').trim().slice(0,500);if(!text)return send(res,400,{error:'Typ eerst een reactie.'});db.comments.push({v:m[1],u:usr.id,text});save();return send(res,200,{name:usr.name,text})}
};
module.exports=async(req,res,u)=>(await auth(req,res,u))||(await videos(req,res,u))||(await upload(req,res,u))||(await social(req,res,u));
