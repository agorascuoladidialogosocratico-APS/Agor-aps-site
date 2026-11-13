/* Shared Agorà cinematic motion: one small progressive enhancer for all routes.
   Decorative layers only; headings, navigation, forms and article prose remain
   semantic HTML. No scroll interception, third-party JS or animation on reduced motion. */
(() => {
  'use strict';
  const body=document.body;
  if(!body.classList.contains('cinema-system'))return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow=window.matchMedia('(max-width: 819px)');
  const saveData=Boolean(navigator.connection&&navigator.connection.saveData);
  let motionPaused=false;
  try{motionPaused=localStorage.getItem('agora-motion-paused')==='true';}catch{}
  let scheduled=false;
  const layers=[...document.querySelectorAll('[data-cinema-depth]')];
  const targets=[...document.querySelectorAll('.cinema-motion-target')];
  const visibleLayers=new Set();
  const canAnimate=()=>!reduced.matches&&!motionPaused&&!saveData&&!document.hidden&&!narrow.matches;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const reset=()=>{
    body.classList.remove('motion-ready');
    for(const layer of layers)layer.style.removeProperty('--cx-depth');
    for(const el of targets)el.classList.add('is-in-view');
  };
  const refresh=()=>{
    const y=window.scrollY||0;
    body.classList.toggle('nav-scrolled',y>30);
    if(!canAnimate()){reset();return;}
    for(const layer of visibleLayers){
      const rect=layer.parentElement?.getBoundingClientRect();
      if(!rect)continue;
      const dist=clamp((window.innerHeight*.5-rect.top-rect.height*.5)/Math.max(window.innerHeight,1),-1.1,1.1);
      const depth=clamp(Number(layer.dataset.cinemaDepth||0.12),-.5,.5);
      layer.style.setProperty('--cx-depth',(dist*depth*95).toFixed(1)+'px');
      if(layer.matches('.visual-cover-photo img'))layer.style.setProperty('--cx-photo-y',(dist*depth*35).toFixed(1)+'px');
    }
  };
  const tick=()=>{scheduled=false;refresh();};
  const schedule=()=>{
    if(!scheduled){scheduled=true;requestAnimationFrame(tick);}
  };
  if('IntersectionObserver' in window){
    const layerObserver=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting)visibleLayers.add(entry.target);
        else {visibleLayers.delete(entry.target);entry.target.style.removeProperty('--cx-depth');}
      }
      schedule();
    },{rootMargin:'25% 0px'});
    layers.forEach(el=>layerObserver.observe(el));
    if(!reduced.matches&&!saveData){
      const revealObserver=new IntersectionObserver(entries=>{
        for(const entry of entries){
          if(entry.isIntersecting){
            entry.target.classList.add('is-in-view');
            revealObserver.unobserve(entry.target);
          }
        }
      },{rootMargin:'0px 0px 80px 0px',threshold:0.05});
      targets.forEach(el=>revealObserver.observe(el));
      // During warm-up all content remains visible and accessible; after
      // observers register, tiny transitions may be activated.
      body.classList.add('motion-ready');
    }
  }else reset();
  document.addEventListener('agora:motion-change',event=>{
    motionPaused=Boolean(event.detail?.paused);
    if(motionPaused)reset();else schedule();
  });
  reduced.addEventListener('change',()=>{
    if(reduced.matches)reset();else schedule();
  });
  narrow.addEventListener('change',schedule);
  document.addEventListener('visibilitychange',schedule);
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  schedule();
})();
