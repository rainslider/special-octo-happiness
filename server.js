const http=require('http'),url=require('url');
const {PORT,send}=require('./ctx');
const routes=[require('./api'),require('./files')];
http.createServer(async(req,res)=>{const u=url.parse(req.url,true);try{for(const f of routes)if(await f(req,res,u))return}catch(e){console.error(e);if(!res.headersSent)send(res,500,{error:'Serverfout.'})}}).listen(PORT,()=>console.log('SocialRain draait op poort '+PORT));
