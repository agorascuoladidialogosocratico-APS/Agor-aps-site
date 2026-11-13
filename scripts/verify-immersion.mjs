import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const read=path=>readFileSync(path,'utf8');
const home=read('index.html');
const css=read('assets/agora-home.css');
const js=read('assets/cinematic-agora.js');
const book=read('assets/book.js');
const bundle=read('scripts/bundle-home-css.mjs');

assert.equal((home.match(/<section class="cinema-story"/g)||[]).length,1,'One cinematic story');
assert.equal((home.match(/class="cinema-act cinema-act--/g)||[]).length,3,'Three cinematic chapters');
for(const id of ['cinema-title-1','cinema-title-2','cinema-title-3','esperienza']){
 assert.ok(home.includes('id="'+id+'"'),'Missing scene anchor '+id);
}
assert.ok(home.includes('href="#pathways-title"'),'Must offer a skip-to-content link');
assert.ok(home.includes('href="/dialogo-socratico/"'),'Dialogue link missing');
assert.ok(home.includes('href="/magazine/"'),'Magazine link missing');
assert.ok(home.includes('href="/progetti/"'),'Project link missing');
assert.ok(home.includes('href="/partecipa/"'),'Participation link missing');
assert.ok(home.includes('class="book-stage"')&&home.includes('class="story-book"'),'Existing book preserved');
assert.ok(!home.includes('class="agora-immersion"'),'Old generic abstract cube section should be removed');
assert.ok(!home.includes('src="/assets/dialogue-3d.js'),'Obsolete WebGL controller still loaded');
assert.ok(home.includes('src="/assets/cinematic-agora.js'),'Cinematic motion controller missing');
for(const asset of ['assets/cinema-curtain.svg','assets/cinema-columns.svg','assets/cinema-olive-tree.svg','assets/cinematic-agora.css']){
 assert.ok(existsSync(asset),'Missing original visual asset '+asset);
 assert.ok(statSync(asset).size>700,'Suspiciously small asset '+asset);
}
assert.ok(css.includes('/* SOURCE: assets/cinematic-agora.css */'),'Styles not included in one bundle');
assert.ok(bundle.includes("'assets/cinematic-agora.css'"),'Bundler must include cinematic styles on every rebuild');
assert.ok(css.includes('@media (prefers-reduced-motion:reduce)'),'Reduced-motion fallback absent');
assert.ok(css.includes('@media (max-width:759px)'),'Mobile fallback absent');
assert.equal((home.match(/rel="stylesheet"/g)||[]).length,1,'Do not add render-blocking CSS');
assert.equal((home.match(/<h1\b/g)||[]).length,1,'Preserve one H1');
assert.ok(home.includes('https://commons.wikimedia.org/wiki/File:The_School_of_Athens,_Plato.png'),'Plato attribution missing');
assert.ok(home.includes('https://commons.wikimedia.org/wiki/File:The_School_of_Athens,_Aristotle.png'),'Aristotle attribution missing');
assert.ok(js.includes('requestAnimationFrame'),'Motion controller must be RAF-scheduled');
assert.ok(js.includes('prefers-reduced-motion: reduce'),'Respect reduced motion');
assert.ok(js.includes('saveData'),'Respect low-bandwidth requests');
assert.ok(js.includes('act.inert'),'Hide inactive links from keyboard');
assert.ok(js.includes("addEventListener('scroll',schedule,{passive:true})"),'Do not hijack native scrolling');
assert.ok(!js.includes('window.scrollTo('),'No forced scroll position');
assert.ok(book.includes("new CustomEvent('agora:motion-change'"),'Preserve global motion setting');
for(const script of ['assets/cinematic-agora.js','assets/book.js','scripts/bundle-home-css.mjs']){
 execFileSync(process.execPath,['--check',script],{stdio:'pipe'});
}
console.log('Cinematic Agorà: scene count, original artwork, public domain attribution, accessibility, native scroll and CSS verified.');
