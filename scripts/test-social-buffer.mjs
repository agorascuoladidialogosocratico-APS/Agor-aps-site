import assert from 'node:assert/strict';
import {createPlan,selectRequest,publishPlan} from './social-buffer.mjs';
const data={
 title:'Il dialogo cambia la cittadinanza',excerpt:'Un laboratorio di confronto e cittadinanza attiva.',
 cover:'/assets/agora_dialogo.webp',published:true,
 socialFacebook:true,socialInstagram:true,socialX:true,
 socialFacebookText:'',socialInstagramText:'',socialXText:''
};
const slug='esempio-editoriale',plan=createPlan(slug,data,'draft');
assert.equal(plan.length,3);
assert.deepEqual(plan.map(x=>x.platform),['facebook','instagram','x']);
assert.equal(plan[0].input.saveToDraft,true);
assert.equal(plan[1].input.metadata.instagram.type,'post');
assert.equal(plan[0].input.metadata.facebook.type,'post');
assert(plan[2].text.includes('/magazine/'+slug+'/'));
assert.equal(Array.from(plan[2].text).length<=280,true);
assert(!plan[2].text.includes('/magazine/'+slug+'/\nhttps://'));
assert.equal(createPlan(slug,data,'queue')[0].input.saveToDraft,false);
assert.throws(()=>createPlan(slug,{...data,published:false}),'Non pubblicato');
assert.throws(()=>createPlan(slug,{...data,cover:''}),'Copertina mancante');
assert.throws(()=>selectRequest({slug:'../invalid',mode:'draft'}));
const payload={source:'pages-cms',action:{name:'send-to-buffer'},repository:{
 owner:'agorascuoladidialogosocratico-APS',repo:'Agor-aps-site',ref:'main'},
 context:{type:'entry',name:'magazine',path:'content/magazine/esempio-editoriale.json'},inputs:{mode:'queue'}};
assert.deepEqual(selectRequest({payload}),{slug,mode:'queue'});
assert.throws(()=>selectRequest({payload:{...payload,repository:{...payload.repository,ref:'evil'}}}));
const record={posts:{}},saved=[];
const fetchFn=async (_url,options)=>{
 const query=JSON.parse(options.body).query;
 const input=JSON.parse(options.body).variables?.input;
 let data;
 if(query.includes('channel(input:')){
  const channel=query.includes('facebook')?'facebook':query.includes('instagram')?'instagram':'twitter';
  data={channel:{id:channel+'-1',service:channel,name:'Agorà',isQueuePaused:false}};
 }else{
  data={createPost:{post:{id:'buf_'+String(input.channelId),status:input.saveToDraft?'draft':'buffer'}}};
 }
 return {ok:true,json:async()=>({data})};
};
const env={BUFFER_API_KEY:'unit-test',BUFFER_CHANNEL_FACEBOOK:'facebook-1',BUFFER_CHANNEL_INSTAGRAM:'instagram-1',BUFFER_CHANNEL_X:'twitter-1'};
const result=await publishPlan({slug,posts:plan,env,ledger:record,fetchFn,save:doc=>saved.push(JSON.stringify(doc))});
assert.equal(result.filter(x=>x.status==='created').length,3);
assert.equal(saved.length,3);
const again=await publishPlan({slug,posts:plan,env,ledger:record,fetchFn,save:()=>{throw Error('Non deve duplicare')}});
assert(again.every(x=>x.status==='already-created'));
const wrongChannel=await publishPlan({slug:'nuovo-articolo',posts:[plan[0]],env:{...env,BUFFER_CHANNEL_FACEBOOK:'twitter-1'},ledger:{posts:{}},fetchFn,save:()=>{}});
assert.equal(wrongChannel[0].status,'failed');
console.log('Agorà Buffer: formati social, azione CMS, bozza/coda, API e deduplicazione verificati.');
