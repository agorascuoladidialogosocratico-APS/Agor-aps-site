import assert from 'node:assert/strict';
import {handleSiteChat} from '../src/site-chat.js';
import worker from '../src/worker.js';
const origin='https://agora-scuoladidialogosocraticoecittadinanzattiva.site';
const request=(path,method='GET',body,extra={})=>new Request(origin+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...extra},body:body?JSON.stringify(body):undefined});
const disabled=await handleSiteChat(request('/api/site-chat/status'),{});
assert.equal(disabled.status,200);
assert.deepEqual(await disabled.json(),{enabled:false,sitekey:null});
const notReady=await handleSiteChat(request('/api/site-chat/start','POST',{turnstileToken:'test'}),{});
assert.equal(notReady.status,503);
const env={
 CHAT_DB:{},CHAT_ENABLED:'true',TURNSTILE_SECRET:'test-secret',TURNSTILE_SITE_KEY:'test-sitekey',
 META_TOKEN:'test-token',META_PHONE_NUMBER_ID:'222222222',META_TEMPLATE_NAME:'agora_site_chat_notification',
 META_APP_SECRET:'test-app-secret',META_WEBHOOK_VERIFY_TOKEN:'test-verify-token',
 CHAT_OWNER_NUMBER:'32466902127'
};
const ready=await handleSiteChat(request('/api/site-chat/status'),env);
assert.equal(ready.status,200);
assert.deepEqual(await ready.json(),{enabled:true,sitekey:'test-sitekey'});
const anonymous=await handleSiteChat(request('/api/site-chat/messages'),env);
assert.equal(anonymous.status,401);
const anonymousPost=await handleSiteChat(request('/api/site-chat/message','POST',{message:'testo'}),env);
assert.equal(anonymousPost.status,401);
const noCaptcha=await handleSiteChat(request('/api/site-chat/start','POST',{}),env);
assert.equal(noCaptcha.status,422);
const verify=await handleSiteChat(request('/api/meta-whatsapp-webhook?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=verification-ok'),env);
assert.equal(verify.status,200);
assert.equal(await verify.text(),'verification-ok');
const failedVerify=await handleSiteChat(request('/api/meta-whatsapp-webhook?hub.mode=subscribe&hub.verify_token=wrong'),env);
assert.equal(failedVerify.status,403);
const forgedWebhook=await handleSiteChat(request('/api/meta-whatsapp-webhook','POST',{entry:[]}),env);
assert.equal(forgedWebhook.status,403);
const endpointStatus=await worker.fetch(request('/api/site-chat/status'),{ASSETS:{fetch:async()=>new Response('assets',{status:200})}});
assert.equal(endpointStatus.status,200);

const adminToken='X'.repeat(52);
const chatUuid='00000000-0000-4000-a000-000000000001';
const captured=[];
const fakeDb={prepare(sql){return{bind(...args){captured.push({sql,args});return{
 async first(){
  if(sql.includes('secret_hash = ?'))return{id:chatUuid,code:'AB1234CDEF',status:'open'};
  if(sql.includes('count(*) AS n'))return{n:0};
  if(sql.includes('WHERE id=?'))return{id:chatUuid,code:'AB1234CDEF',status:'open'};
  return null;
 },
 async all(){
  if(sql.includes('FROM site_chats c'))return{results:[{id:chatUuid,code:'AB1234CDEF',status:'open',preview:'Salve',unanswered:1,updated_at:Date.now(),created_at:Date.now()}]};
  return{results:[]};
 },
 async run(){return{success:true}}
 };}};}};
const freeEnv={
 CHAT_DB:fakeDb,CHAT_ENABLED:'true',CHAT_MODE:'free-dashboard',
 CHAT_ADMIN_TOKEN:adminToken,TURNSTILE_SECRET:'turnstile-secret',TURNSTILE_SITE_KEY:'turnstile-sitekey'
};
const freeReady=await handleSiteChat(request('/api/site-chat/status'),freeEnv);
assert.equal(freeReady.status,200);
assert.deepEqual(await freeReady.json(),{enabled:true,sitekey:'turnstile-sitekey'});
const withoutAdminKey=await handleSiteChat(request('/api/site-chat/admin/chats'),freeEnv);
assert.equal(withoutAdminKey.status,401);
const badAdminKey=await handleSiteChat(request('/api/site-chat/admin/chats','GET',undefined,{'X-Agora-Operator-Key':'Z'.repeat(52)}),freeEnv);
assert.equal(badAdminKey.status,401);
const adminHeaders={'X-Agora-Operator-Key':adminToken};
const list=await handleSiteChat(request('/api/site-chat/admin/chats','GET',undefined,adminHeaders),freeEnv);
assert.equal(list.status,200);assert.equal((await list.json()).chats[0].code,'AB1234CDEF');
const details=await handleSiteChat(request('/api/site-chat/admin/messages?chatId='+chatUuid,'GET',undefined,adminHeaders),freeEnv);
assert.equal(details.status,200);
const invalidReply=await handleSiteChat(request('/api/site-chat/admin/reply','POST',{chatId:chatUuid,message:'n'},adminHeaders),freeEnv);
assert.equal(invalidReply.status,422);
const response=await handleSiteChat(request('/api/site-chat/admin/reply','POST',{chatId:chatUuid,message:'Ciao, siamo disponibili.'},adminHeaders),freeEnv);
assert.equal(response.status,201);assert.equal((await response.json()).ok,true);
const userHeaders={Authorization:'Bearer '+'a'.repeat(64)};
const freeMessage=await handleSiteChat(request('/api/site-chat/message','POST',{message:'Vorrei parlare con Agorà.'},userHeaders),freeEnv);
assert.equal(freeMessage.status,201);
const delivery=await freeMessage.json();
assert.equal(delivery.delivery,'operator-dashboard');assert.equal(delivery.notified,false);
const unprotectedFreeEnv={...freeEnv,CHAT_ADMIN_TOKEN:''};
const notEnabled=await handleSiteChat(request('/api/site-chat/status'),unprotectedFreeEnv);
assert.equal((await notEnabled.json()).enabled,false);
console.log('Free dashboard mode: access key, send/receive, no Meta notification tested.');

console.log('Site-chat: endpoint disabilitato sicuro, autenticazione, captcha e firma webhook.');
