import {handleMembersArea} from './members-area.js';
import {handleTeacherArea} from './teacher-area.js';
import {handleCandidateGuide} from './candidate-guide.js';
import {receiveChatEmailReply} from './chat-email.js';
import {handleSiteChat,deleteExpiredChats} from './site-chat.js';
/* Worker Agorà: invio email per il modulo contatti, senza salvare le richieste.
   Il binding CONTACT_EMAIL necessita di una destinazione verificata in Cloudflare
   e di un indirizzo mittente autorizzato per il dominio. */
const FIELDS=['name','email','topic','message','consent','website'];
const TOPICS=['Informazioni generali','Progetti Erasmus+','Tirocini universitari','Volontariato ESC','Partenariati','Altro'];
const RECEIVER='agora.scuoladidialogosocratico@gmail.com';
const SENDER='contatti@agora-scuoladidialogosocraticoecittadinanzattiva.site';
const result=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function normalized(v,max){return typeof v==='string'?v.trim().slice(0,max+1):''}
async function processContact(request,env){
 if(request.method!=='POST')return result(405,{ok:false,message:'Questo indirizzo accetta soltanto l’invio del modulo.'});
 const origin=request.headers.get('Origin');
 const host=new URL(request.url).origin;
 if(origin && origin!==host)return result(403,{ok:false,message:'Richiesta da origine non autorizzata.'});
 const fetchSite=request.headers.get('Sec-Fetch-Site');
 if(fetchSite && !['same-origin','none'].includes(fetchSite))return result(403,{ok:false,message:'Richiesta da origine non autorizzata.'});
 if(Number(request.headers.get('Content-Length')||0)>16000)return result(413,{ok:false,message:'Il messaggio è troppo lungo.'});
 const contentType=request.headers.get('Content-Type')||'';
 let payload;
 try{
   if(contentType.includes('application/json'))payload=await request.json();
   else if(contentType.includes('application/x-www-form-urlencoded')||contentType.includes('multipart/form-data'))payload=Object.fromEntries((await request.formData()).entries());
   else return result(415,{ok:false,message:'Formato del modulo non supportato.'});
 }catch{return result(400,{ok:false,message:'Impossibile leggere i campi del modulo.'});}
 if(!payload||typeof payload!=='object')return result(400,{ok:false,message:'Dati del modulo mancanti.'});
 const name=normalized(payload.name,100);
 const email=normalized(payload.email,254);
 const topic=normalized(payload.topic,80);
 const message=normalized(payload.message,4000);
 const website=normalized(payload.website,150);
 const consent=payload.consent===true||payload.consent==='true'||payload.consent==='yes'||payload.consent==='on';
 if(website)return result(200,{ok:true,message:'Richiesta ricevuta.'});
 if(name.length<2||name.length>100||email.length>254||!/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(email)||!TOPICS.includes(topic)||message.length<20||message.length>4000||!consent){
   return result(422,{ok:false,message:'Controlla nome, email, argomento, testo (minimo 20 caratteri) e informativa privacy.'});
 }
 if(!env.CONTACT_EMAIL || typeof env.CONTACT_EMAIL.send!=='function')return result(503,{ok:false,message:'Il servizio di invio è temporaneamente non disponibile. Scrivici direttamente per email.'});
 const clean=s=>s.replace(/[\r\n\0]/g,' ').replace(/[<>]/g,'').trim();
 const text=['Nuovo messaggio dal modulo contatti Agorà APS','',`Nome: ${clean(name)}`,`Email per rispondere: ${clean(email)}`,`Argomento: ${topic}`,'','Messaggio:',message,'','Consenso all’informativa dichiarato: sì','Canale: sito istituzionale Agorà APS'].join('\n');
 try{
   await env.CONTACT_EMAIL.send({from:SENDER,to:RECEIVER,subject:`[Agorà APS] Nuovo messaggio: ${topic}`,text});
   return result(200,{ok:true,message:'Messaggio inviato. Ti risponderemo all’indirizzo indicato.'});
 }catch{
   // Evitare log contenenti contenuto o indirizzi dei mittenti.
   return result(503,{ok:false,message:'Non siamo riusciti a inviare il messaggio. Riprova più tardi o usa l’indirizzo email indicato nella pagina.'});
 }
}

/* Richiesta preliminare di adesione: invia soltanto un messaggio alla segreteria.
   NON attribuisce qualifica di socio, NON verifica quote, NON crea credenziali. */
