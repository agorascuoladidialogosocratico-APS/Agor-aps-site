import PostalMime from 'postal-mime';
/* Email di notifica e copia conversazione Agorà, senza servizi a consumo.
   Invia soltanto a Gmail verificata mediante binding Cloudflare CONTACT_EMAIL.
   Non invia password, token di sessione né link di autenticazione. */
const RECIPIENT='agora.scuoladidialogosocratico@gmail.com';
const SENDER='contatti@agora-scuoladidialogosocraticoecittadinanzattiva.site';
const INBOUND_REPLY='risposte@agora-scuoladidialogosocraticoecittadinanzattiva.site';
const OPERATOR_PAGE='https://agora-scuoladidialogosocraticoecittadinanzattiva.site/operatore/';
const readableTime=time=>new Date(time).toLocaleString('it-IT',{timeZone:'Europe/Rome',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
export function emailEnabled(env){
 return env?.CHAT_MODE==='free-dashboard' && env?.CHAT_EMAIL_NOTIFICATIONS==='true' && Boolean(env?.CONTACT_EMAIL && typeof env.CONTACT_EMAIL.send==='function');
}

export function replyEmailEnabled(env){
 return emailEnabled(env) && env.CHAT_EMAIL_REPLY_ENABLED==='true'
   && typeof env.CHAT_EMAIL_REPLY_SECRET==='string' && env.CHAT_EMAIL_REPLY_SECRET.length>=32 && Boolean(env.CHAT_DB);
}
async function hmacReplyToken(env,code){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.CHAT_EMAIL_REPLY_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const msg=new TextEncoder().encode('agora-chat-email-v1|'+code+'|'+RECIPIENT);
 const signature=new Uint8Array(await crypto.subtle.sign('HMAC',key,msg));
 return [...signature].slice(0,12).map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();
}
const secureEqual=(a,b)=>{
 if(a.length!==b.length)return false;
 let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
 return diff===0;
};
const digestEmailId=async value=>{
 const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
 return 'email:'+[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');
};
/* Process only a genuine reply from the authenticated association mailbox.
   A signed conversation code prevents forged subjects being mapped to a chat. */
export async function receiveChatEmailReply(message,env){
 if(!replyEmailEnabled(env)){
   message.setReject?.('La risposta email della chat non è ancora attiva.');
   return false;
 }
 if(String(message.to||'').toLowerCase()!==INBOUND_REPLY) {
   message.setReject?.('Indirizzo non abilitato.');return false;
 }
 const auth=String(message.headers.get('authentication-results')||'');
 if(!/^mx\.cloudflare\.net\s*;/i.test(auth)||!/\bdmarc=pass\b/i.test(auth)){
   message.setReject?.('Autenticazione email non valida.');return false;
 }
 if(String(message.from||'').toLowerCase()!==RECIPIENT) {
   message.setReject?.('Casella mittente non autorizzata.');return false;
 }
 if(Number(message.rawSize||0)>100000){
   message.setReject?.('Messaggio troppo grande per la chat.');return false;
 }
 const parsed=await PostalMime.parse(message.raw);
 const subj=String(parsed.subject||message.headers.get('subject')||'');
 const match=subj.match(/#([A-F0-9]{10})\/([A-F0-9]{24})\b/i);
 if(!match){message.setReject?.('Codice conversazione non trovato nella risposta.');return false;}
 const code=match[1].toUpperCase(),provided=match[2].toUpperCase();
 if(!secureEqual(provided,await hmacReplyToken(env,code))){
   message.setReject?.('Identificativo della chat non valido.');return false;
 }
 const mid=String(message.headers.get('message-id')||'').trim();
 if(mid.length<5||mid.length>512){message.setReject?.('Identificativo email non valido.');return false;}
 if(String(parsed.from?.address||'').toLowerCase()!==RECIPIENT){
   message.setReject?.('Mittente intestazione non autorizzato.');return false;
 }
 if(!parsed.text || (parsed.attachments||[]).length){
   message.setReject?.('Inviare soltanto risposte di testo senza allegati.');return false;
 }
 const lines=parsed.text.replace(/\r\n?/g,'\n').split('\n');
 const bodyLines=[];
 for(const line of lines){
   const trimmed=line.trim();
   if(/^>/.test(trimmed)||/^--\s*$/.test(trimmed)
     ||/^(On .{5,180} wrote:|Il giorno .{5,180} ha scritto:|Da:\s|From:\s)/i.test(trimmed)
     ||/^-{3,}\s*(Original Message|Messaggio originale)\s*-{3,}$/i.test(trimmed))break;
   bodyLines.push(line);
 }
 const body=bodyLines.join('\n').trim();
 if(body.length<2 || body.length>1500){
   message.setReject?.('Risposta di testo richiesta tra 2 e 1500 caratteri.');return false;
 }
 const chat=await env.CHAT_DB.prepare(
   'SELECT id,status FROM site_chats WHERE code=? AND updated_at>?'
 ).bind(code,Date.now()-30*86400000).first();
 if(!chat||chat.status!=='open'){
   message.setReject?.('Conversazione scaduta o chiusa.');return false;
 }
 const id=await digestEmailId(RECIPIENT+'|'+mid);
 const now=Date.now();
 const res=await env.CHAT_DB.prepare(
   "INSERT OR IGNORE INTO site_chat_messages (id,chat_id,side,body,created_at,notified) VALUES (?,?,'operator',?,?,1)"
 ).bind(id,chat.id,body,now).run();
 if(Number(res.meta?.changes??res.changes??0)>0){
   await env.CHAT_DB.prepare('UPDATE site_chats SET updated_at=? WHERE id=?').bind(now,chat.id).run();
 }
 return true;
}

export async function sendChatConversationEmail(env,{chatId,code,side,body}){
 if(!emailEnabled(env))return false;
 if(!/^[A-F0-9]{10}$/.test(String(code||'')))return false;
 const rows=await env.CHAT_DB.prepare(
  'SELECT side,body,created_at FROM site_chat_messages WHERE chat_id=? ORDER BY created_at DESC LIMIT 30'
 ).bind(chatId).all();
 const history=(rows.results||[]).slice().reverse().map(item=>
  '['+readableTime(item.created_at)+'] '+(item.side==='operator'?'Agorà APS':'Visitatore')+':\n'+String(item.body||'').slice(0,1500)
 ).join('\n\n--------------------\n\n');
 const kind=side==='operator'?'Risposta di Agorà':'Messaggio del visitatore';
 const acceptReplies=replyEmailEnabled(env);
 const replyToken=acceptReplies?await hmacReplyToken(env,code):null;
 const subject='[Agorà APS Chat #'+code+(replyToken?'/'+replyToken:'')+'] '+kind;
 const content=[
  'CHAT DEL SITO AGORÀ APS','',kind,'Codice conversazione: #'+code,'',
  'ULTIMO MESSAGGIO:',String(body||'').slice(0,1500),'',
  'TRASCRIZIONE RECENTE (fino a 30 messaggi, dal più vecchio al più recente):','',history||'(non disponibile)','',
  acceptReplies?'Per rispondere: premi Rispondi in Gmail, scrivi il tuo messaggio PRIMA del testo citato e invia.':'Per rispondere al visitatore, entra nella posta privata del sito:',
  ...(acceptReplies?['Mantieni invariato l’oggetto del messaggio e il destinatario tecnico della risposta.']: [OPERATOR_PAGE]),
  '',
  acceptReplies?'La tua risposta sarà pubblicata nella chat del sito. Non inviare informazioni riservate oltre il necessario.':'La risposta diretta all’email non è ancora attiva: usa la posta privata del sito.',
  'Questa notifica contiene dati di una conversazione privata: non inoltrarla a terzi.',
  'I messaggi presenti nel database del sito sono soggetti alla sua politica di conservazione. Le copie email rimangono nella casella finché non vengono eliminate.'
 ].join('\n');
 await env.CONTACT_EMAIL.send({to:RECIPIENT,from:SENDER,subject,text:content,...(acceptReplies?{replyTo:INBOUND_REPLY}:{})});
 return true;
}
