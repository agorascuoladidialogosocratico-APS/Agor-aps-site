import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {basename} from 'node:path';
export const SITE='https://agora-scuoladidialogosocraticoecittadinanzattiva.site';
const API='https://api.buffer.com';
export const TARGETS={
 facebook:{field:'socialFacebook',caption:'socialFacebookText',env:'BUFFER_CHANNEL_FACEBOOK',services:['facebook']},
 instagram:{field:'socialInstagram',caption:'socialInstagramText',env:'BUFFER_CHANNEL_INSTAGRAM',services:['instagram']},
 x:{field:'socialX',caption:'socialXText',env:'BUFFER_CHANNEL_X',services:['twitter','x']}
};
const MUTATION='mutation CreateMagazinePost($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id status } } ... on MutationError { message } } }';
const shorten=(v,n)=>Array.from(String(v??'')).slice(0,Math.max(0,n)).join('');
const clean=v=>typeof v==='string'?v.trim():'';
const slugOk=v=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(v||''));
const imageOk=v=>/^\/assets\/[a-z0-9/_-]+\.(?:jpe?g|png|webp)$/i.test(String(v||''));
const plain=v=>String(v??'').replace(/[#*_\x60\[\]<>]/g,'').replace(/\s+/g,' ').trim();
export function selectRequest({payload=null,slug='',mode='draft'}={}){
 let request={slug,mode};
 if(payload){
  const v=typeof payload==='string'?JSON.parse(payload):payload;
  if(v.source!=='pages-cms'||v.action?.name!=='send-to-buffer'||v.context?.type!=='entry'||v.context?.name!=='magazine'
   ||v.repository?.owner!=='agorascuoladidialogosocratico-APS'||v.repository?.repo!=='Agor-aps-site'
   ||v.repository?.ref!=='main')throw Error('Richiesta Pages CMS non valida per Agorà Magazine');
  const path=v.context?.path;
  if(!/^content\/magazine\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(String(path)))throw Error('Percorso articolo non valido');
  request={slug:basename(path,'.json'),mode:String(v.inputs?.mode??'draft')};
 }
 if(!slugOk(request.slug))throw Error('Slug articolo non valido');
 if(!['draft','queue'].includes(request.mode))throw Error('Modalità non valida: usare draft o queue');
 return request;
}
export function createPlan(slug,article,mode='draft'){
 if(!slugOk(slug)||!['draft','queue'].includes(mode))throw Error('Richiesta non valida');
 if(article?.published!==true)throw Error('Articolo non pubblicato: salva la versione sul Magazine prima di condividere');
 const title=clean(article.title),excerpt=plain(article.excerpt);
 if(!title||!excerpt)throw Error('Titolo o sommario non presenti');
 const url=SITE+'/magazine/'+slug+'/';
 const asset=imageOk(article.cover)?SITE+article.cover:null;
 const enabled=Object.keys(TARGETS).filter(p=>article[TARGETS[p].field]===true);
 if(!enabled.length)throw Error('Attiva almeno un social nella scheda dell’articolo');
 if(enabled.includes('instagram')&&!asset)throw Error('Instagram richiede una foto pubblica sotto /assets/');
 const suffix='\n'+url;
 const xIntro=title+' — '+excerpt;
 const maxX=270-Array.from(suffix).length-1;
 const xDefault=shorten(xIntro,maxX)+(Array.from(xIntro).length>maxX?'…':'');
 const fallback={
  facebook:title+'\n\n'+shorten(excerpt,350)+'\n\nLeggi su Agorà Magazine: '+url+'\n\n#AgoraAPS #CittadinanzaAttiva',
  instagram:title+'\n\n'+shorten(excerpt,650)+'\n\nL’articolo completo è disponibile sul sito di Agorà APS.\n\n#AgoraAPS #DialogoSocratico #CittadinanzaAttiva',
  x:xDefault
 };
 return enabled.map(platform=>{
  const t=TARGETS[platform],custom=clean(article[t.caption]);
  let text=custom||fallback[platform];
  if(platform==='x'){
   const limit=270-Array.from(suffix).length-1;
   const short=shorten(text,limit);
   text=short+(Array.from(text).length>Array.from(short).length?'…':'')+suffix;
  }
  if(!text)throw Error('Testo social vuoto '+platform);
  const input={text,channelId:null,schedulingType:'automatic',mode:'addToQueue',assets:asset?[{image:{url:asset}}]:[],saveToDraft:mode==='draft',source:'Agora Magazine'};
  if(platform==='instagram')input.metadata={instagram:{type:'post',shouldShareToFeed:true}};
  if(platform==='facebook')input.metadata={facebook:{type:'post'}};
  return {platform,mode,url,asset,text,input};
 });
}
export async function bufferRequest(key,query,variables={},fetchFn=fetch){
 if(!key)throw Error('BUFFER_API_KEY non configurata');
 const response=await fetchFn(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(18000)});
 const data=await response.json();
 if(!response.ok||data.errors?.length)throw Error('Buffer API: '+(data.errors?.map(x=>x.message).join('; ')||'HTTP '+response.status));
 return data.data||{};
}
export async function submitPost({key,channelId,post,fetchFn=fetch}){
 if(!/^[a-zA-Z0-9:_-]{2,150}$/.test(String(channelId||'')))throw Error('ID canale Buffer assente o errato: '+post.platform);
 const query='query { channel(input: {id: "'+channelId+'"}) { id name service isQueuePaused } }';
 const channel=(await bufferRequest(key,query,{},fetchFn)).channel;
 if(!channel||!TARGETS[post.platform].services.includes(String(channel.service||'').toLowerCase()))throw Error('Canale Buffer non corrispondente a '+post.platform);
 if(post.mode==='queue'&&channel.isQueuePaused)throw Error('Coda Buffer in pausa: '+post.platform);
 const input={...post.input,channelId};
 const result=(await bufferRequest(key,MUTATION,{input},fetchFn)).createPost;
 if(!result?.post?.id)throw Error('Buffer ha rifiutato '+post.platform+': '+(result?.message||'nessun ID restituito'));
 return {id:result.post.id,mode:post.mode,status:result.post.status||null,channelId};
}
/* Se esiste un solo canale attivo per piattaforma, recupera automaticamente
   l'ID reale da Buffer. Con più account della stessa rete blocca l'invio:
   l'operatore può specificare BUFFER_CHANNEL_* per scegliere senza ambiguità. */
export async function resolveChannelIds({posts,env,fetchFn=fetch}){
 const config={...env};
 const missing=[...new Set(posts.map(p=>p.platform))].filter(platform=>
  !String(config[TARGETS[platform]?.env]||'').trim()
 );
 if(!missing.length)return config;
 const account=(await bufferRequest(config.BUFFER_API_KEY,
  'query { account { organizations { id } } }',{},fetchFn)).account;
 if(!Array.isArray(account?.organizations)||!account.organizations.length){
  throw Error('Nessuna organizzazione Buffer disponibile');
 }
 const channels=[];
 for(const org of account.organizations){
  const id=String(org.id||'');
  if(!/^[a-zA-Z0-9:_-]{2,150}$/.test(id))throw Error('ID organizzazione Buffer non valido');
  const query='query { channels(input: { organizationId: '+JSON.stringify(id)+' }) { id service isDisconnected isLocked } }';
  const result=(await bufferRequest(config.BUFFER_API_KEY,query,{},fetchFn)).channels;
  if(!Array.isArray(result))throw Error('Impossibile ottenere i canali Buffer');
  channels.push(...result);
 }
 for(const platform of missing){
  const key=TARGETS[platform];
  if(!key)throw Error('Piattaforma social non riconosciuta');
  const candidates=channels.filter(c=>key.services.includes(String(c.service||'').toLowerCase())
   && c.isDisconnected!==true && c.isLocked!==true);
  if(candidates.length!==1){
   throw Error('Buffer: '+platform+' ha '+candidates.length+' canali attivi. Collegane esattamente uno oppure configura esplicitamente '+key.env+' in GitHub Actions.');
  }
  config[key.env]=String(candidates[0].id);
  if(!/^[a-zA-Z0-9:_-]{2,150}$/.test(config[key.env])){
   throw Error('Buffer ha restituito un ID canale non valido');
  }
 }
 return config;
}

export async function publishPlan({slug,posts,env,ledger,save,fetchFn=fetch}){
 if(!slugOk(slug))throw Error('Slug non valido');
 ledger.posts ||= {};ledger.posts[slug] ||= {};
 const pending=posts.filter(post=>!ledger.posts[slug][post.platform]);
 const selected=await resolveChannelIds({posts:pending,env,fetchFn});
 const results=[];
 for(const post of posts){
  if(ledger.posts[slug][post.platform]){
   results.push({platform:post.platform,status:'already-created',id:ledger.posts[slug][post.platform].id});continue;
  }
  try{
   const created=await submitPost({key:env.BUFFER_API_KEY,channelId:selected[TARGETS[post.platform].env],post,fetchFn});
   ledger.posts[slug][post.platform]={...created,at:new Date().toISOString()};
   save(ledger);
   results.push({platform:post.platform,status:'created',id:created.id,mode:post.mode});
  }catch(error){results.push({platform:post.platform,status:'failed',error:String(error.message||error)});}
 }
 return results;
}
async function main(){
 const args=process.argv.slice(2);
 const action=args.includes('--execute')?'execute':args.includes('--channels')?'channels':'preview';
 if(action==='channels'){
  const key=process.env.BUFFER_API_KEY;
  const orgs=(await bufferRequest(key,'query { account { organizations { id name } } }')).account?.organizations||[];
  for(const org of orgs){
   if(!/^[a-zA-Z0-9:_-]{2,150}$/.test(org.id))continue;
   const query='query { channels(input: {organizationId: "'+org.id+'"}) { id name service } }';
   const list=(await bufferRequest(key,query)).channels||[];
   console.log(JSON.stringify({organization:org.name,organizationId:org.id,channels:list},null,2));
  }
  return;
 }
 const slugPos=args.indexOf('--article'),modePos=args.indexOf('--mode');
 const request=selectRequest({payload:process.env.PAGES_CMS_PAYLOAD||null,slug:slugPos>=0?args[slugPos+1]:'benvenuti-in-agora-magazine',mode:modePos>=0?args[modePos+1]:'draft'});
 const article=JSON.parse(readFileSync('content/magazine/'+request.slug+'.json','utf8'));
 const posts=createPlan(request.slug,article,request.mode);
 console.log(JSON.stringify({article:request.slug,mode:request.mode,posts:posts.map(p=>({platform:p.platform,text:p.text,image:p.asset}))},null,2));
 if(action!=='execute')return;
 if(!process.env.BUFFER_API_KEY)throw Error('Manca BUFFER_API_KEY: collega Buffer e inserisci la chiave nei GitHub Secrets');
 const check=await fetch(posts[0].url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(12000)});
 if(!check.ok)throw Error('Articolo non raggiungibile sul sito: HTTP '+check.status+'; nessun invio a Buffer');
 const ledgerPath='data/buffer-posts.json';
 const ledger=existsSync(ledgerPath)?JSON.parse(readFileSync(ledgerPath,'utf8')):{posts:{}};
 const results=await publishPlan({slug:request.slug,posts,env:process.env,ledger,save:doc=>writeFileSync(ledgerPath,JSON.stringify(doc,null,2)+'\n')});
 console.log(JSON.stringify({results},null,2));
 if(results.some(r=>r.status==='failed'))throw Error('Invio Buffer parziale: consultare i risultati, correggere e riprovare. I post riusciti sono registrati contro i duplicati.');
}
if(process.argv[1]?.endsWith('/social-buffer.mjs'))main().catch(e=>{console.error(e.message);process.exitCode=1;});
