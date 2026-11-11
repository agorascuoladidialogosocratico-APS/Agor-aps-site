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
console.log('Site-chat: endpoint disabilitato sicuro, autenticazione, captcha e firma webhook.');
