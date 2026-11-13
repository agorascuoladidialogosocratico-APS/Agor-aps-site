import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const files = [
  'assets/book.css',
  'assets/accessibility.css',
  'assets/experience.css',
  'assets/visual-story.css',
  'assets/site-polish.css',
  'assets/whatsapp-chat.css',
  'assets/cinematic-agora.css'
];
const css = '/* Generated from the original stylesheets, preserving cascade order. */\n'
  + files.map(path => '/* SOURCE: '+path+' */\n'+readFileSync(path,'utf8').trim()+'\n').join('\n');
const digest = createHash('sha256').update(css).digest('hex').slice(0,12);
const bundle='assets/agora-home.css';
writeFileSync(bundle,css);
const home='index.html';
const html=readFileSync(home,'utf8');
const pattern=/(<link rel="stylesheet" href="\/assets\/agora-home\.css\?v=)[^"]+(")/;
if(!pattern.test(html))throw new Error('Homepage is not configured to use the bundled CSS');
const updated=html.replace(pattern,(_,start,end)=>start+digest+end);
if(updated!==html)writeFileSync(home,updated);
console.log('Agorà homepage CSS: '+files.length+' original files bundled, sha256 '+digest);
