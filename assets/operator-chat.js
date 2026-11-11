/* Agorà APS · Posta operatore. Nessun servizio esterno e nessun dato in URL. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const login=$('operator-login'),dashboard=$('operator-dashboard'),loginForm=$('operator-login-form'),loginStatus=$('operator-login-status'),list=$('operator-chats'),messages=$('operator-messages'),replyForm=$('operator-reply-form'),reply=$('operator-reply'),status=$('operator-status');
const cacheKey='agora.operator.sessionSecret';let key='',activeChat=null,timer=null,activeRows=[];
try{key=sessionStorage.getItem(cacheKey)||'';}catch{}
const state=(el,message)=>{el.textContent=message||''};
async function api(path,method='GET',body){
 const r=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:{
 'Accept':'application/json','X-Agora-Operator-Key':key,...(body?{'Content-Type':'application/json'}:{})
 },body:body?JSON.stringify(body):undefined});
 let data;try{data=await r.json();}catch{data={message:'Risposta non valida dal server.'};}
 if(!r.ok)throw Object.assign(new Error(data.message||'Richiesta non riuscita.'),{status:r.status});
 return data;
}
const formatTime=time=>new Date(time).toLocaleString('it-IT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
function showDashboard(){login.hidden=true;dashboard.hidden=false;state(loginStatus,'');}
function showLogin(reason){clearInterval(timer);timer=null;activeChat=null;activeRows=[];dashboard.hidden=true;login.hidden=false;replyForm.hidden=true;messages.replaceChildren();list.replaceChildren();if(reason)state(loginStatus,reason);}
function logout(){key='';try{sessionStorage.removeItem(cacheKey);}catch{}$('operator-key').value='';showLogin('Accesso terminato.');}
$('operator-logout').addEventListener('click',logout);
const make=(tag,cls,value)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=String(value);return el;};
function renderChats(rows){
 activeRows=rows;
 list.replaceChildren();
 if(!rows.length){list.append(make('p','empty','Non ci sono ancora conversazioni.'));return;}
 for(const chat of rows){
  const button=make('button','chat-item'+(activeChat===chat.id?' active':''));
  button.type='button';button.dataset.id=chat.id;
  button.append(make('span','chat-code',chat.code));
  button.append(make('span','chat-preview',chat.preview||'Conversazione appena iniziata'));
  const foot=make('span','chat-meta');foot.append(make('time','',formatTime(chat.updatedAt)));
  if(chat.unanswered>0)foot.append(make('span','chat-unread',chat.unanswered+' da leggere'));
  button.append(foot);
  button.addEventListener('click',()=>selectChat(chat.id));
  list.append(button);
 }
}
async function fetchChats(){
 if(!key||document.hidden)return;
 try{
  const data=await api('/api/site-chat/admin/chats');
  renderChats(data.chats||[]);
  if(activeChat&&!activeRows.some(x=>x.id===activeChat)){activeChat=null;replyForm.hidden=true;}
 }catch(error){state(status,error.message);if(error.status===401)logout();}
}
function draw(items){
 const atBottom=messages.scrollHeight-messages.scrollTop-messages.clientHeight<95;
 messages.replaceChildren();
 if(!items.length)messages.append(make('p','empty','Nessun messaggio in questa conversazione.'));
 for(const item of items){
  const article=make('article','bubble '+(item.side==='operator'?'sent':'received'));
  article.append(make('strong','',item.side==='operator'?'Tu · Agorà APS':'Visitatore'));
  article.append(make('p','',item.body));
  article.append(make('time','',formatTime(item.createdAt)));
  messages.append(article);
 }
 if(atBottom)messages.scrollTop=messages.scrollHeight;
}
async function fetchSelected(){
 if(!activeChat||!key)return;
 try{
  const data=await api('/api/site-chat/admin/messages?chatId='+encodeURIComponent(activeChat));
  if(data.chat.id!==activeChat)return;
  $('current-title').textContent='Conversazione '+data.chat.code;
  $('current-state').textContent=data.chat.status==='open'?'Aperta':'Terminata';
  replyForm.hidden=data.chat.status!=='open';draw(data.messages||[]);
 }catch(error){state(status,error.message);if(error.status===401)logout();}
}
function selectChat(id){
 activeChat=id;state(status,'');renderChats(activeRows);fetchSelected();
 if(window.innerWidth<800)$('operator-messages').scrollIntoView({block:'nearest',behavior:'smooth'});
}
async function tick(){if(!key||document.hidden)return;await fetchChats();if(activeChat)await fetchSelected();}
function begin(){clearInterval(timer);timer=setInterval(tick,7000);tick();}
loginForm.addEventListener('submit',async event=>{
 event.preventDefault();
 const entered=$('operator-key').value.trim();
 if(entered.length<40||entered.length>200){state(loginStatus,'Inserisci la chiave di accesso configurata in Cloudflare.');return;}
 key=entered;state(loginStatus,'Verifica dell’accesso…');
 try{
  const r=await api('/api/site-chat/admin/chats');
  try{sessionStorage.setItem(cacheKey,key);}catch{}
  $('operator-key').value='';showDashboard();renderChats(r.chats||[]);begin();
 }catch(error){key='';state(loginStatus,error.message||'Accesso non riuscito.');}
});
replyForm.addEventListener('submit',async event=>{
 event.preventDefault();if(!activeChat||!replyForm.reportValidity())return;
 const text=reply.value.trim();if(text.length<2)return;
 const button=replyForm.querySelector('button');button.disabled=true;state(status,'Invio della risposta…');
 try{
  const r=await api('/api/site-chat/admin/reply','POST',{chatId:activeChat,message:text});
  reply.value='';state(status,r.message||'Risposta inviata.');await fetchSelected();await fetchChats();
 }catch(error){state(status,error.message||'Errore nell’invio.');if(error.status===401)logout();}
 finally{button.disabled=false;}
});
$('refresh-chats').addEventListener('click',tick);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&key)tick();});
if(key){api('/api/site-chat/admin/chats').then(data=>{showDashboard();renderChats(data.chats||[]);begin();}).catch(()=>logout());}
})();
