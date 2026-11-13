/* Agorà cinematic narrative. No canvas, remote JS or scroll hijacking.
   Image layering and native scrolling create a theatrical, depth-rich experience.
   Reduced motion and mobile show all three scenes in normal reading order. */
(() => {
 'use strict';
 const story=document.querySelector('.cinema-story');
 if(!story)return;
 const acts=[...story.querySelectorAll('[data-cinema-act]')];
 const media=window.matchMedia('(min-width:760px)');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const saveData=Boolean(navigator.connection?.saveData);
 const root=document.documentElement;
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
 const ease=n=>{n=clamp(n);return n*n*(3-2*n)};
 let frame=0,enhanced=false,visible=true;
 let pointerX=0,pointerY=0;
 const canEnhance=()=>media.matches&&!reduced.matches&&!saveData;
 const clean=()=>{
  enhanced=false;story.classList.remove('is-enhanced');
  story.style.removeProperty('--agora-tilt-x');
  story.style.removeProperty('--agora-tilt-y');
  acts.forEach(act=>{
   act.style.removeProperty('opacity');act.style.removeProperty('visibility');
   act.classList.remove('is-active');act.inert=false;
   for(const name of ['--copy-shift','--figure-shift','--orchard-shift','--sphere-x','--sphere-y','--sphere-rotation','--column-shift','--paper-x','--paper-y','--curtain-slide']){
    act.style.removeProperty(name);
   }
  });
  if(frame){cancelAnimationFrame(frame);frame=0;}
 };
 function update(){
  frame=0;if(!enhanced)return;
  story.style.setProperty('--agora-tilt-x',(-pointerY*2.4).toFixed(2)+'deg');
  story.style.setProperty('--agora-tilt-y',(pointerX*3.2).toFixed(2)+'deg');
  const rect=story.getBoundingClientRect();
  const range=Math.max(1,story.offsetHeight-window.innerHeight);
  const p=clamp(-rect.top/range);
  const o1=1-ease((p-.24)/.18);
  const o3=ease((p-.63)/.18);
  const o2=clamp(1-o1-o3);
  const values=[o1,o2,o3];
  const intro=clamp(p/.40),growth=clamp((p-.26)/.45),community=clamp((p-.64)/.36);
  acts.forEach((act,i)=>{
   const opacity=values[i];
   act.style.opacity=String(opacity);
   const show=opacity>.015;
   act.classList.toggle('is-active',show);
   act.style.visibility=show?'visible':'hidden';
   act.inert=opacity<.52;
  });
  acts[0].style.setProperty('--copy-shift',(-intro*58)+'px');
  acts[0].style.setProperty('--figure-shift',(intro*-90)+'px');
  acts[0].style.setProperty('--curtain-slide',(-intro*24)+'%');
  acts[1].style.setProperty('--copy-shift',((1-growth)*55-growth*30)+'px');
  acts[1].style.setProperty('--orchard-shift',(-growth*110)+'px');
  acts[1].style.setProperty('--sphere-x',(-growth*105)+'px');
  acts[1].style.setProperty('--sphere-y',(growth*105)+'px');
  acts[1].style.setProperty('--sphere-rotation',(growth*115)+'deg');
  acts[2].style.setProperty('--copy-shift',((1-community)*65)+'px');
  acts[2].style.setProperty('--column-shift',(community*-55)+'px');
  acts[2].style.setProperty('--paper-x',((1-community)*120)+'px');
  acts[2].style.setProperty('--paper-y',((1-community)*-70)+'px');
  root.style.setProperty('--cinema-progress',p.toFixed(4));
 }
 function schedule(){
  if(!enhanced||frame||!visible)return;
  frame=requestAnimationFrame(update);
 }
 function init(){
  if(!canEnhance()){clean();return;}
  enhanced=true;story.classList.add('is-enhanced');
  update();
 }
 story.addEventListener('pointermove',event=>{
  if(!enhanced||event.pointerType==='touch')return;
  pointerX=clamp((event.clientX/window.innerWidth-.5)*2,-1,1);
  pointerY=clamp((event.clientY/window.innerHeight-.5)*2,-1,1);
  schedule();
 },{passive:true});
 story.addEventListener('pointerleave',()=>{pointerX=pointerY=0;schedule();});
 media.addEventListener('change',init);
 reduced.addEventListener('change',init);
 document.addEventListener('agora:motion-change',event=>{
  if(event.detail?.paused)clean();
  else init();
 });
 document.addEventListener('visibilitychange',()=>{
  if(!document.hidden)schedule();
 });
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule,{passive:true});
 if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>{
   visible=entries[0]?.isIntersecting??true;
   if(visible)schedule();
  },{rootMargin:'100% 0px'}).observe(story);
 }
 let paused=false;
 try{paused=localStorage.getItem('agora-motion-paused')==='true';}catch{}
 if(!paused)init();
})();
