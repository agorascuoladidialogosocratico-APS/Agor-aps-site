/* Contatto progressivamente migliorato. Nessuna conferma prima di una risposta HTTP positiva. */
(()=>{'use strict';
function start(){
 const form=document.querySelector('#agora-contact-form');
 if(!form)return;
 const feedback=form.querySelector('[data-contact-status]');
 const button=form.querySelector('[type="submit"]');
 const count=form.querySelector('[data-contact-counter]');
 const textarea=form.querySelector('[name="message"]');
 const defaultLabel=button.textContent;
 const status=(message,success)=>{feedback.textContent=message;feedback.dataset.state=success?'success':'error';feedback.hidden=false;};
 const refresh=()=>{if(count)count.textContent=String(textarea.value.length)+' / 4000 caratteri';};
 if(textarea){textarea.addEventListener('input',refresh);refresh();}
 form.addEventListener('submit',async event=>{
   event.preventDefault();
   feedback.hidden=true;
   if(!form.reportValidity())return;
   button.disabled=true;button.textContent='Invio in corso…';
   const data=new FormData(form);
   const payload=Object.fromEntries(data.entries());
   payload.consent=data.get('consent')==='yes';
   try{
     const response=await fetch('/api/contact',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:typeof AbortSignal!=='undefined' && typeof AbortSignal.timeout==='function'?AbortSignal.timeout(15000):undefined});
     const json=await response.json();
     if(!response.ok||!json.ok){status(json.message||'Invio non riuscito. Utilizza l’indirizzo email indicato nella pagina.',false);return;}
     status(json.message||'Messaggio inviato.',true);
     form.reset();refresh();
   }catch{status('Invio non riuscito. Puoi scriverci direttamente per email tramite il collegamento in fondo alla pagina.',false);}
   finally{button.disabled=false;button.textContent=defaultLabel;}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
