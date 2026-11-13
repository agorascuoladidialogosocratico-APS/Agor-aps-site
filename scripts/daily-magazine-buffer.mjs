import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createPlan,publishPlan,resolveChannelIds,SITE} from './social-buffer.mjs';

const load=(path)=>JSON.parse(readFileSync(path,'utf8'));
const campaign=load('data/social-magazine-23-giorni.json');
const contemporary=load('data/social-editoriali-contemporanei.json');
// Keep the previously approved 23-day campaign intact. Append the new series after its last slot.
if(campaign.posts.length!==23||contemporary.posts.length!==5)throw new Error('I calendari editoriali sono incompleti');
const upcoming=[
 ...campaign.posts.map(item=>({...item,series:'archivio'})),
 ...contemporary.posts.map(item=>({...item,series:'contemporaneo'}))
].sort((a,b)=>a.date.localeCompare(b.date));
const localDay=new Intl.DateTimeFormat('sv-SE',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Rome'}).format(new Date());

if(!/^\d{4}-\d{2}-\d{2}$/.test(localDay))throw new Error('Data locale non valida');
if(localDay<campaign.startDate){
 console.log('La campagna inizia il '+campaign.startDate+'; nessun post creato.');
 process.exit(0);
}
if(!process.env.BUFFER_API_KEY)throw new Error('BUFFER_API_KEY non configurata: nessun invio effettuato');
if(!upcoming.every(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.date)))throw new Error('Calendario con date non valide');
const eligible=upcoming.filter(item=>item.date<=localDay);
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
if(item.series==='contemporaneo'){
 const media=[...(article.socialCarouselImages||[]),...(article.socialStoryImages||[])];
 if(media.length!==7||media.some(p=>!/^\/assets\/[a-z0-9/_-]+\.png$/.test(p)||!existsSync(p.slice(1)))){
  throw new Error('Carosello o storia non generati: pubblicazione social sospesa per '+slug);
 }
}
console.log(JSON.stringify({campaign:campaign.title,localDay,slot:item.date,article:slug,platforms:posts.map(p=>p.platform),image:imagePath},null,2));
const save=data=>writeFileSync(ledgerPath,JSON.stringify(data,null,2)+'\n');
const result=await publishPlan({slug,posts,env:process.env,ledger,save});
console.log(JSON.stringify({results:result},null,2));
if(result.some(r=>r.status==='failed'))throw new Error('Invio parziale: riprovare nella prossima finestra, conservando i post riusciti nel registro anti-duplicato.');
if(item.series==='contemporaneo'){
 // A Story is a separate Buffer post, with its own anti-duplicate ledger key.
 const storyKey=slug+'-storia';
 if(!ledger.posts?.[storyKey]?.instagram){
  const basePost=posts.find(p=>p.platform==='instagram');
  if(basePost){
   const storyAsset=SITE+article.socialStoryImages[0];
   const story={...basePost,asset:storyAsset,text:'Una domanda per il tuo presente. Leggi e confrontati sul Magazine di Agorà APS.',input:{
    ...basePost.input,text:'Una domanda per il tuo presente. Leggi Agorà Magazine.',
    assets:[{image:{url:storyAsset}}],
    metadata:{instagram:{type:'story',shouldShareToFeed:false,isAiGenerated:true}},
    aiAssisted:true
   }};
   try{
    const storyResults=await publishPlan({slug:storyKey,posts:[story],env:process.env,ledger,save});
    console.log(JSON.stringify({storyResults},null,2));
    // Story failures must not block the next day's primary editorial post.
    if(storyResults.some(r=>r.status==='failed'))console.warn('Storia non confermata; grafica disponibile per ripubblicazione manuale in Buffer.');
   }catch(error){console.warn('Storia non inviata: '+String(error.message||error));}
  }
 }
}
