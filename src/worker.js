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
export default {
 async fetch(request,env){
   const pathname=new URL(request.url).pathname;
   if(pathname.startsWith('/api/site-chat/')||pathname==='/api/meta-whatsapp-webhook')return handleSiteChat(request,env);
   if(pathname==='/api/contact')return processContact(request,env);
   if(pathname.startsWith('/api/'))return result(404,{ok:false,message:'Indirizzo non trovato.'});
   return env.ASSETS.fetch(request);
 },
 async scheduled(event,env,ctx){ctx.waitUntil(deleteExpiredChats(env));}
};
