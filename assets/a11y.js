/* Piccoli controlli facoltativi: non sostituiscono HTML semantico né test WCAG. */
(()=>{'use strict';
 const key='agora-reading-prefs';
 const root=document.documentElement;
 const defaults={text:false,contrast:false};
 const safeRead=()=>{try{const value=JSON.parse(localStorage.getItem(key)||'null');return {text:value?.text===true,contrast:value?.contrast===true};}catch{return {...defaults}}};
 const prefs=safeRead();
 function sync(){
   root.classList.toggle('a11y-text-large',prefs.text);
   root.classList.toggle('a11y-high-contrast',prefs.contrast);
   document.querySelectorAll('[data-a11y="text"]').forEach(button=>{button.setAttribute('aria-pressed',String(prefs.text));button.setAttribute('aria-label',prefs.text?'Ripristina la dimensione normale del testo':'Aumenta la dimensione del testo');});
   document.querySelectorAll('[data-a11y="contrast"]').forEach(button=>{button.setAttribute('aria-pressed',String(prefs.contrast));button.setAttribute('aria-label',prefs.contrast?'Disattiva il contrasto elevato':'Attiva il contrasto elevato');});
 }
 function init(){
   sync();
   document.querySelectorAll('[data-a11y]').forEach(button=>button.addEventListener('click',()=>{
     if(button.dataset.a11y==='text')prefs.text=!prefs.text;
     if(button.dataset.a11y==='contrast')prefs.contrast=!prefs.contrast;
     try{localStorage.setItem(key,JSON.stringify(prefs));}catch{}
     sync();
   }));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
