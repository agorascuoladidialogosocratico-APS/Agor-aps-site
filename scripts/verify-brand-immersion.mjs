import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const read=file=>readFileSync(file,'utf8');
const home=read('index.html');
const css=read('assets/cinematic-system.css');
const bundle=read('assets/agora-home.css');
const motion=read('assets/cinematic-agora.js');
const skill=read('.agents/skills/agora-immersive-audit/SKILL.md');
assert.ok(css.includes('AGORA_BRAND_DEPTH_V1'),'Brand and 3D layer missing');
for(const token of ['#332b24','#b85628','#fffaf5','#f8f0e6','#e5ebe6','#efbb82'])
 assert.ok(css.includes(token),'Missing brand token: '+token);
assert.ok(css.includes('perspective:1400px')&&css.includes('rotateY('),'3D depth must be real CSS perspective');
assert.ok(css.includes('prefers-reduced-motion:reduce'),'Reduced motion fallback missing');
assert.ok(motion.includes('pointermove')&&motion.includes('--agora-tilt-y'),'Interactive depth missing');
assert.ok(motion.includes('!visible'),'Offscreen animation must pause');
assert.ok(home.includes('<meta content="#b85628" name="theme-color"/>'),'Browser theme has drifted');
assert.ok(!home.includes('<meta content="#065bdd" name="theme-color"/>'),'Old cobalt browser theme');
assert.ok(!home.includes('#193b4a'),'Old petrol color in homepage');
assert.ok(!css.includes('#193b4a'),'Old petrol color in cinematic system');
assert.ok(bundle.includes('AGORA_BRAND_DEPTH_V1'),'Home bundle missing brand depth');
assert.ok(home.includes('class="book-stage"')&&home.includes('class="book-index"'),'Book or index removed');
assert.ok(home.includes('href="/magazine/"')&&home.includes('href="/progetti/"'),'Navigation damaged');
assert.ok(skill.includes('Immutable contracts'),'Local audit protocol missing');
for(const f of ['assets/cinematic-agora.js','assets/cinematic-system.js'])
 execFileSync(process.execPath,['--check',f],{stdio:'pipe'});
console.log('Agorà brand depth: logo palette, 3D, native URLs, menu, a11y and static fallback verified.');
