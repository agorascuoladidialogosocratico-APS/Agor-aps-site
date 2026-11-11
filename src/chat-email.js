/* Email di notifica e copia conversazione Agorà, senza servizi a consumo.
   Invia soltanto a Gmail verificata mediante binding Cloudflare CONTACT_EMAIL.
   Non invia password, token di sessione né link di autenticazione. */
const RECIPIENT='agora.scuoladidialogosocratico@gmail.com';
const SENDER='contatti@agora-scuoladidialogosocraticoecittadinanzattiva.site';
const OPERATOR_PAGE='https://agora-scuoladidialogosocraticoecittadinanzattiva.site/operatore/';
const readableTime=time=>new Date(time).toLocaleString('it-IT',{timeZone:'Europe/Rome',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
export function emailEnabled(env){
 return env?.CHAT_MODE==='free-dashboard' && env?.CHAT_EMAIL_NOTIFICATIONS==='true' && Boolean(env?.CONTACT_EMAIL && typeof env.CONTACT_EMAIL.send==='function');
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
 const subject='[Agorà APS · Chat #'+code+'] '+kind;
 const content=[
  'CHAT DEL SITO AGORÀ APS','',kind,'Codice conversazione: #'+code,'',
  'ULTIMO MESSAGGIO:',String(body||'').slice(0,1500),'',
  'TRASCRIZIONE RECENTE (fino a 30 messaggi, dal più vecchio al più recente):','',history||'(non disponibile)','',
  'Per rispondere al visitatore, entra nella posta privata del sito:',
  OPERATOR_PAGE,
  '',
  'Non rispondere a questa email: la conversazione si svolge sul sito.',
  'Questa notifica contiene dati di una conversazione privata: non inoltrarla a terzi.',
  'I messaggi presenti nel database del sito sono soggetti alla sua politica di conservazione. Le copie email rimangono nella casella finché non vengono eliminate.'
 ].join('\n');
 await env.CONTACT_EMAIL.send({to:RECIPIENT,from:SENDER,subject,text:content});
 return true;
}
