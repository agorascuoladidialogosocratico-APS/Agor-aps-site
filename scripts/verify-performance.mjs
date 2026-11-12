import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';

const html=readFileSync('index.html','utf8');
const cssFile='assets/agora-home.css';
assert.ok(existsSync(cssFile),'Combined CSS file must exist');
assert.ok(statSync(cssFile).size>30000,'Homepage CSS appears incomplete');
assert.equal((html.match(/rel="stylesheet"/g)||[]).length,1,'Homepage must have one render-blocking CSS link');
const linkedCss=html.match(/href="(\/assets\/agora-home\.css\?v=[a-f0-9]{12})"/);
assert.ok(linkedCss,'Bundled CSS must be linked with a cache-busting content hash');
for(const old of ['/assets/book.css?','/assets/accessibility.css?','/assets/experience.css?','/assets/visual-story.css?','/assets/site-polish.css?','/assets/whatsapp-chat.css?']){
  assert.ok(!html.includes('href="'+old),'Old CSS still renders on homepage: '+old);
}
const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);
const lcp=images.find(m=>m.includes('alt="Giovani e accompagnatori riuniti attorno a un tavolo durante un'));
assert.ok(lcp,'Expected above-the-fold photo absent');
assert.ok(lcp.includes('loading="eager"')&&lcp.includes('fetchpriority="high"'),'LCP photo must be prioritized');
assert.ok(lcp.includes('width="1300"')&&lcp.includes('height="731"'),'LCP must reserve its dimensions');
const dialogue=images.find(m=>m.includes('alt="Persone riunite attorno a un tavolo in dialogo"'));
assert.ok(dialogue?.includes('srcset=')&&dialogue.includes('sizes='),'Large gallery photo must be responsive');
assert.ok(html.includes('/assets/agora_icon-144.webp'),'Small header logo missing');
assert.ok(existsSync('assets/agora_icon-144.webp'),'Generated header logo missing');
const manifest=JSON.parse(readFileSync('assets/image-optimization-manifest.json','utf8'));
assert.equal(Object.keys(manifest.files||{}).length,12,'Homepage responsive photo manifest incomplete');
const {createHash}=await import('node:crypto');
for(const [name,data] of Object.entries(manifest.files)){
 assert.ok(existsSync(name),'Referenced photo is missing: '+name);
 assert.equal(createHash('sha256').update(readFileSync(name)).digest('hex'),data.output_sha256,'Unexpected photo modification: '+name);
}
console.log('PageSpeed regression checks passed: six CSS sources in one bundle; 12 photos checked, responsive logo, prioritized LCP, unchanged source layout.');
