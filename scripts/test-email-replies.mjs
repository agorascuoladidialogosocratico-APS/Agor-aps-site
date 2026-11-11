import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {emailEnabled,replyEmailEnabled,sendChatConversationEmail,receiveChatEmailReply} from '../src/chat-email.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const code='AB12CD34EF',chatId='11111111-2222-4333-8444-555555555555';
const inbox='agora.scuoladidialogosocratico@gmail.com';
const replies='risposte@agora-scuoladidialogosocraticoecittadinanzattiva.site';
const sent=[],writes=[];
const db={prepare(sql){return{bind(...args){return{
 async all(){
  if(sql.includes('SELECT side,body,created_at'))return{results:[{side:'visitor',body:'Buongiorno, informazioni sui tirocini?',created_at:Date.now()}]};
  return{results:[]};
 },
 async first(){
  if(sql.includes('SELECT id,status FROM site_chats'))return{id:chatId,status:'open'};
  return null;
 },
 async run(){writes.push({sql,args});return{meta:{changes:1}};}
 };}};}};
const env={
 CHAT_MODE:'free-dashboard',CHAT_EMAIL_NOTIFICATIONS:'true',CHAT_EMAIL_REPLY_ENABLED:'true',
 CHAT_EMAIL_REPLY_SECRET:'testing-email-secret-'+'V'.repeat(44),CHAT_DB:db,
 CONTACT_EMAIL:{async send(data){sent.push(data);return{messageId:'unit-test-id'};}}
};
assert(emailEnabled(env));assert(replyEmailEnabled(env));
assert(await sendChatConversationEmail(env,{chatId,code,side:'visitor',body:'Buongiorno, informazioni sui tirocini?'}));
assert.equal(sent.length,1);assert.equal(sent[0].to,inbox);assert.equal(sent[0].replyTo,replies);
assert(sent[0].subject.includes('#'+code+'/'));
assert(sent[0].text.includes('premi Rispondi in Gmail'));
const subject='Re: '+sent[0].subject;
const raw=[
 'From: "Agorà APS" <'+inbox+'>',
 'To: '+replies,
 'Subject: '+subject,
 'Message-ID: <reply-mock@example.com>',
 'Date: Wed, 11 Nov 2026 21:34:00 +0100',
 'MIME-Version: 1.0',
 'Content-Type: text/plain; charset=UTF-8',
 '',
 'Buongiorno, possiamo organizzare un incontro.',
 '',
 'Il giorno mer 11 novembre ha scritto:',
 '> Buongiorno, informazioni sui tirocini?'
].join('\r\n');
const mkMessage=(headers={},from=inbox,body=raw)=>({
 from,to:replies,headers:new Headers({
  'authentication-results':'mx.cloudflare.net; spf=pass; dkim=pass; dmarc=pass',
  'subject':subject,'message-id':'<reply-mock@example.com>',...headers
 }),
 raw:new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode(body));controller.close();}}),
 rawSize:body.length,
 rejected:null,setReject(reason){this.rejected=reason;}
});
let msg=mkMessage();
assert(await receiveChatEmailReply(msg,env),msg.rejected||'valid Gmail reply should be accepted');
assert.equal(writes.length,2);
assert(writes[0].sql.includes('INSERT OR IGNORE INTO site_chat_messages'));
assert.equal(writes[0].args[1],chatId);
assert.equal(writes[0].args[3],'Buongiorno, possiamo organizzare un incontro.');
assert.equal(writes[1].args[1],chatId);
msg=mkMessage({},'attacker@example.org');assert.equal(await receiveChatEmailReply(msg,env),false);
assert(msg.rejected.includes('non autorizzato'));
msg=mkMessage({'authentication-results':'mx.cloudflare.net; spf=fail; dkim=fail; dmarc=fail'});
assert.equal(await receiveChatEmailReply(msg,env),false);
assert(msg.rejected.includes('Autenticazione'));
msg=mkMessage({'subject':'Re: [Agorà APS Chat #'+code+'/DEADBEEFDEADBEEFDEADBEEF]'});
assert.equal(await receiveChatEmailReply(msg,env),false);
assert(msg.rejected.includes('Identificativo'));
const disabledEnv={...env,CHAT_EMAIL_REPLY_ENABLED:'false'};
assert.equal(replyEmailEnabled(disabledEnv),false);
assert(await sendChatConversationEmail(disabledEnv,{chatId,code,side:'visitor',body:'Messaggio'}));
assert.equal(sent.at(-1).replyTo,undefined);
assert(sent.at(-1).text.includes('non è ancora attiva'));
console.log('Chat email: Gmail Reply-To firmato, parsing MIME, anti-spoofing e fallback verificati.');
