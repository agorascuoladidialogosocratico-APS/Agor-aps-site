/* Agorà Magazine: filtri e copia dell'IBAN senza servizi esterni. */
(()=>{'use strict';
const filters=[...document.querySelectorAll('[data-mag-filter]')];
const posts=[...document.querySelectorAll('.mag-card[data-category]')];
const empty=document.querySelector('.mag-no-results');
if(filters.length&&posts.length){
 for(const button of filters)button.addEventListener('click',()=>{
  const value=button.dataset.magFilter||'all';
  filters.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  let visible=0;posts.forEach(p=>{const show=value==='all'||p.dataset.category===value;p.hidden=!show;if(show)visible++;});
  if(empty)empty.hidden=visible!==0;
 });
}
const ibanButton=document.querySelector('[data-copy-iban]');
if(ibanButton)ibanButton.addEventListener('click',async()=>{
 const iban=ibanButton.dataset.copyIban;
 if(!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban||''))return;
 try{await navigator.clipboard.writeText(iban);ibanButton.textContent='IBAN copiato';}
 catch{ibanButton.textContent='Seleziona e copia il codice IBAN';}
});
})();
