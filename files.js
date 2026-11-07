const {fs,path,VID,PUB}=require('./ctx');
function media(req,res,f){const p=path.join(VID,path.basename(f));if(!fs.existsSync(p)){res.writeHead(404);return res.end()}
const st=fs.statSync(p),type=p.endsWith('.webm')?'video/webm':'video/mp4',m=/bytes=(\d*)-(\d*)/.exec(req.headers.range||'');
if(m){const a=+m[1]||0,b=m[2]?+m[2]:st.size-1;res.writeHead(206,{'Content-Range':`bytes ${a}-${b}/${st.size}`,'Accept-Ranges':'bytes','Content-Length':b-a+1,'Content-Type':type});fs.createReadStream(p,{start:a,end:b}).pipe(res)}
else{res.writeHead(200,{'Content-Length':st.size,'Content-Type':type,'Accept-Ranges':'bytes'});fs.createReadStream(p).pipe(res)}}
const mediaRoute=(req,res,u)=>{const m=/^\/media\/([\w.]+)$/.exec(u.pathname);if(!m)return false;media(req,res,m[1]);return true};
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png'};
const staticRoute=(req,res,u)=>{const P=u.pathname;
let f=path.normalize(path.join(PUB,P==='/'?'index.html':P));if(!f.startsWith(PUB)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(PUB,'index.html');
if(!fs.existsSync(f)){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('De map public met index.html ontbreekt op de server. Zet de hele map public in je GitHub-repo.');return true}
res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);return true
};
module.exports=(req,res,u)=>mediaRoute(req,res,u)||staticRoute(req,res,u);
