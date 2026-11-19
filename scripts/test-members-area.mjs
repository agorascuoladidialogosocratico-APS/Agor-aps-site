import assert from 'node:assert/strict';
import {handleMembersArea} from '../src/members-area.js';
const url='https://agora-scuoladidialogosocraticoecittadinanzattiva.site/soci/';
const open=async (env={},token=null,method='GET')=>{
 const headers=token?{'Cf-Access-Jwt-Assertion':token}:{};
 return handleMembersArea(new Request(url,{method,headers}),env);
};
const off=await open();
assert.equal(off.status,503,'In assenza di secrets il portale deve restare disabilitato');
assert.match(off.headers.get('cache-control'),/no-store/);
assert.match(off.headers.get('x-robots-tag'),/noindex/);
const env={CF_ACCESS_TEAM_DOMAIN:'https://agora.cloudflareaccess.com',CF_ACCESS_AUD:'test-audience',AGORA_MEMBER_EMAILS:'socio-esempio@example.invalid'};
assert.equal((await open(env)).status,401,'Senza JWT non deve entrare nessuno');
assert.equal((await open(env,'a.b.c')).status,403,'JWT non valido deve essere rifiutato');
assert.equal((await open(env,'invalid-token')).status,403,'JWT malformato deve essere rifiutato');
assert.equal((await open({...env,AGORA_MEMBER_EMAILS:''})).status,503,'Allowlist vuota deve bloccare');
assert.equal((await open(env,null,'POST')).status,405,'Nessuna modifica via POST');
console.log('Area soci: controlli di sicurezza fail-closed superati.');
