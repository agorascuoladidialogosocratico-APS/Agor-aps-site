/* Agorà: chat web ↔ WhatsApp Business via numero tecnico Cloud API distinto.
   Nessun database, token o credenziale = chat disabilitata; mai simulare consegna. */
const OWNER_NUMBER='32466902127';
const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const isFreeDashboard=env=>env.CHAT_MODE==='free-dashboard';
const hasOperatorKey=env=>typeof env.CHAT_ADMIN_TOKEN==='string'&&env.CHAT_ADMIN_TOKEN.length>=40;
const okConfig=env=>Boolean(env.CHAT_DB&&env.CHAT_ENABLED==='true'&&env.TURNSTILE_SECRET&&env.TURNSTILE_SITE_KEY&&(
 isFreeDashboard(env)?hasOperatorKey(env):(env.META_TOKEN&&env.META_PHONE_NUMBER_ID&&env.META_TEMPLATE_NAME&&env.META_APP_SECRET&&env.META_WEBHOOK_VERIFY_TOKEN&&env.CHAT_OWNER_NUMBER===OWNER_NUMBER)
));
const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max+1):'';
const isAllowedOrigin=request=>{const url=new URL(request.url);const origin=request.headers.get('Origin');const fetchSite=request.headers.get('Sec-Fetch-Site');return (!origin||origin===url.origin)&&(!fetchSite||fetchSite==='same-origin'||fetchSite==='none');};
const readPayload=async request=>{if(!String(request.headers.get('Content-Type')||'').includes('application/json'))return null;if(Number(request.headers.get('Content-Length')||0)>5000)return null;try{return await request.json();}catch{return null;}};
const textToHex=bytes=>[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');
const hash=async s=>textToHex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))));
const randomToken=()=>textToHex(crypto.getRandomValues(new Uint8Array(32)));
const randomCode=()=>textToHex(crypto.getRandomValues(new Uint8Array(5))).slice(0,10).toUpperCase();
const authToken=request=>(request.headers.get('Authorization')||'').match(/^Bearer ([a-f0-9]{64})$/)?.[1]||null;
const checkSession=async (request,env)=>{
  const token=authToken(request);if(!token)return null;
  const secretHash=await hash(token);
  return env.CHAT_DB.prepare("SELECT id, code, status FROM site_chats WHERE secret_hash = ? AND created_at > ?").bind(secretHash,Date.now()-30*86400000).first();
};
const verifyTurnstile=async(token,request,env)=>{
  if(!token)return false;
  try{
    const body=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token,remoteip:request.headers.get('CF-Connecting-IP')||''});
    const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body,signal:AbortSignal.timeout(9000)});
    const data=await r.json();return data.success===true && (!data.hostname || data.hostname===new URL(request.url).hostname);
  }catch{return false;}
};
const sendOperatorNotification=async(env,code,body)=>{
  /* Template Meta approvato con DUE parametri testuali: codice, anteprima messaggio.
     L'operatore risponde dal numero +32 al numero tecnico nel formato: #CODICE testo. */
  const version=/^v\d+\.\d+$/.test(env.META_GRAPH_VERSION||'')?env.META_GRAPH_VERSION:'v25.0';
  const payload={
    messaging_product:'whatsapp',to:OWNER_NUMBER,type:'template',
    template:{name:env.META_TEMPLATE_NAME,language:{code:env.META_TEMPLATE_LANGUAGE||'it'},components:[{type:'body',parameters:[
      {type:'text',text:code},{type:'text',text:body.slice(0,180)}
    ]}]}
  };
  const r=await fetch('https://graph.facebook.com/'+version+'/'+encodeURIComponent(env.META_PHONE_NUMBER_ID)+'/messages',{
    method:'POST',headers:{Authorization:'Bearer '+env.META_TOKEN,'Content-Type':'application/json'},
    body:JSON.stringify(payload),signal:AbortSignal.timeout(12000)
  });
  return r.ok;
};
async function start(request,env){
 if(!isAllowedOrigin(request))return json(403,{ok:false,error:'origin'});
 const payload=await readPayload(request);
 if(!payload||typeof payload.turnstileToken!=='string')return json(422,{ok:false,message:'Completa la verifica di sicurezza.'});
 if(!(await verifyTurnstile(payload.turnstileToken,request,env)))return json(403,{ok:false,message:'Verifica di sicurezza non riuscita.'});
 const token=randomToken(),id=crypto.randomUUID(),code=randomCode(),now=Date.now();
 try{
  await env.CHAT_DB.prepare("INSERT INTO site_chats (id,secret_hash,code,created_at,updated_at,status) VALUES (?,?,?,?,?,'open')").bind(id,await hash(token),code,now,now).run();
 }catch{return json(503,{ok:false,message:'Non è stato possibile aprire la chat. Riprova.'});}
 return json(201,{ok:true,token,code});
}
async function messages(request,env){
 const session=await checkSession(request,env);
 if(!session)return json(401,{ok:false,message:'Sessione non riconosciuta o scaduta.'});
 const result=await env.CHAT_DB.prepare("SELECT id,side,body,created_at,notified FROM site_chat_messages WHERE chat_id=? ORDER BY created_at ASC LIMIT 200").bind(session.id).all();
 return json(200,{ok:true,code:session.code,messages:(result.results||[]).map(x=>({id:x.id,side:x.side,body:x.body,createdAt:x.created_at,notified:x.notified===1}))});
}
async function postMessage(request,env){
 if(!isAllowedOrigin(request))return json(403,{ok:false,error:'origin'});
 const session=await checkSession(request,env);
 if(!session||session.status!=='open')return json(401,{ok:false,message:'Sessione terminata o scaduta.'});
 const payload=await readPayload(request),body=clean(payload?.message,1500);
 if(body.length<2||body.length>1500)return json(422,{ok:false,message:'Scrivi un messaggio tra 2 e 1.500 caratteri.'});
 const now=Date.now();
 const volume=await env.CHAT_DB.prepare("SELECT count(*) AS n FROM site_chat_messages WHERE chat_id=? AND side='visitor' AND created_at>?").bind(session.id,now-120000).first();
 if((volume?.n||0)>=8)return json(429,{ok:false,message:'Hai inviato troppi messaggi in poco tempo. Riprova tra due minuti.'});
 const id=crypto.randomUUID();
 try{
  await env.CHAT_DB.prepare("INSERT INTO site_chat_messages (id,chat_id,side,body,created_at,notified) VALUES (?,?,'visitor',?,?,0)").bind(id,session.id,body,now).run();
  await env.CHAT_DB.prepare("UPDATE site_chats SET updated_at=? WHERE id=?").bind(now,session.id).run();
 }catch{return json(503,{ok:false,message:'Messaggio non registrato. Riprova.'});}
 if(isFreeDashboard(env))return json(201,{ok:true,stored:true,notified:false,delivery:'operator-dashboard',message:'Messaggio ricevuto nella chat. Agorà potrà risponderti qui.'});
 let notified=false;
 try{notified=await sendOperatorNotification(env,session.code,body);}catch{/* Keep stored message; no false notification claim. */}
 if(notified)await env.CHAT_DB.prepare('UPDATE site_chat_messages SET notified=1 WHERE id=?').bind(id).run();
 return json(notified?201:202,{ok:true,stored:true,notified,message:notified?
  'Messaggio ricevuto dalla chat del sito. Ti risponderemo qui.':
  'Messaggio salvato, ma la notifica all’operatore non è stata confermata. Puoi usare anche il modulo contatti.'});
}
async function verifyHmac(request,env,raw){
 const sig=request.headers.get('X-Hub-Signature-256')||'';
 if(!/^sha256=[a-f0-9]{64}$/i.test(sig))return false;
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.META_APP_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signed=await crypto.subtle.sign('HMAC',key,raw);
 const calculated=new Uint8Array(signed),provided=new Uint8Array(sig.slice(7).match(/../g).map(x=>parseInt(x,16)));
 if(calculated.length!==provided.length)return false;
 let diff=0;for(let i=0;i<calculated.length;i++)diff|=calculated[i]^provided[i];
 return diff===0;
}
async function inboundWebhook(request,env){
 if(request.method==='GET'){
   const url=new URL(request.url);
   if(url.searchParams.get('hub.mode')==='subscribe'&&url.searchParams.get('hub.verify_token')===env.META_WEBHOOK_VERIFY_TOKEN)
      return new Response(url.searchParams.get('hub.challenge')||'',{status:200,headers:{'Cache-Control':'no-store'}});
   return new Response('Forbidden',{status:403});
 }
 if(request.method!=='POST')return json(405,{ok:false});
 const raw=await request.arrayBuffer();if(raw.byteLength>100000)return json(413,{ok:false});
 if(!(await verifyHmac(request,env,raw)))return json(403,{ok:false});
 let content;try{content=JSON.parse(new TextDecoder().decode(raw));}catch{return json(400,{ok:false});}
 const incoming=(content.entry||[]).flatMap(e=>(e.changes||[]).flatMap(c=>{
   const v=c.value||{};
   return String(v.metadata?.phone_number_id||'')===String(env.META_PHONE_NUMBER_ID)?v.messages||[]:[];
 }));
 for(const message of incoming){
   if(String(message.from||'').replace(/\D/g,'')!==OWNER_NUMBER||message.type!=='text')continue;
   const rawText=clean(message.text?.body,1800);
   const match=rawText.match(/^#([A-F0-9]{10})\s+([\s\S]{2,1500})$/);
   if(!match)continue;
   const code=match[1],reply=match[2].trim();
   const row=await env.CHAT_DB.prepare("SELECT id,status FROM site_chats WHERE code=? AND created_at>?").bind(code,Date.now()-30*86400000).first();
   if(!row||row.status!=='open')continue;
   const metaId=clean(message.id,180);if(!metaId)continue;
   /* Deterministic ID deduplicates webhook retries. */
   await env.CHAT_DB.prepare("INSERT OR IGNORE INTO site_chat_messages (id,chat_id,side,body,created_at,notified) VALUES (?,?,'operator',?,?,1)").bind(metaId,row.id,reply,Date.now()).run();
   await env.CHAT_DB.prepare("UPDATE site_chats SET updated_at=? WHERE id=?").bind(Date.now(),row.id).run();
 }
 return json(200,{ok:true});
}

async function operatorAuthorized(request,env){
 if(!isFreeDashboard(env)||!hasOperatorKey(env))return false;
 const provided=request.headers.get('X-Agora-Operator-Key')||'';
 if(provided.length<40||provided.length>200)return false;
 const enc=new TextEncoder(),expected=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(env.CHAT_ADMIN_TOKEN)));
 const received=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(provided)));
 let diff=0;for(let i=0;i<expected.length;i++)diff|=expected[i]^received[i];
 return diff===0;
}
async function operatorAPI(request,env){
 if(!isAllowedOrigin(request))return json(403,{ok:false,message:'Origine non autorizzata.'});
 if(!(await operatorAuthorized(request,env)))return json(401,{ok:false,message:'Accesso riservato all’operatore.'});
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/site-chat/admin/chats'&&request.method==='GET'){
   const rows=await env.CHAT_DB.prepare("SELECT c.id,c.code,c.status,c.updated_at,c.created_at,(SELECT body FROM site_chat_messages m WHERE m.chat_id=c.id ORDER BY m.created_at DESC LIMIT 1) AS preview,(SELECT COUNT(*) FROM site_chat_messages m WHERE m.chat_id=c.id AND m.side='visitor' AND m.created_at>COALESCE((SELECT MAX(created_at) FROM site_chat_messages a WHERE a.chat_id=c.id AND a.side='operator'),0)) AS unanswered FROM site_chats c WHERE c.updated_at>? ORDER BY c.updated_at DESC LIMIT 100").bind(Date.now()-30*86400000).all();
   return json(200,{ok:true,chats:(rows.results||[]).map(c=>({id:c.id,code:c.code,status:c.status,preview:c.preview,unanswered:c.unanswered,updatedAt:c.updated_at,createdAt:c.created_at}))});
 }
 const chatId=url.searchParams.get('chatId')||'';
 if(path==='/api/site-chat/admin/messages'&&request.method==='GET'){
   if(!/^[a-f0-9-]{36}$/i.test(chatId))return json(400,{ok:false,message:'Identificativo conversazione non valido.'});
   const exists=await env.CHAT_DB.prepare('SELECT id,code,status FROM site_chats WHERE id=? AND updated_at>?').bind(chatId,Date.now()-30*86400000).first();
   if(!exists)return json(404,{ok:false,message:'Conversazione non disponibile.'});
   const rows=await env.CHAT_DB.prepare('SELECT id,side,body,created_at FROM site_chat_messages WHERE chat_id=? ORDER BY created_at ASC LIMIT 200').bind(chatId).all();
   return json(200,{ok:true,chat:{id:exists.id,code:exists.code,status:exists.status},messages:(rows.results||[]).map(x=>({id:x.id,side:x.side,body:x.body,createdAt:x.created_at}))});
 }
 if(path==='/api/site-chat/admin/reply'&&request.method==='POST'){
   const input=await readPayload(request),id=clean(input?.chatId,36),body=clean(input?.message,1500);
   if(!/^[a-f0-9-]{36}$/i.test(id)||body.length<2||body.length>1500)return json(422,{ok:false,message:'Controlla conversazione e testo (2–1.500 caratteri).'});
   const existing=await env.CHAT_DB.prepare('SELECT id,status FROM site_chats WHERE id=? AND updated_at>?').bind(id,Date.now()-30*86400000).first();
   if(!existing||existing.status!=='open')return json(404,{ok:false,message:'Conversazione chiusa o non disponibile.'});
   const now=Date.now();
   await env.CHAT_DB.prepare("INSERT INTO site_chat_messages (id,chat_id,side,body,created_at,notified) VALUES (?,?,'operator',?,?,1)").bind(crypto.randomUUID(),id,body,now).run();
   await env.CHAT_DB.prepare('UPDATE site_chats SET updated_at=? WHERE id=?').bind(now,id).run();
   return json(201,{ok:true,message:'Risposta salvata: apparirà nella chat del visitatore.'});
 }
 return json(405,{ok:false,message:'Operazione non supportata.'});
}

