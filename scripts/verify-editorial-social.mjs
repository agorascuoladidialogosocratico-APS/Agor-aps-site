import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const slugs=[
'intelligenza-artigianale-ai-e-liberta-di-giudizio',
'algoritmi-feed-e-democrazia-chi-decide-cosa-vediamo',
'inclusione-non-basta-invitare-bisogna-rendere-possibile',
'che-cosa-significa-essere-cittadini-oggi',
'viaggiare-non-basta-cambiare-sguardo-filosofia'
];
const dimensions={cover:[1300,731],carousel:[1080,1350],story:[1080,1920]};
function checkPng(file,expected){
 assert.ok(existsSync(file),'Missing PNG '+file);
 const data=readFileSync(file);
 assert.equal(data.toString('hex',0,8),'89504e470d0a1a0a','Bad PNG header '+file);
 assert.deepEqual([data.readUInt32BE(16),data.readUInt32BE(20)],expected,'Unexpected PNG size '+file);
 assert.ok(data.length>4000,'Suspiciously small PNG '+file);
}
const usedCovers=new Set();
for(const slug of slugs){
 const j=JSON.parse(readFileSync('content/magazine/'+slug+'.json','utf8'));
 assert.equal(j.published,true);
 assert.equal(j.author,'Redazione Agorà APS');
 assert.equal(j.socialFacebook,false,'Do not accidentally auto-post during historical campaign');
 assert.equal(j.socialInstagram,false,'Do not accidentally auto-post during historical campaign');
 assert.equal(j.socialAiAssisted,true);
 assert.ok(j.body.length>1300&&j.seoDescription.length>60,'Editorial content must be substantial');
 assert.ok(!usedCovers.has(j.cover),'Duplicate editorial covers');
 usedCovers.add(j.cover);
 assert.equal(j.socialCarouselImages.length,5);
 assert.equal(j.socialStoryImages.length,2);
 const dirname='assets/magazine/contemporaneo/'+slug;
 assert.equal(j.cover,'/'+dirname+'/cover.png');
 const names=[['cover',dimensions.cover],...Array.from({length:5},(_,i)=>['carousel-'+String(i+1).padStart(2,'0'),dimensions.carousel]),...Array.from({length:2},(_,i)=>['story-'+String(i+1).padStart(2,'0'),dimensions.story])];
 for(const [filename,dim] of names){
  assert.ok(existsSync(join(dirname,filename+'.svg')),'SVG source missing '+filename);
  checkPng(join(dirname,filename+'.png'),dim);
 }
 assert.ok(existsSync('magazine/'+slug+'/index.html'),'Magazine article not generated '+slug);
}
const scheduled=JSON.parse(readFileSync('data/social-editoriali-contemporanei.json','utf8'));
const original=JSON.parse(readFileSync('data/social-magazine-23-giorni.json','utf8'));
assert.equal(original.posts.length,23,'Preserve original daily calendar');
assert.equal(scheduled.posts.length,5);
assert.ok(scheduled.posts[0].date>original.posts.at(-1).date,'No post collisions with previous campaign');
assert.deepEqual(scheduled.posts.map(x=>x.slug),slugs);
console.log('Editorial checks passed: 5 original articles, 5 distinct covers, 25 carousels and 10 stories, all rendered and scheduled without collisions.');
