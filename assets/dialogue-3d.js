/* Agorà — original, dependency-free, progressively enhanced WebGL sculpture.
   The full static SVG remains available if WebGL, JS or animation is unavailable.
   Rendering is on-demand, stops off-screen and limits frame rate and pixel ratio. */
(() => {
 'use strict';
 const section=document.querySelector('.agora-immersion');
 if(!section)return;
 const stage=section.querySelector('.immersion-stage');
 const canvas=section.querySelector('.immersion-canvas');
 const button=section.querySelector('.immersion-toggle');
 const hint=section.querySelector('.immersion-hint');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const desktop=window.matchMedia('(min-width: 900px)');
 const saveData=Boolean(navigator.connection && navigator.connection.saveData);
 let globalPaused=false;
 try{globalPaused=localStorage.getItem('agora-motion-paused')==='true';}catch{}
 let active=false,visible=false,initialized=false,unavailable=false,autoAttempted=false;
 let gl,program,projection,positionLocation,normalLocation,uniforms,meshes=[];
 let frame=0,lastFrame=0,animationTime=0;
 let targetX=0,targetY=0,pointerX=0,pointerY=0,scrollRotation=0;
 const clamp=(x,low,high)=>Math.max(low,Math.min(high,x));
 const autoAllowed=()=>desktop.matches&&!reduced.matches&&!saveData&&!globalPaused&&!document.hidden;
 const V=(x,y,z)=>[x,y,z];
 const add=(a,b)=>V(a[0]+b[0],a[1]+b[1],a[2]+b[2]);
 const sub=(a,b)=>V(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
 const mul=(a,k)=>V(a[0]*k,a[1]*k,a[2]*k);
 const cross=(a,b)=>V(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]);
 const normalize=a=>{const n=Math.hypot(...a)||1;return mul(a,1/n);};

 function makeTube(curve,segments,sides,radius){
  const rings=[];
  for(let i=0;i<=segments;i++){
   const t=i/segments*Math.PI*2,point=curve(t),delta=.001;
   const tangent=normalize(sub(curve(t+delta),curve(t-delta)));
   const axis=Math.abs(tangent[2])>.93?V(0,1,0):V(0,0,1);
   const n=normalize(cross(tangent,axis)),b=normalize(cross(tangent,n));
   const ring=[];
   for(let j=0;j<=sides;j++){
    const a=j/sides*Math.PI*2;
    const normal=add(mul(n,Math.cos(a)),mul(b,Math.sin(a)));
    ring.push({p:add(point,mul(normal,radius)),n:normal});
   }
   rings.push(ring);
  }
  const out=[];
  const append=x=>out.push(...x.p,...x.n);
  for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){
   const a=rings[i][j],b=rings[i+1][j],c=rings[i][j+1],d=rings[i+1][j+1];
   append(a);append(b);append(c);append(c);append(b);append(d);
  }
  return new Float32Array(out);
 }
 function makeSphere(radius,steps=34,rows=20){
  const out=[];
  const vert=(u,v)=>{
   const phi=u*Math.PI*2,theta=v*Math.PI;
   const n=V(Math.sin(theta)*Math.cos(phi),Math.cos(theta),Math.sin(theta)*Math.sin(phi));
   return {p:mul(n,radius),n};
  };
  const append=x=>out.push(...x.p,...x.n);
  for(let y=0;y<rows;y++)for(let x=0;x<steps;x++){
   const a=vert(x/steps,y/rows),b=vert((x+1)/steps,y/rows);
   const c=vert(x/steps,(y+1)/rows),d=vert((x+1)/steps,(y+1)/rows);
   append(a);append(c);append(b);append(b);append(c);append(d);
  }
  return new Float32Array(out);
 }
 function shader(type,source){
  const s=gl.createShader(type);
  gl.shaderSource(s,source);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){
   const issue=gl.getShaderInfoLog(s)||'Shader compilation error';
   gl.deleteShader(s);throw Error(issue);
  }
  return s;
 }
 function setup(){
  gl=canvas.getContext('webgl',{
   alpha:true,antialias:true,depth:true,stencil:false,preserveDrawingBuffer:false,
   premultipliedAlpha:false,powerPreference:'low-power'
  });
  if(!gl)throw Error('WebGL non supportato');
  const vertex=shader(gl.VERTEX_SHADER,
   'attribute vec3 aPosition; attribute vec3 aNormal;'+
   'uniform mat4 uProjection;uniform float uYaw;uniform float uPitch;uniform float uScale;'+
   'varying vec3 vNormal;'+
   'vec3 rx(vec3 p,float a){float s=sin(a),c=cos(a);return vec3(p.x,p.y*c-p.z*s,p.y*s+p.z*c);}'+
   'vec3 ry(vec3 p,float a){float s=sin(a),c=cos(a);return vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);}'+
   'void main(){vec3 p=ry(rx(aPosition*uScale,uPitch),uYaw);'+
   'vNormal=ry(rx(aNormal,uPitch),uYaw);gl_Position=uProjection*vec4(p.xy,p.z-5.5,1.0);}'
  );
  const fragment=shader(gl.FRAGMENT_SHADER,
   'precision mediump float; uniform vec3 uColor;varying vec3 vNormal;'+
   'void main(){vec3 n=normalize(vNormal);vec3 l=normalize(vec3(-.52,.68,.85));'+
   'float diff=max(dot(n,l),0.0);float rim=pow(1.0-abs(n.z),2.0);'+
   'vec3 color=uColor*(.52+.53*diff)+vec3(.18,.16,.12)*rim;'+
   'gl_FragColor=vec4(min(color,vec3(1.0)),1.0);}'
  );
  program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||'WebGL link failed');
  gl.deleteShader(vertex);gl.deleteShader(fragment);gl.useProgram(program);
  positionLocation=gl.getAttribLocation(program,'aPosition');
  normalLocation=gl.getAttribLocation(program,'aNormal');
  uniforms={
   projection:gl.getUniformLocation(program,'uProjection'),
   yaw:gl.getUniformLocation(program,'uYaw'),
   pitch:gl.getUniformLocation(program,'uPitch'),
   scale:gl.getUniformLocation(program,'uScale'),
   color:gl.getUniformLocation(program,'uColor')
  };
  const knot=t=>{
   const r=1.11+.37*Math.cos(3*t);
   return V(r*Math.cos(2*t),r*Math.sin(2*t),.43*Math.sin(3*t));
  };
  const orbit=t=>V(1.58*Math.cos(t),.96*Math.sin(t),.53*Math.sin(2*t));
  const addMesh=(data,color,scale=1,phase=0)=>{
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
   meshes.push({buffer,count:data.length/6,color,scale,phase});
  };
  addMesh(makeTube(knot,140,9,.10),[.91,.70,.45],1,0);
  addMesh(makeTube(orbit,112,9,.068),[.56,.82,.73],1,.86);
  addMesh(makeSphere(.265),[.98,.87,.64],1,0);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0,0,0,0);
  canvas.addEventListener('webglcontextlost',event=>{
   event.preventDefault();
   unavailable=true;deactivate();button.disabled=true;button.textContent='Scena statica disponibile';
  },{once:true});
  initialized=true;resize();
 }
 function resize(){
  if(!initialized||!gl)return;
  const box=stage.getBoundingClientRect();
  const ratio=Math.min(window.devicePixelRatio||1,window.innerWidth<760?1.2:1.55);
  const width=Math.max(1,Math.round(box.width*ratio)),height=Math.max(1,Math.round(box.height*ratio));
  if(canvas.width===width&&canvas.height===height)return;
  canvas.width=width;canvas.height=height;
  gl.viewport(0,0,width,height);
  const aspect=width/height,f=1/Math.tan(36*Math.PI/360),near=.1,far=40;
  projection=new Float32Array([
   f/aspect,0,0,0,
   0,f,0,0,
   0,0,(far+near)/(near-far),-1,
   0,0,2*far*near/(near-far),0
  ]);
 }
 function draw(t){
  if(!active||!visible||document.hidden){frame=0;return;}
  frame=requestAnimationFrame(draw);
  if(t-lastFrame<38)return; // cap GPU work to ~26 fps
  const dt=lastFrame?clamp((t-lastFrame)/1000,0,.1):.038;
  lastFrame=t;animationTime+=dt;
  pointerX+=(targetX-pointerX)*.065;
  pointerY+=(targetY-pointerY)*.065;
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniformMatrix4fv(uniforms.projection,false,projection);
  for(const mesh of meshes){
   gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);
   gl.enableVertexAttribArray(positionLocation);
   gl.vertexAttribPointer(positionLocation,3,gl.FLOAT,false,24,0);
   gl.enableVertexAttribArray(normalLocation);
   gl.vertexAttribPointer(normalLocation,3,gl.FLOAT,false,24,12);
   gl.uniform1f(uniforms.yaw,animationTime*.18+pointerX*.38+scrollRotation+mesh.phase);
   gl.uniform1f(uniforms.pitch,.19+pointerY*.29+Math.sin(animationTime*.15)*.07);
   gl.uniform1f(uniforms.scale,mesh.scale);
   gl.uniform3fv(uniforms.color,mesh.color);
   gl.drawArrays(gl.TRIANGLES,0,mesh.count);
  }
 }
 function resume(){
  if(!active||!visible||document.hidden||frame)return;
  lastFrame=0;frame=requestAnimationFrame(draw);
 }
 function suspend(){if(frame)cancelAnimationFrame(frame);frame=0;lastFrame=0;}
 function activate(){
  if(active||unavailable)return;
  try{if(!initialized)setup();}catch(error){
   console.warn('Agorà: visualizzazione WebGL non disponibile.',error);
   unavailable=true;button.disabled=true;button.textContent='Scena statica disponibile';
   return;
  }
  active=true;section.classList.add('is-3d');
  button.textContent='Ferma il 3D';button.setAttribute('aria-pressed','true');
  hint.textContent='Muovi il puntatore per esplorare le forme.';
  resume();
 }
 function deactivate(){
  active=false;suspend();section.classList.remove('is-3d');
  button.setAttribute('aria-pressed','false');button.textContent='Attiva il 3D';
  hint.textContent='Una scultura delle idee. Anche senza animazioni.';
 }
 button.addEventListener('click',()=>active?deactivate():activate());
 stage.addEventListener('pointermove',event=>{
  if(!active)return;
  const box=stage.getBoundingClientRect();
  targetX=clamp((event.clientX-box.left)/box.width*2-1,-1,1);
  targetY=clamp((event.clientY-box.top)/box.height*2-1,-1,1);
 },{passive:true});
 stage.addEventListener('pointerleave',()=>{targetX=targetY=0;});
 document.addEventListener('visibilitychange',()=>document.hidden?suspend():resume());
 document.addEventListener('agora:motion-change',event=>{
  globalPaused=Boolean(event.detail&&event.detail.paused);
  if(globalPaused)deactivate();
 });
 reduced.addEventListener('change',()=>{if(reduced.matches)deactivate();});
 window.addEventListener('resize',()=>{if(initialized)resize();},{passive:true});
 window.addEventListener('scroll',()=>{if(visible)scrollRotation=clamp(window.scrollY/Math.max(window.innerHeight,1),0,4)*.15;},{passive:true});
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   visible=entries.some(entry=>entry.isIntersecting);
   if(!visible){suspend();return;}
   if(!autoAttempted&&autoAllowed()){
    autoAttempted=true;
    // Start only after important visual content has had an opportunity to paint.
    const start=()=>{if(visible&&autoAllowed())activate();};
    if('requestIdleCallback' in window)requestIdleCallback(start,{timeout:2300});
    else if(document.readyState==='complete')requestAnimationFrame(start);
    else window.addEventListener('load',start,{once:true});
   }
   else resume();
  },{rootMargin:'80px 0px',threshold:.12});
  observer.observe(section);
 }else{
  visible=true;
  // Older browsers receive the full static illustration; no WebGL autostart.
 }
})();
