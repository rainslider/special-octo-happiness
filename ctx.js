const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),url=require('url');
const PORT=process.env.PORT||3000,DATA=path.join(__dirname,'data'),VID=path.join(DATA,'videos'),DB=path.join(DATA,'db.json'),PUB=path.join(__dirname,'public'),MAX=200*1024*1024;
fs.mkdirSync(VID,{recursive:true});
let db={users:[],videos:[],comments:[],likes:[],sessions:{}};
try{db=JSON.parse(fs.readFileSync(DB))}catch{}
const save=()=>fs.writeFileSync(DB,JSON.stringify(db));
const hash=(p,s)=>crypto.scryptSync(p,s,32).toString('hex');
const id=()=>crypto.randomBytes(6).toString('hex');
const send=(res,c,o)=>{res.writeHead(c,{'Content-Type':'application/json'});res.end(JSON.stringify(o));return true};
const me=req=>{const m=/sr=(\w+)/.exec(req.headers.cookie||'');return m&&db.users.find(u=>u.id===db.sessions[m[1]])};
const body=req=>new Promise(r=>{let b='';req.on('data',d=>{b+=d;if(b.length>1e5)req.destroy()});req.on('end',()=>{try{r(JSON.parse(b))}catch{r({})}})});
const login=(res,u)=>{const t=crypto.randomBytes(24).toString('hex');db.sessions[t]=u.id;save();res.setHeader('Set-Cookie',`sr=${t}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax`);send(res,200,{id:u.id,name:u.name})};
const pv=v=>({id:v.id,title:v.title,desc:v.desc,file:v.file,views:v.views,at:v.at,likes:db.likes.filter(l=>l.v===v.id).length,comments:db.comments.filter(c=>c.v===v.id).length,author:(db.users.find(u=>u.id===v.u)||{}).name||'onbekend'});
module.exports={fs,path,crypto,PORT,DATA,VID,DB,PUB,MAX,db,save,hash,id,send,me,body,login,pv};