export async function handleSiteChat(request,env){
 const path=new URL(request.url).pathname;
 if(path==='/api/site-chat/status')return json(200,{enabled:okConfig(env),sitekey:okConfig(env)?env.TURNSTILE_SITE_KEY:null});
 if(!okConfig(env))return json(503,{ok:false,enabled:false,message:'Chat bidirezionale non ancora collegata. Utilizza il modulo contatti.'});
 if(path.startsWith('/api/site-chat/admin/'))return operatorAPI(request,env);
 if(path==='/api/meta-whatsapp-webhook')return isFreeDashboard(env)?json(404,{ok:false,message:'Meta non utilizzato nella modalità gratuita.'}):inboundWebhook(request,env);
 if(path==='/api/site-chat/start'&&request.method==='POST')return start(request,env);
 if(path==='/api/site-chat/messages'&&request.method==='GET')return messages(request,env);
 if(path==='/api/site-chat/message'&&request.method==='POST')return postMessage(request,env);
 return json(404,{ok:false,message:'Funzione chat non disponibile.'});
}
export async function deleteExpiredChats(env){
 if(!env.CHAT_DB)return;
 const older=Date.now()-30*86400000;
 await env.CHAT_DB.prepare("DELETE FROM site_chat_messages WHERE chat_id IN (SELECT id FROM site_chats WHERE updated_at<?)").bind(older).run();
 await env.CHAT_DB.prepare("DELETE FROM site_chats WHERE updated_at<?").bind(older).run();
}
