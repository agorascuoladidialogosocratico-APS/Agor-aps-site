import assert from 'node:assert/strict';
import {handleTeacherArea} from '../src/teacher-area.js';

const host='https://agora-scuoladidialogosocraticoecittadinanzattiva.site';
const path='/area-docenti/cornaredo/';
const req=(p,opts={})=>new Request(host+p,opts);

let r=await handleTeacherArea(req(path));
assert.equal(r.status,200,'Unlisted information is accessible without a password');
assert.match(r.headers.get('X-Robots-Tag'),/noindex/);
assert.match(r.headers.get('Content-Security-Policy'),/form-action 'none'/);
let html=await r.text();
assert.match(html,/Le insegnanti al centro del dialogo europeo/);
assert.match(html,/Cascina Favaglie/);
assert.match(html,/docs.google.com\/document\/d/);
assert.doesNotMatch(html,/Password di accesso|type="password"|meet.google.com/i);
r=await handleTeacherArea(req(path,{method:'HEAD'}));
assert.equal(r.status,200);
assert.equal((await r.text()).length,0);
r=await handleTeacherArea(req(path,{method:'POST',body:'x'}));
assert.equal(r.status,405);
r=await handleTeacherArea(req(path+'private-material'));
assert.equal(r.status,404);
console.log('Teacher info page: accessible via link, noindex, privacy guard, HEAD, 404 and 405 checks passed');
