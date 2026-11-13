import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const baseline=JSON.parse(readFileSync('data/url-contract-2026-11-13.json','utf8'));
const xml=readFileSync('sitemap.xml','utf8');
const urls=[...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const present=new Set(urls);
const base=baseline.domain;
assert.equal(present.size,urls.length,'Sitemap must not contain duplicate URLs');
assert.ok(baseline.protectedPaths.length>=40,'Baseline URL inventory appears incomplete');
for(const path of baseline.protectedPaths){
 assert.ok(path.startsWith('/')&&path.endsWith('/'),'Protected permalink must use trailing slash: '+path);
 const expected=base+path;
 assert.ok(present.has(expected),'Existing permalink removed from sitemap: '+path);
 const generated=path==='/'?'index.html':path.slice(1)+'index.html';
 assert.ok(existsSync(generated),'Existing page removed by redesign: '+generated);
 const html=readFileSync(generated,'utf8');
 assert.ok(html.includes('href="'+expected+'"')&&html.includes('rel="canonical"'),
  'Self canonical changed for '+generated);
 assert.ok(!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html),
  'Protected page suddenly noindexed: '+path);
 const og=html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/);
 if(og)assert.equal(og[1],expected,'Open Graph URL changed for '+path);
 assert.ok(/<h1\b/i.test(html),'Page lost H1 during redesign: '+path);
}
assert.ok(present.has(base+'/magazine/'),'Magazine index must remain');
assert.ok(present.has(base+'/progetti/'),'Projects index must remain');
console.log('URL contract: '+baseline.protectedPaths.length+' protected pages unchanged, canonicals and sitemap verified. Newly created URLs may be added without changing prior permalinks.');
