/* Chat Agorà: il visitatore non viene MAI trasferito a WhatsApp. */
(()=>{'use strict';
const app=document.createElement('div');app.className='agora-site-chat';
app.innerHTML=[
 '<button class="agora-chat-launch" type="button" aria-controls="agora-site-chat-window" aria-expanded="false" aria-label="Apri chat sul sito Agorà"><span class="agora-chat-launch-icon" aria-hidden="true">✳</span><span>Chat Agorà</span></button>',
 '<section class="agora-chat-window" id="agora-site-chat-window" role="dialog" aria-modal="false" aria-labelledby="agora-chat-heading" hidden>',
 '<header class="agora-chat-head"><span class="agora-chat-avatar"><img src="/assets/agora_icon.png" alt="" width="38" height="38"></span><div><strong id="agora-chat-heading">Parliamo qui.</strong><span>Una conversazione sul sito di Agorà</span></div><button class="agora-chat-close" type="button" aria-label="Chiudi la chat">×</button></header>',
 '<div class="agora-chat-body"><p class="agora-chat-intro">Benvenuto nello spazio di dialogo di Agorà. Scrivi qui: quando la chat è attiva, anche le risposte arriveranno qui, senza aprire WhatsApp.</p>',
 '<div class="agora-chat-unavailable" hidden><p>La chat bidirezionale è in attivazione. Per ricevere una risposta puoi usare il modulo sul sito.</p><a href="/contatti/#scrivici">Apri il modulo contatti <span aria-hidden="true">↗</span></a></div>',
 '<div class="agora-chat-conversation" hidden><div class="agora-chat-messages" role="log" aria-live="polite" aria-relevant="additions text"></div><p class="agora-chat-status" role="status" aria-live="polite"></p></div>',
 '<div class="agora-chat-start" hidden><p>Prima di iniziare, completa la verifica di sicurezza. Per il servizio conserviamo i messaggi fino a 30 giorni.</p><div id="agora-chat-turnstile"></div><button class="agora-chat-begin" type="button" disabled>Inizia la conversazione</button></div></div>',
 '<form class="agora-chat-compose" hidden><label for="agora-chat-message">Il tuo messaggio</label><textarea id="agora-chat-message" rows="3" minlength="2" maxlength="1500" placeholder="Scrivi una domanda…" required></textarea><button type="submit">Invia nella chat <span aria-hidden="true">↗</span></button></form>',
 '<footer class="agora-chat-footer">Le risposte compaiono qui. <a href="/privacy/">Informativa privacy</a></footer>',
 '</section>'
].join('');
document.body.append(app);
const btn=app.querySelector('.agora-chat-launch'),panel=app.querySelector('.agora-chat-window'),close=app.querySelector('.agora-chat-close'),offline=app.querySelector('.agora-chat-unavailable'),start=app.querySelector('.agora-chat-start'),begin=app.querySelector('.agora-chat-begin'),conversation=app.querySelector('.agora-chat-conversation'),messages=app.querySelector('.agora-chat-messages'),status=app.querySelector('.agora-chat-status'),form=app.querySelector('.agora-chat-compose'),field=app.querySelector('#agora-chat-message');
const key='agora.siteChat.session';let token=null,pollTimer=null,ready=false,sitekey=null,turnstileToken=null,running=false;
try{const saved=sessionStorage.getItem(key);if(/^[a-f0-9]{64}$/.test(saved||''))token=saved;}catch{}
const setStatus=s=>{status.textContent=s;};
const toggle=open=>{panel.hidden=!open;btn.setAttribute('aria-expanded',String(open));if(open)(ready&&token?field:close).focus();else btn.focus();if(open)beginPoll();else stopPoll();};
btn.addEventListener('click',()=>toggle(panel.hidden));close.addEventListener('click',()=>toggle(false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)toggle(false);});document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!app.contains(e.target))toggle(false);});
const api=async (path,method='GET',body)=>{
 const headers={'Accept':'application/json'};if(body)headers['Content-Type']='application/json';if(token)headers.Authorization='Bearer '+token;
 const r=await fetch(path,{method,headers,body:body?JSON.stringify(body):undefined,credentials:'same-origin',cache:'no-store'});
 const data=await r.json();return {ok:r.ok,data,status:r.status};
};
const showConversation=()=>{offline.hidden=true;start.hidden=true;conversation.hidden=false;form.hidden=false;ready=true;};
const draw=items=>{
 const nearBottom=messages.scrollHeight-messages.scrollTop-messages.clientHeight<100;
 const ids=new Set([...messages.children].map(n=>n.dataset.id));
 for(const m of items){
   if(ids.has(m.id))continue;
   const bubble=document.createElement('article');bubble.className='agora-chat-bubble '+(m.side==='visitor'?'from-visitor':'from-agora');bubble.dataset.id=m.id;
   const who=document.createElement('strong');who.textContent=m.side==='visitor'?'Tu':'Agorà APS';
   const content=document.createElement('p');content.textContent=m.body;
   const time=document.createElement('time');time.textContent=new Date(m.createdAt).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
   bubble.append(who,content,time);messages.append(bubble);
 }
 if(nearBottom)messages.scrollTop=messages.scrollHeight;
};
const fetchMessages=async()=>{
 if(!token||running||panel.hidden||!ready)return;
 running=true;try{const {ok,data,status:code}=await api('/api/site-chat/messages');if(ok)draw(data.messages||[]);else if(code===401){clear();setStatus('La sessione è scaduta. Apri una nuova conversazione.');start.hidden=false;form.hidden=true;conversation.hidden=true;}}catch{setStatus('Connessione temporaneamente non disponibile.');}finally{running=false;}
};
function stopPoll(){if(pollTimer){clearInterval(pollTimer);pollTimer=null;}}
function beginPoll(){if(token&&ready&&!pollTimer){fetchMessages();pollTimer=setInterval(fetchMessages,5000);}}
function clear(){token=null;ready=false;stopPoll();try{sessionStorage.removeItem(key);}catch{}}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(!token||!form.reportValidity())return;
 const message=field.value.trim();if(message.length<2)return;
 const send=form.querySelector('button');send.disabled=true;setStatus('Invio del messaggio…');
 try{const {ok,data}=await api('/api/site-chat/message','POST',{message});
 if(!ok){setStatus(data.message||'Invio non riuscito. Riprova.');return;}
 field.value='';setStatus(data.message||'Messaggio registrato.');await fetchMessages();
 }catch{setStatus('Impossibile inviare ora. Riprovare, il testo è ancora nella casella.');}
 finally{send.disabled=false;}
});
const loadTurnstile=()=>new Promise((resolve,reject)=>{
 if(window.turnstile)return resolve(window.turnstile);
 const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.defer=true;script.onload=()=>window.turnstile?resolve(window.turnstile):reject(Error('turnstile'));script.onerror=()=>reject(Error('turnstile'));document.head.append(script);
});
async function setupSecurity(){
 try{const lib=await loadTurnstile();lib.render('#agora-chat-turnstile',{sitekey,callback:t=>{turnstileToken=t;begin.disabled=false;},'expired-callback':()=>{turnstileToken=null;begin.disabled=true;},'error-callback':()=>{turnstileToken=null;begin.disabled=true;}});}
 catch{start.innerHTML='<p>Verifica di sicurezza non disponibile. Usa il <a href="/contatti/#scrivici">modulo contatti</a>.</p>';}
}
begin.addEventListener('click',async()=>{
 if(!turnstileToken)return;begin.disabled=true;
 try{const {ok,data}=await api('/api/site-chat/start','POST',{turnstileToken});if(!ok){start.querySelector('p').textContent=data.message||'Impossibile iniziare. Riprova.';return;}
 token=data.token;try{sessionStorage.setItem(key,token);}catch{}
 showConversation();setStatus('Chat aperta. Quando Agorà risponderà, il messaggio comparirà qui.');beginPoll();field.focus();
 }catch{start.querySelector('p').textContent='Impossibile aprire la chat. Riprova più tardi.';}
 finally{if(!token){turnstileToken=null;begin.disabled=true;}}
});
async function init(){
 try{const {ok,data}=await api('/api/site-chat/status');
 if(!ok||data.enabled!==true){offline.hidden=false;return;}
 sitekey=data.sitekey;if(!sitekey){offline.hidden=false;return;}
 if(token){
   const verify=await api('/api/site-chat/messages');
   if(verify.ok){showConversation();draw(verify.data.messages||[]);return;}
   clear();
 }
 start.hidden=false;setupSecurity();
 }catch{offline.hidden=false;}
}
init();
})();
