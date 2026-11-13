/* Agorà: a one-time, non-blocking theatrical overture.
   All content and links remain available immediately; no scroll hijacking. */
(() => {
 'use strict';
 const root=document.documentElement;
 const painting=document.querySelector('.cinema-raphael');
 if(painting){
  painting.addEventListener('error',()=>{
   const fallback=painting.dataset.fallbackSrc;
   if(fallback && painting.getAttribute('src')!==fallback){
    painting.removeAttribute('data-fallback-src');
    painting.src=fallback;
   }
  },{once:true});
 }
 if(!root.classList.contains('agora-opening'))return;
 const skip=document.querySelector('.agora-overture-skip');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const saveData=Boolean(navigator.connection?.saveData);
 if(!skip || reduced.matches || saveData){
  root.classList.remove('agora-opening');
  return;
 }
 let done=false,timeout;
 const finish=()=>{
  if(done)return;
  done=true;
  root.classList.remove('agora-opening');
  root.classList.add('agora-opened');
  skip.hidden=true;
  if(timeout)clearTimeout(timeout);
 };
 skip.hidden=false;
 skip.addEventListener('click',finish,{once:true});
 document.addEventListener('agora:motion-change',finish,{once:true});
 window.addEventListener('keydown',event=>{if(event.key==='Escape')finish();});
 window.addEventListener('scroll',()=>{if(scrollY>12)finish();},{passive:true});
 window.addEventListener('pageshow',event=>{if(event.persisted)finish();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
 reduced.addEventListener('change',()=>{if(reduced.matches)finish();});
 timeout=setTimeout(finish,2600);
})();
