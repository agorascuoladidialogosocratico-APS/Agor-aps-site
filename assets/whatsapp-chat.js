/* Chat Agorà: apre WhatsApp Business soltanto se il numero ufficiale è configurato. */
(()=>{'use strict';
const host=document.createElement('div');host.className='wa-widget';
host.innerHTML='<button class="wa-launcher" type="button" aria-expanded="false" aria-controls="agora-whatsapp-panel" aria-label="Apri i contatti di Agorà"><span class="wa-launcher-icon" aria-hidden="true">✳</span><span class="wa-launcher-text">Parliamone</span></button>'+
'<section class="wa-panel" id="agora-whatsapp-panel" role="dialog" aria-modal="false" aria-labelledby="agora-chat-title" hidden>'+
'<div class="wa-panel-head"><span class="wa-panel-brand"><img src="/assets/agora_icon.png" alt="" width="44" height="44"></span><div class="wa-panel-title"><strong id="agora-chat-title">Agorà APS</strong><span>Lo spazio delle domande</span></div><button type="button" class="wa-panel-close" aria-label="Chiudi la finestra di conversazione">×</button></div>'+
'<div class="wa-panel-main"><div class="wa-panel-caption">UN DIALOGO ALLA VOLTA</div><div class="wa-bubble wa-bubble-received" data-wa-welcome>Ciao! Come possiamo aiutarti?</div>'+
'<div class="wa-ready" hidden><p class="wa-choices-label">Puoi iniziare da una di queste domande</p><div class="wa-choices"><button type="button" data-prompt="Vorrei informazioni sui progetti Erasmus+ di Agorà APS.">Progetti europei</button><button type="button" data-prompt="Vorrei sapere come svolgere un tirocinio con Agorà APS.">Tirocini</button><button type="button" data-prompt="Vorrei proporre una collaborazione ad Agorà APS.">Collaborazioni</button></div></div>'+
'<div class="wa-pending" hidden><p>Il collegamento a WhatsApp Business è in configurazione. Puoi già inviarci un messaggio dal sito.</p><a href="/contatti/#scrivici">Apri il modulo contatti <span aria-hidden="true">↗</span></a></div></div>'+
'<form class="wa-compose" hidden><label for="wa-composer">Il tuo messaggio</label><textarea id="wa-composer" rows="3" maxlength="1000" minlength="2" placeholder="Scrivi la tua domanda…" required></textarea><button type="submit">Continua su WhatsApp <span aria-hidden="true">↗</span></button><small>WhatsApp si apre con il testo pronto: sarai tu a scegliere quando inviarlo.</small></form>'+
'<div class="wa-panel-footer">Nessuna risposta automatica: parli con le persone di Agorà.</div></section>';
document.body.append(host);
const launcher=host.querySelector('.wa-launcher'),panel=host.querySelector('.wa-panel'),close=host.querySelector('.wa-panel-close'),compose=host.querySelector('.wa-compose'),ready=host.querySelector('.wa-ready'),pending=host.querySelector('.wa-pending'),message=host.querySelector('#wa-composer'),welcome=host.querySelector('[data-wa-welcome]');
let phone='';
function toggle(open){panel.hidden=!open;launcher.setAttribute('aria-expanded',String(open));if(open)(phone?message:close).focus();else launcher.focus();}
launcher.addEventListener('click',()=>toggle(panel.hidden));
close.addEventListener('click',()=>toggle(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)toggle(false)});
document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!host.contains(e.target))toggle(false)});
host.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>{message.value=b.dataset.prompt||'';message.focus();}));
compose.addEventListener('submit',e=>{e.preventDefault();if(!phone||!compose.reportValidity())return;const draft=message.value.trim();if(draft.length<2)return;window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(draft),'_blank','noopener,noreferrer');});
function state(connected){launcher.classList.toggle('wa-connected',connected);launcher.setAttribute('aria-label',connected?'Apri la chat WhatsApp Business di Agorà':'Apri le opzioni di contatto di Agorà');host.querySelector('.wa-launcher-text').textContent=connected?'WhatsApp':'Parliamone';ready.hidden=!connected;compose.hidden=!connected;pending.hidden=connected;}
async function init(){try{const r=await fetch('/content/whatsapp.json',{cache:'no-cache',credentials:'same-origin'});if(!r.ok)throw Error('missing config');const d=await r.json();const candidate=String(d?.phoneNumber||'').replace(/\D/g,'');const ok=d?.enabled===true && /^[1-9]\d{7,14}$/.test(candidate);host.querySelector('#agora-chat-title').textContent=typeof d?.businessName==='string'?d.businessName.slice(0,60):'Agorà APS';if(typeof d?.welcome==='string')welcome.textContent=d.welcome.slice(0,300);if(ok){phone=candidate;message.value=typeof d?.defaultMessage==='string'?d.defaultMessage.slice(0,300):'Ciao Agorà APS, vorrei informazioni.';}state(ok);}catch{state(false);}}
init();
})();
