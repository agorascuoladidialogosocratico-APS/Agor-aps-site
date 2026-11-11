/* Enhancements are optional. A failed script must never hide content. */
(()=>{'use strict';
const init=()=>{
 const items=[...document.querySelectorAll('.pathway-card,.info-card')];
 if(!items.length||!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const visible=new Set();
 const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
   if(!isIntersecting)return;target.classList.add('is-visible');visible.add(target);observer.unobserve(target);
 }),{threshold:.08,rootMargin:'0px 0px -20px 0px'});
 document.documentElement.classList.add('reveal-ready');
 for(const item of items)observer.observe(item);
 // Keep content readable even if observers never report intersections.
 window.addEventListener('pageshow',()=>{if(document.visibilityState==='hidden')items.forEach(x=>x.classList.add('is-visible'));},{once:true});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