const membershipPage=(title,body,status=200)=>new Response('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+title+' · Agorà APS</title><style>:root{font-family:system-ui,sans-serif;background:#faf5ea;color:#302b25;line-height:1.65}body{margin:0}.wrap{width:min(670px,calc(100% - 40px));margin:10vh auto}h1{font:500 clamp(2.5rem,6vw,4.5rem)/1 Georgia,serif}a{color:#a64d26}main{background:#fffcf7;border:1px solid #dfd0b8;padding:36px}p{max-width:58ch}</style></head><body><main class="wrap"><p>AGORÀ APS · ACCADEMIA DEL DIALOGO</p><h1>'+title+'</h1>'+body+'<p><a href="/formazione/il-libro-presente/">Torna a Il libro presente</a></p></main></body></html>',{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"}});
async function processMembershipInterest(request,env){
 if(request.method!=='POST')return membershipPage('Invio non consentito','<p>Utilizza il modulo di richiesta presente nella pagina Formazione.</p>',405);
 const origin=request.headers.get('Origin');
 const same=new URL(request.url).origin;
 if(origin&&origin!==same)return membershipPage('Richiesta non autorizzata','<p>Invia la richiesta dal sito ufficiale di Agorà.</p>',403);
 const fetchSite=request.headers.get('Sec-Fetch-Site');
 if(fetchSite&&!['same-origin','none'].includes(fetchSite))return membershipPage('Richiesta non autorizzata','<p>Invia la richiesta dal sito ufficiale di Agorà.</p>',403);
 if(Number(request.headers.get('Content-Length')||0)>5000)return membershipPage('Richiesta troppo lunga','<p>Riduci la lunghezza del messaggio.</p>',413);
 let payload;
 try{
  const ct=request.headers.get('Content-Type')||'';
  if(ct.includes('application/x-www-form-urlencoded')||ct.includes('multipart/form-data'))payload=Object.fromEntries((await request.formData()).entries());
  else return membershipPage('Formato non supportato','<p>Utilizza il modulo del sito.</p>',415);
 }catch{return membershipPage('Modulo non valido','<p>Controlla i campi e riprova.</p>',400)}
 const name=normalized(payload?.fullName,120);
 const email=normalized(payload?.email,254);
 const message=normalized(payload?.message,1000);
 const website=normalized(payload?.website,150);
 const privacy=payload?.privacy==='ack';
 const topic=normalized(payload?.topic,80);
 // Honypot: non inviare messaggi e non creare falsi errori visibili ai bot.
 if(website)return membershipPage('Richiesta ricevuta','<p>Grazie per l’interesse. La richiesta sarà presa in esame dalla segreteria.</p>');
 if(!privacy||name.length<3||name.length>120||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length>1000||topic!=='Il libro presente')
  return membershipPage('Controlla i dati','<p>Indica nome completo, indirizzo email valido e conferma di aver letto l’informativa privacy.</p>',422);
 if(!env.CONTACT_EMAIL||typeof env.CONTACT_EMAIL.send!=='function')
  return membershipPage('Invio non disponibile','<p>Il servizio email non è attivo. Puoi scriverci direttamente a <a href="mailto:agora.scuoladidialogosocratico@gmail.com?subject=Richiesta%20adesione%20Il%20libro%20presente">agora.scuoladidialogosocratico@gmail.com</a>.</p>',503);
 const clean=s=>s.replace(/[\r\n\0]/g,' ').replace(/[<>]/g,'').trim();
 const body=['Richiesta di informazioni sull’adesione – Il libro presente','', 'Nome e cognome: '+clean(name),'Email del richiedente: '+clean(email),'', 'Messaggio: '+(message||'(non fornito)'),'', 'Il richiedente dichiara di aver letto l’informativa privacy.','', 'Questa richiesta NON equivale a domanda formalmente accettata né a pagamento.','La segreteria deve rispondere con indicazioni su adesione, quota attuale e bonifico.'].join('\n');
 try{
  await env.CONTACT_EMAIL.send({from:SENDER,to:RECEIVER,subject:'[Agorà APS] Interesse ad aderire – Il libro presente',text:body});
  return membershipPage('Richiesta inviata','<p>Abbiamo trasmesso la tua richiesta alla segreteria di Agorà.</p><p><strong>Prossimi passi:</strong> attendi le indicazioni sulla procedura associativa e sull’importo della quota. Non versare importi senza prima aver ricevuto le istruzioni.</p><p>L’invio non comporta ammissione automatica, pagamento o abilitazione all’area soci.</p>');
 }catch{return membershipPage('Invio non riuscito','<p>Non siamo riusciti a inviare la richiesta. Scrivici a <a href="mailto:agora.scuoladidialogosocratico@gmail.com?subject=Richiesta%20adesione%20Il%20libro%20presente">agora.scuoladidialogosocratico@gmail.com</a>.</p>',503)}
}

export default {
 async fetch(request,env){
   const pathname=new URL(request.url).pathname;
   if(pathname==='/soci'||pathname.startsWith('/soci/'))return handleMembersArea(request,env);
   if(pathname==='/guida-candidature'||pathname.startsWith('/guida-candidature/'))return handleCandidateGuide(request,env);
   if(pathname==='/area-docenti/cornaredo'||pathname.startsWith('/area-docenti/cornaredo/'))return handleTeacherArea(request,env);
   if(pathname.startsWith('/api/site-chat/')||pathname==='/api/meta-whatsapp-webhook')return handleSiteChat(request,env);
   if(pathname==='/api/contact')return processContact(request,env);
   if(pathname==='/api/membership-interest')return processMembershipInterest(request,env);
   if(pathname.startsWith('/api/'))return result(404,{ok:false,message:'Indirizzo non trovato.'});
   return env.ASSETS.fetch(request);
 },
 async email(message,env,ctx){await receiveChatEmailReply(message,env);},
 async scheduled(event,env,ctx){ctx.waitUntil(deleteExpiredChats(env));}
};
