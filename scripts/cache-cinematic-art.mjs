/* Cache two verified public-domain Raphael figure cut-outs for stable hosting.
   Sources and PDM license are shown visibly in the page.
   Network failure leaves the original Wikimedia URLs intact. */
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
const homePath='index.html';
const sources=[
 {path:'assets/cinema-plato.png',url:'https://upload.wikimedia.org/wikipedia/commons/8/80/The_School_of_Athens%2C_Plato.png'},
 {path:'assets/cinema-aristotle.png',url:'https://upload.wikimedia.org/wikipedia/commons/5/5d/The_School_of_Athens%2C_Aristotle.png'}
];
let html=readFileSync(homePath,'utf8');
for(const item of sources){
 if(!existsSync(item.path)){
  try{
   const r=await fetch(item.url,{
    signal:AbortSignal.timeout(16000),
    headers:{'User-Agent':'AgoraAPSWebsite/1.0 (https://agora-scuoladidialogosocraticoecittadinanzattiva.site; agora.scuoladidialogosocratico@gmail.com)'}
   });
   if(!r.ok)throw Error('HTTP '+r.status);
   const bytes=Buffer.from(await r.arrayBuffer());
   if(bytes.length<10000||bytes.length>750000||bytes.toString('hex',0,8)!=='89504e470d0a1a0a')
    throw Error('Untrusted or invalid PNG response');
   writeFileSync(item.path,bytes);
   console.log('Cached verified public-domain artwork '+item.path+': '+bytes.length+' bytes');
  }catch(error){console.warn('Wikimedia mirror not cached: '+item.url+' ('+String(error.message)+'). Remote URL remains in the page.');}
 }
 if(existsSync(item.path)&&html.includes(item.url)){
  html=html.replace(item.url,'/'+item.path);
 }
}
if(html!==readFileSync(homePath,'utf8'))writeFileSync(homePath,html);
