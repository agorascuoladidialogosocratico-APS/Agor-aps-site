import assert from 'node:assert/strict';
import worker from '../src/worker.js';

const origin='https://agora-scuoladidialogosocraticoecittadinanzattiva.site';
const emails=[];
const env={CONTACT_EMAIL:{async send(mail){emails.push(mail)}},ASSETS:{async fetch(){return new Response('asset',{status:200})}}};
const valid={fullName:'Persona di test',email:'persona@example.org',topic:'Il libro presente',message:'Vorrei maggiori informazioni su come associarmi.',privacy:'ack',website:''};
const submit=(data=valid,headers={},currentEnv=env)=>
 worker.fetch(new Request(origin+'/api/membership-interest',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Origin':origin,...headers},body:new URLSearchParams(data).toString()}),currentEnv);

let r=await submit();
assert.equal(r.status,200,'Richiesta valida deve essere inviata');
assert.match(await r.text(),/Richiesta inviata/);
assert.equal(emails.length,1);
assert.equal(emails[0].to,'agora.scuoladidialogosocratico@gmail.com');
assert.match(emails[0].text,/Persona di test/);
assert.match(emails[0].text,/persona@example.org/);
assert.match(emails[0].text,/non equivale/i,'Richiesta non deve equivalere ad ammissione');

r=await submit({...valid,email:'indirizzo-errato'});
assert.equal(r.status,422);
r=await submit({...valid,privacy:''});
assert.equal(r.status,422);
r=await submit({...valid,topic:'Altro'});
assert.equal(r.status,422);
r=await submit({...valid,website:'spam.example'});
assert.equal(r.status,200);
assert.equal(emails.length,1,'Non inviare email per bot o richieste invalide');

r=await submit(valid,{'Origin':'https://attacker.example'});
assert.equal(r.status,403);
r=await submit(valid,{}, {ASSETS:env.ASSETS});
assert.equal(r.status,503,'Non dichiarare invio in assenza del binding email');
r=await worker.fetch(new Request(origin+'/api/membership-interest'),env);
assert.equal(r.status,405,'Rifiuta GET');
assert.match(r.headers.get('content-type'),/text\/html/);
assert.match(r.headers.get('cache-control'),/no-store/);

console.log('Agorà adesioni: test modulo, privacy, sicurezza ed invio simulato superati.');
