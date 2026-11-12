import assert from 'node:assert/strict';
import {readdirSync,readFileSync,existsSync} from 'node:fs';
const root='https://agora-scuoladidialogosocraticoecittadinanzattiva.site';
const read=p=>readFileSync(p,'utf8');
const graphOf=(html,label)=>{
 const script=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
 assert.ok(script,label+': dati strutturati mancanti');
 const data=JSON.parse(script[1]);
 assert.ok(Array.isArray(data['@graph']),label+': @graph non valido');
 assert.ok(data['@graph'].some(x=>x['@type']==='NGO'),label+': ONG assente');
 assert.ok(data['@graph'].some(x=>x['@type']==='WebSite'),label+': WebSite assente');
 return data['@graph'];
};
const check=(html,label,opts={})=>{
 assert.match(html,/<link rel="canonical" href="https:\/\//,label+': canonical');
 assert.match(html,/<meta name="description" content="[^"]+"/,label+': descrizione');
 assert.match(html,/<meta name="twitter:card" content="summary_large_image"/,label+': social card');
 assert.match(html,/<meta property="og:image" content="https:\/\//,label+': og:image');
 assert.match(html,/<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"/,label+': robots');
 const meta=html.match(/<meta name="description" content="([^"]*)"/)[1];
 assert.ok([...meta].length<=160,label+': descrizione troppo lunga: '+meta.length);
 if(opts.article)assert.equal((html.match(/<h1>/g)||[]).length,1,label+': H1');
 return graphOf(html,label);
};
const home=read('index.html');
graphOf(home,'homepage');
for(const path of ['dialogo-socratico/index.html','progetti/soda-labs/index.html','progetti/odisseo-philosophorum/index.html','volontariato-esc/index.html','magazine/criteri-editoriali/index.html']){
 check(read(path),path);
}
const titles=new Set(), covers=new Set();
let count=0, historical=0;
for(const file of readdirSync('content/magazine').filter(x=>x.endsWith('.json'))){
 const post=JSON.parse(read('content/magazine/'+file));
 if(post.published!==true)continue;
 const slug=file.slice(0,-5);
 const html=read('magazine/'+slug+'/index.html');
 const graph=check(html,slug,{article:true});
 const article=graph.find(x=>x['@type']==='BlogPosting');
 assert.ok(article,slug+': schema BlogPosting');
 assert.equal(article.author.name,post.author,slug+': autore');
 assert.equal(article.datePublished,post.date,slug+': data originale');
 assert.equal(article.dateModified,post.editorialReviewDate||post.date,slug+': data modifica');
 assert.equal(article.image.url,post.cover.startsWith('/')?root+post.cover:post.cover,slug+': URL immagine');
 assert.equal(article.mainEntityOfPage['@id'],root+'/magazine/'+slug+'/#pagina',slug+': @id pagina');
 const title=post.seoTitle||post.title;
 assert.ok(!titles.has(title),slug+': titolo SEO duplicato');
 titles.add(title);
 assert.ok(!covers.has(post.cover),slug+': immagine ripetuta');
 covers.add(post.cover);
 if(post.cover.startsWith('/assets/'))assert.ok(existsSync(post.cover.slice(1)),slug+': PNG mancante');
 if(slug.startsWith('archivio-')){
  historical++;
  assert.ok(article.isBasedOn?.startsWith('https://web.archive.org/'),slug+': provenienza storica mancante');
  assert.ok(html.includes('Consulta la fonte conservata'),slug+': collegamento fonte non visibile');
  assert.ok(post.seoDescription&&post.topics?.length>=2,slug+': SEO editoriale incompleta');
 }
 count++;
}
assert.equal(historical,23,'Archivio di 23 articoli incompleto');
const site=read('sitemap.xml');
assert.match(site,/xmlns:image=/);
assert.match(site,/\/dialogo-socratico\/<\/loc>/);
assert.match(site,/\/magazine\/criteri-editoriali\/<\/loc>/);
assert.equal((site.match(/<image:image>/g)||[]).length,count+3,'Sitemap immagini inattesa');
const robots=read('robots.txt');
assert.match(robots,/User-agent: \*/);
assert.ok(!/Disallow: \//.test(robots.split('\n').find(x=>x==='Disallow: /')||''),'Root non crawlabile');
console.log('SEO verificato: '+count+' articoli, '+historical+' storici, immagini distinte, JSON-LD e sitemap con immagini.');
