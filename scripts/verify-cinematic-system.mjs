import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const read=p=>readFileSync(p,'utf8');
const home=read('index.html'),shared=read('assets/cinematic-system.css'),script=read('assets/cinematic-system.js');
assert.ok(home.includes('book-site cinematic-home cinema-system'),'Home must use shared cinematic class');
assert.ok(home.includes('/assets/cinematic-system.js?v='),'Home motion controller absent');
assert.ok(home.includes('/*')===false||home.includes('class="cinema-interlude'),'Cinematic homepage chapters missing');
assert.equal((home.match(/class="cinema-interlude cinema-motion-target/g)||[]).length,2,'Home needs two new scrolling bridges');
assert.equal((home.match(/<h1\b/g)||[]).length,1,'Home main H1 must remain unchanged');
assert.ok(home.includes('class="book-header"'),'Global homepage menu must remain');
assert.ok(home.includes('class="book-index"'),'Original book index must remain');
assert.ok(shared.includes('.cinematic-home .book-header')&&shared.includes('position:fixed'),'Home navigation must stay visible');
assert.ok(shared.includes('position:sticky'),'Institutional and Magazine menus must stay visible');
assert.ok(shared.includes('prefers-reduced-motion:reduce'),'Reduced-motion fallback required');
assert.ok(script.includes("addEventListener('scroll',schedule,{passive:true})"),'Never hijack user scroll');
assert.ok(!script.includes('window.scrollTo('),'Do not impose programmatic scrolling');
assert.ok(script.includes('IntersectionObserver'),'Motion must be visibility-aware');
for(const file of ['assets/cinema-curtain.svg','assets/cinema-olive-tree.svg','assets/cinema-columns.svg'])assert.ok(existsSync(file),'Missing original scenic art '+file);

const institution=[
'chi-siamo','dialogo-socratico','progetti','progetti/soda-labs',
'progetti/odisseo-philosophorum','tirocini','volontariato-esc',
'partecipa','contatti','trasparenza','privacy','accessibilita'
];
for(const path of institution){
 const file=path+'/index.html',html=read(file);
 assert.ok(html.includes('class="info-page cinema-system"'),'No sitewide style on '+path);
 assert.ok(html.includes('/assets/cinematic-system.css?v='),'CSS missing on '+path);
 assert.ok(html.includes('/assets/cinematic-system.js?v='),'JS missing on '+path);
 assert.ok(html.includes('class="info-nav"'),'Navigation missing on '+path);
 assert.ok(html.includes('class="cinema-scene-art"'),'Layered scenery missing on '+path);
 assert.ok(html.includes('id="approfondisci"'),'Original deep link must survive on '+path);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,'Single real H1 required on '+path);
 for(const url of ['/chi-siamo/','/progetti/','/magazine/','/partecipa/','/contatti/']){
  assert.ok(html.includes('href="'+url+'"'),'Site menu link removed from '+path+': '+url);
 }
}
for(const file of ['magazine/index.html','magazine/criteri-editoriali/index.html','magazine/benvenuti-in-agora-magazine/index.html','sostienici/index.html']){
 const html=read(file);
 assert.ok(html.includes('class="mag-body cinema-system"'),'Magazine styling missing '+file);
 assert.ok(html.includes('/assets/cinematic-system.css?v='),'Magazine CSS missing '+file);
 assert.ok(html.includes('/assets/cinematic-system.js?v='),'Magazine controller missing '+file);
 assert.ok(html.includes('class="mag-nav"'),'Magazine menu removed '+file);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,'Magazine heading damaged '+file);
}
assert.ok(read('magazine/index.html').includes('class="cinema-scene-art"'),'Magazine landing needs scenic art');
for(const path of ['assets/cinematic-system.js','scripts/generate-pages.mjs','scripts/generate-magazine.mjs'])
 execFileSync(process.execPath,['--check',path],{stdio:'pipe'});
console.log('Cinematic sitewide: 2 home bridges, 12 institution scenes, Magazine, preserved menus, progressive depth and accessible reduced-motion confirmed.');
