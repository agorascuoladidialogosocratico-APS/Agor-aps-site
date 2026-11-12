import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createPlan,publishPlan,resolveChannelIds,SITE} from './social-buffer.mjs';

const load=(path)=>JSON.parse(readFileSync(path,'utf8'));
const campaign=load('data/social-magazine-23-giorni.json');
const localDay=new Intl.DateTimeFormat('sv-SE',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Rome'}).format(new Date());

if(!/^\d{4}-\d{2}-\d{2}$/.test(localDay))throw new Error('Data locale non valida');
if(localDay<campaign.startDate){
 console.log('La campagna inizia il '+campaign.startDate+'; nessun post creato.');
 process.exit(0);
}
if(!process.env.BUFFER_API_KEY)throw new Error('BUFFER_API_KEY non configurata: nessun invio effettuato');
if(!Array.isArray(campaign.posts)||campaign.posts.length!==23)throw new Error('Campagna incompleta, invio bloccato');
const eligible=campaign.posts.filter(item=>item.date<=localDay).sort((a,b)=>a.date.localeCompare(b.date));
const ledgerPath='data/buffer-posts.json';
const ledger=existsSync(ledgerPath)?load(ledgerPath):{posts:{}};
// Facebook and Instagram define completion of a daily slot; optional X must never block them.
const required=['facebook','instagram'];
const item=eligible.find(item=>required.some(p=>!ledger.posts?.[item.slug]?.[p]));
if(!item){
 console.log('Nessun articolo arretrato da pubblicare al '+localDay);
 process.exit(0);
}
const slug=item.slug;
if(!/^[a-z0-9-]+$/.test(slug))throw new Error('Slug non valido');
const article=load('content/magazine/'+slug+'.json');
if(article.published!==true)throw new Error('Articolo ancora in bozza: '+slug);
const imagePath=String(article.cover||'');
if(!/^\/assets\/[a-z0-9/_-]+\.(png|webp|jpg|jpeg)$/i.test(imagePath)||!existsSync(imagePath.slice(1))){
 throw new Error('Copertina PNG/JPEG non ancora disponibile: '+slug+' ('+imagePath+')');
}
const page='magazine/'+slug+'/index.html';
if(!existsSync(page)||!readFileSync(page,'utf8').includes('<h1>'))throw new Error('Articolo non generato: '+slug);
const url=SITE+'/magazine/'+slug+'/';
try{
 const response=await fetch(url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(12000)});
 if(!response.ok&&![403,405,429].includes(response.status))throw new Error('Pagina non raggiungibile: HTTP '+response.status+' '+url);
 if(!response.ok)console.warn('Verifica remota limitata (HTTP '+response.status+'); HTML locale verificato.');
}catch(error){
 if(String(error.message||'').includes('Pagina non raggiungibile'))throw error;
 console.warn('Controllo HEAD non disponibile; HTML e immagine locali verificati.');
}
let xEnabled=false;
try{
 const channels=await resolveChannelIds({posts:[{platform:'x'}],env:process.env});
 if(channels.BUFFER_CHANNEL_X){
  process.env.BUFFER_CHANNEL_X=channels.BUFFER_CHANNEL_X;
  xEnabled=true;
 }
}catch(error){
 console.warn('X non è disponibile o non è univocamente collegato: pubblicazione solo su Facebook e Instagram.');
}
const enabled={...article,socialFacebook:true,socialInstagram:true,socialX:xEnabled};
const posts=createPlan(slug,enabled,'now');
console.log(JSON.stringify({campaign:campaign.title,localDay,slot:item.date,article:slug,platforms:posts.map(p=>p.platform),image:imagePath},null,2));
const result=await publishPlan({slug,posts,env:process.env,ledger,save:data=>writeFileSync(ledgerPath,JSON.stringify(data,null,2)+'\n')});
console.log(JSON.stringify({results:result},null,2));
if(result.some(r=>r.status==='failed'))throw new Error('Invio parziale: riprovare nella prossima finestra, conservando i post riusciti nel registro anti-duplicato.');
