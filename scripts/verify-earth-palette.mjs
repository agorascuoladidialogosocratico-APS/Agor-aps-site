import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(p,'utf8');
const files=[
 'assets/book.css','assets/site.css','assets/magazine.css',
 'assets/cinematic-agora.css','assets/cinematic-system.css',
 'assets/visual-story.css','assets/experience.css','assets/accessibility.css',
 'assets/site-polish.css','assets/sections.css','assets/whatsapp-chat.css',
 'assets/site-chat.css','assets/operator-chat.css','editor/studio.css',
 'assets/cinema-curtain.svg','assets/cinema-olive-tree.svg','index.html'
];
function isCold(hex){
 const rgb=hex.slice(1,7);
 const r=parseInt(rgb.slice(0,2),16),g=parseInt(rgb.slice(2,4),16),b=parseInt(rgb.slice(4,6),16);
 const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
 const saturation=delta?delta/(255-Math.abs(max+min-255)):0;
 let hue=0;
 if(delta){
  hue=max===r?((g-b)/delta+(g<b?6:0))*60:
   max===g?((b-r)/delta+2)*60:((r-g)/delta+4)*60;
 }
 return (hue>=164&&hue<=280&&saturation>.085&&b>r*.92)||
  (b>g*1.2&&b>r*1.1&&saturation>.10);
}
for(const file of files){
 const contents=read(file);
 assert.ok(!/#193b4a\b/i.test(contents),'Legacy petrol color in '+file);
 for(const match of contents.matchAll(/#[\da-fA-F]{6}(?:[\da-fA-F]{2})?\b/g)){
  assert.ok(!isCold(match[0]),'Cold cobalt/petrol hex in '+file+': '+match[0]);
 }
 for(const match of contents.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\s*\)/g)){
  const hex='#'+match.slice(1,4).map(n=>Number(n).toString(16).padStart(2,'0')).join('');
  assert.ok(!isCold(hex),'Cold RGB color in '+file+': '+match[0]);
 }
}
const home=read('index.html');
assert.ok(home.includes('content="#b85628" name="theme-color"'),'Browser bar must be terracotta');
assert.ok(!home.includes('class="cinema-progress-track"'),'Unwanted white progress bar came back');
assert.ok(home.includes('src="/assets/cinema-plato.png"'));
assert.ok(home.includes('src="/assets/cinema-aristotle.png"'));
assert.ok(home.includes('src="/assets/agora_gruppo_home.webp"'),'Authentic Agorà photos should remain');
assert.ok(home.includes('class="book-stage"')&&home.includes('class="book-index"'),'Book and navigation must survive');
for(const asset of ['assets/cinematic-agora.css','assets/cinematic-system.css']){
 assert.ok(read(asset).includes('AGORA_EARTH_'),'Earth palette overrides missing: '+asset);
}
console.log('Earth palette: no blue/petrol interface colors, no stray hero bar, official artwork and book preserved.');
