import {readFileSync,writeFileSync,readdirSync,existsSync,mkdirSync,rmSync} from 'node:fs';
import {dirname,basename} from 'node:path';
const base='https://agora-scuoladidialogosocraticoecittadinanzattiva.site';
const mail='agora.scuoladidialogosocratico@gmail.com';
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const cover=s=>{
 const value=String(s||'').trim();
 if(/^\/assets\/[a-z0-9/_-]+\.(?:webp|png|jpe?g)$/i.test(value))return value;
 if(/^https:\/\/images\.unsplash\.com\/photo-\d+-[a-f\d]+\?auto=format&fit=crop&w=1300&h=731&q=78$/i.test(value))return value;
 throw Error('Copertina assente o non consentita; assegna una fotografia valida e diversa per ogni articolo: '+value);
};
const absoluteCover=s=>s.startsWith('https://')?s:base+s;
const dateOk=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(new Date(s+'T12:00:00Z').getTime());
const dateIt=s=>new Intl.DateTimeFormat('it-IT',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z'));
const shortMeta=(value,limit=155)=>{
 const plain=String(value||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
 if([...plain].length<=limit)return plain;
 const sliced=[...plain].slice(0,limit-1).join('');
 return sliced.replace(/\s+\S*$/,'').replace(/[\s,;:.!?]+$/,'')+'…';
};
const sourceArchive=p=>{
 const url=String(p?.archiveUrl||p?.sourceUrl||'');
 return /^https:\/\/web\.archive\.org\/web\/\d{14}\/https:\/\/filosofiasuldivano\.altervista\.org\/[a-z0-9-]+\/$/.test(url)?url:'';
};
const write=(path,s)=>{mkdirSync(dirname(path),{recursive:true});writeFileSync(path,s);};
function inline(text){
 let s=esc(text);
 s=s.replace(/!\[([^\]]*)\]\((\/assets\/[a-z0-9/_-]+\.(?:webp|png|jpe?g))\)/gi,(all,alt,img)=>'<img class="mag-inline-image" alt="'+alt+'" src="'+esc(img)+'" loading="lazy">');
 s=s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(all,title,url)=>{
  const u=url.replace(/&amp;/g,'&');
  const safe=/^https?:\/\//i.test(u)||/^\/[a-z0-9/#?&=_-]*$/i.test(u)||/^mailto:[^\s<>"]+$/i.test(u);
  return safe?'<a href="'+esc(u)+'"'+(/^https?:\/\//i.test(u)?' target="_blank" rel="noopener noreferrer"':'')+'>'+title+'</a>':title;
 });
 return s.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^\*])\*([^*\n]+)\*/g,'$1<em>$2</em>');
}
function markdown(body){
 const out=[];let p=[],list='',quote=[];
 const flush=()=>{if(p.length){out.push('<p>'+inline(p.join(' '))+'</p>');p=[];}if(list){out.push('</'+list+'>');list='';}if(quote.length){out.push('<blockquote><p>'+inline(quote.join(' '))+'</p></blockquote>');quote=[];}};
 for(const line of String(body||'').replace(/\r\n?/g,'\n').split('\n')){
  const t=line.trim();if(!t){flush();continue;}
  const heading=t.match(/^(#{2,3})\s+(.+)$/),bullet=t.match(/^[-*]\s+(.+)$/),number=t.match(/^\d+\.\s+(.+)$/);
  if(heading){flush();const h=heading[1].length;out.push('<h'+h+'>'+inline(heading[2])+'</h'+h+'>');continue;}
  if(bullet||number){if(p.length||quote.length)flush();const type=bullet?'ul':'ol';if(list!==type){if(list)out.push('</'+list+'>');out.push('<'+type+'>');list=type;}out.push('<li>'+inline((bullet||number)[1])+'</li>');continue;}
  if(t.startsWith('>')){if(p.length||list)flush();quote.push(t.replace(/^>\s?/,''));continue;}
  if(list||quote.length)flush();p.push(t);
 }flush();return out.join('\n');
}
const posts=[];
if(existsSync('content/magazine')){
 for(const file of readdirSync('content/magazine').filter(x=>x.endsWith('.json'))){
  const slug=basename(file,'.json');if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('Slug magazine non valido: '+file);
  const d=JSON.parse(readFileSync('content/magazine/'+file,'utf8'));
  d.date=String(d.date||'').slice(0,10);
  if(d.published!==true)continue;
  if(!d.title||!d.excerpt||!d.body||!dateOk(d.date))throw Error('Articolo pubblicato incompleto: '+file);
  posts.push({...d,slug,url:'/magazine/'+slug+'/',cover:cover(d.coverUpload||d.cover)});
 }
}
posts.sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'it'));
const coverOwners=new Map();
for(const p of posts){
 if(coverOwners.has(p.cover))throw Error('Copertina duplicata tra '+coverOwners.get(p.cover)+' e '+p.slug+'. Ogni articolo richiede una fotografia distinta.');
 coverOwners.set(p.cover,p.slug);
}
/* Non lasciare online articoli che l'editor ha riportato in bozza o cancellato. */
const activeSlugs=new Set(posts.map(p=>p.slug));
if(existsSync('magazine')){
 for(const entry of readdirSync('magazine',{withFileTypes:true})){
  if(!entry.isDirectory()||activeSlugs.has(entry.name))continue;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name))continue;
  const old='magazine/'+entry.name+'/index.html';
  if(existsSync(old)&&readFileSync(old,'utf8').includes('class="mag-article"'))rmSync('magazine/'+entry.name,{recursive:true,force:true});
 }
}
const identity=JSON.parse(readFileSync('content/identity.json','utf8'));
const member=JSON.parse(readFileSync('content/membership.json','utf8'));
const nav=[['/','Home'],['/chi-siamo/','Chi siamo'],['/progetti/','Progetti'],['/magazine/','Magazine'],['/partecipa/','Partecipa'],['/sostienici/','Sostienici'],['/contatti/','Contatti']];
function layout(path,title,description,body,img,post){
 const canon=base+path;
 const photo=cover(img);
 const photoUrl=absoluteCover(photo);
 const lang=post?.language==='en'?'en':'it';
 const seoTitle=String(post?.seoTitle||title).trim();
 const seoDescription=shortMeta(post?.seoDescription||description,155);
 const browserTitle=shortMeta(seoTitle,47)+(seoTitle.includes('Agorà')?'':' | Agorà APS');
 const dateModified=post?.editorialReviewDate&&dateOk(post.editorialReviewDate)?post.editorialReviewDate:post?.date;
 const orgId=base+'/#agora',websiteId=base+'/#website',pageId=canon+'#pagina';
 const publisher={'@type':'NGO','@id':orgId,name:'Agorà – Scuola di Dialogo Socratico e Cittadinanza Attiva APS',alternateName:'Agorà APS',url:base+'/',logo:{'@type':'ImageObject',url:base+'/assets/agora_icon.png'},email:mail,sameAs:(identity.externalProfiles||[]).map(p=>p.url)};
 const isMagazine=path.startsWith('/magazine/');
 const trail=[{'@type':'ListItem',position:1,name:'Agorà APS',item:base+'/'}];
 if(isMagazine&&path!=='/magazine/')trail.push({'@type':'ListItem',position:2,name:'Magazine',item:base+'/magazine/'});
 trail.push({'@type':'ListItem',position:trail.length+1,name:path==='/magazine/'?'Magazine':title,item:canon});
 const breadcrumb={'@type':'BreadcrumbList','@id':canon+'#breadcrumb',itemListElement:trail};
 const graph=[publisher,{'@type':'WebSite','@id':websiteId,name:'Agorà APS',url:base+'/',inLanguage:'it-IT',publisher:{'@id':orgId}},breadcrumb,
 {'@type':path==='/magazine/'?'CollectionPage':'WebPage','@id':pageId,url:canon,name:title,description:seoDescription,inLanguage:lang,isPartOf:{'@id':websiteId},breadcrumb:{'@id':breadcrumb['@id']}}];
 if(post){
  const imageObj={'@type':'ImageObject',url:photoUrl,contentUrl:photoUrl,width:1300,height:731,caption:post.coverAlt||title};
  if(post.coverCredit)imageObj.creditText=post.coverCredit;
  if(photo.startsWith('/assets/magazine/covers/'))imageObj.copyrightHolder={'@id':orgId};
  const article={'@type':'BlogPosting','@id':canon+'#articolo',headline:title,description:seoDescription,inLanguage:lang,url:canon,
   mainEntityOfPage:{'@id':pageId},datePublished:post.date,dateModified,
   author:{'@type':String(post.author||'').toLowerCase().includes('redazione')?'Organization':'Person',name:post.author||'Redazione Agorà APS'},
   publisher:{'@id':orgId},image:imageObj,articleSection:post.category||'Magazine',
   isAccessibleForFree:true, ...(Array.isArray(post.topics)&&post.topics.length?{keywords:post.topics.join(', ')}:{})};
  const original=sourceArchive(post);
  if(original)article.isBasedOn=original;
  graph.push(article);
 }
 const structured={'@context':'https://schema.org','@graph':graph};
 const head='<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#193b4a"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><title>'+esc(browserTitle)+'</title><meta name="description" content="'+esc(seoDescription)+'"><link rel="canonical" href="'+canon+'"><meta property="og:site_name" content="Agorà APS"><meta property="og:locale" content="'+(lang==='en'?'en_US':'it_IT')+'"><meta property="og:title" content="'+esc(seoTitle)+'"><meta property="og:description" content="'+esc(seoDescription)+'"><meta property="og:type" content="'+(post?'article':'website')+'"><meta property="og:url" content="'+canon+'"><meta property="og:image" content="'+esc(photoUrl)+'"><meta property="og:image:width" content="1300"><meta property="og:image:height" content="731"><meta property="og:image:alt" content="'+esc(post?.coverAlt||title)+'"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'+esc(seoTitle)+'"><meta name="twitter:description" content="'+esc(seoDescription)+'"><meta name="twitter:image" content="'+esc(photoUrl)+'">'+(post?'<meta property="article:published_time" content="'+post.date+'"><meta property="article:modified_time" content="'+dateModified+'">':'')+'<link rel="icon" href="/assets/agora_icon.png"><link rel="alternate" type="application/rss+xml" title="Agorà Magazine" href="/magazine/rss.xml"><link rel="stylesheet" href="/assets/sections.css?v=20261112"><link rel="stylesheet" href="/assets/magazine.css?v=20261112"><link rel="stylesheet" href="/assets/whatsapp-chat.css?v=20261112"><script type="application/ld+json">'+JSON.stringify(structured).replace(/</g,'\\u003c')+'</script>';
 const menu=nav.map(a=>'<a href="'+a[0]+'"'+(a[0]===path?' aria-current="page"':'')+'>'+a[1]+'</a>').join('');
 const header='<a href="#contenuto" class="skip-link">Salta al contenuto</a><header class="mag-header"><div class="mag-header-inner"><a class="mag-brand" href="/"><img src="'+esc(identity.logo||'/assets/agora_icon.png')+'" width="48" height="48" alt=""><span>Agorà <small>Scuola di Dialogo Socratico e Cittadinanza Attiva</small></span></a><nav class="mag-nav" aria-label="Navigazione principale">'+menu+'</nav><a class="mag-editor-link" href="/editor/">Area editor ↗</a></div></header>';
 const footer='<footer class="mag-footer"><div class="mag-footer-inner"><div><strong>Agorà APS</strong><p>Dialogo socratico · Educazione · Cittadinanza attiva</p></div><nav aria-label="Informazioni"><a href="/magazine/">Magazine</a><a href="/magazine/criteri-editoriali/">Criteri editoriali</a><a href="/sostienici/">Sostienici</a><a href="/trasparenza/">Trasparenza</a><a href="/privacy/">Privacy</a><a href="/accessibilita/">Accessibilità</a><a href="/editor/">Editor</a></nav><small>© 2026 Agorà APS</small></div></footer>';
 return '<!doctype html><html lang="'+lang+'"><head>'+head+'</head><body class="mag-body">'+header+'<main id="contenuto">'+body+'</main>'+footer+'<script defer src="/assets/whatsapp-chat.js?v=20261112"></script><script defer src="/assets/magazine.js?v=20261112"></script></body></html>\n';
}
const archivalNote=p=>{
 const url=sourceArchive(p);
 if(!/^https:\/\/web\.archive\.org\/web\/\d{14}\/https:\/\/filosofiasuldivano\.altervista\.org\/[a-z0-9-]+\/$/.test(url))return '';
 const revision=p.editorialReviewDate?' Versione revisionata il '+dateIt(p.editorialReviewDate)+'.':'';
 return '<aside class="mag-archive-source"><span>Archivio storico</span><p>Articolo pubblicato originariamente su <strong>Filosofia sul divano</strong> il '+dateIt(p.date)+'. Testo recuperato dalla copia conservata in Internet Archive, con attribuzione all’autore originale.'+revision+'</p><a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Consulta la fonte conservata ↗</a></aside>';
};
const card=p=>'<article class="mag-card" data-category="'+esc((p.category||'Magazine').toLowerCase())+'"><a href="'+p.url+'" class="mag-card-image"><img src="'+esc(p.cover)+'" alt="'+esc(p.coverAlt||'Fotografia per l’articolo di Agorà')+'" width="1300" height="731" loading="lazy"></a><div class="mag-card-body"><span class="mag-category">'+esc(p.category||'Magazine')+'</span><p class="mag-date"><time datetime="'+p.date+'">'+dateIt(p.date)+'</time> · '+esc(p.author||'Redazione Agorà APS')+'</p><h2><a href="'+p.url+'">'+esc(p.title)+'</a></h2><p>'+esc(p.excerpt)+'</p><a class="mag-read" href="'+p.url+'">Leggi l’articolo ↗</a></div></article>';
const intro='<section class="mag-cover"><div class="mag-cover-copy"><span class="mag-eyebrow">La voce di Agorà / Magazine</span><h1>Le domande <em>fanno strada.</em></h1><p>Articoli, idee, storie e aggiornamenti dal mondo del dialogo socratico, dell’educazione e della cittadinanza attiva.</p><a class="mag-action" href="#articoli">Esplora gli articoli ↘</a></div><figure class="mag-cover-photo"><img src="/assets/agora_gruppo_home.webp" alt="Gruppo di partecipanti alle esperienze di Agorà" width="1300" height="731" fetchpriority="high"><figcaption>Incontri, idee, comunità.</figcaption></figure></section>';
const filters='<div class="mag-filters" role="group" aria-label="Filtra gli articoli"><button type="button" data-mag-filter="all" aria-pressed="true" class="active">Tutti</button>'+[...new Set(posts.map(p=>p.category||'Magazine'))].map(c=>'<button type="button" data-mag-filter="'+esc(c.toLowerCase())+'" aria-pressed="false">'+esc(c)+'</button>').join('')+'</div>';
const archive='<section class="mag-section" id="articoli"><div class="mag-section-top"><div><span class="mag-eyebrow">Archivio editoriale</span><h2>Da leggere. Da discutere.</h2></div><a class="mag-rss" href="/magazine/rss.xml">RSS ↗</a></div>'+(posts.length?filters+'<div class="mag-grid">'+posts.map(card).join('')+'</div><p class="mag-no-results" hidden>Nessun articolo in questa categoria.</p>':'<p>Le prime pubblicazioni arriveranno qui.</p>')+'</section>';
const invitation='<section class="mag-contribute"><div><span class="mag-eyebrow">Una comunità che pensa</span><h2>Hai una storia o una domanda da proporre?</h2><p>Scrivi alla redazione: ascoltiamo idee, contributi e proposte culturali. <a href="/magazine/criteri-editoriali/">Come verifichiamo e attribuiamo gli articoli</a>.</p></div><a href="/contatti/" class="mag-action mag-action-light">Contatta la redazione ↗</a></section>';
const editorialPolicy='<nav class="mag-crumbs" aria-label="Percorso"><a href="/">Home</a> / <a href="/magazine/">Magazine</a> / <span>Criteri editoriali</span></nav><div class="mag-article mag-editorial-info"><header class="mag-article-head"><span class="mag-category">Trasparenza editoriale</span><h1>Fonti, autori e revisioni del Magazine</h1><p class="mag-article-intro">Come pubblichiamo contenuti verificabili, distinguiamo la storia dalle revisioni e attribuiamo le immagini.</p></header><div class="mag-prose"><h2>Chi pubblica</h2><p>Agorà – Scuola di Dialogo Socratico e Cittadinanza Attiva APS cura il Magazine per condividere riflessioni filosofiche, attività civiche e approfondimenti educativi. La responsabilità editoriale della pubblicazione è dell’associazione; gli articoli riportano, quando conosciuti, i nomi degli autori effettivi.</p><p>Per informazioni sulla governance e sulla registrazione dell’ente consulta <a href="/chi-siamo/">Chi siamo</a> e la pagina <a href="/trasparenza/">Trasparenza</a>.</p><h2>Archivio Filosofia sul Divano</h2><p>Una parte della biblioteca riprende articoli pubblicati originariamente sul sito «Filosofia sul divano», fra il 2021 e il 2023. Questi testi sono proposti in <strong>versioni editorialmente riviste</strong>: la data originale di pubblicazione non coincide necessariamente con la data dell’intervento redazionale. Ogni pagina dell’archivio indica, quando disponibile, l’indirizzo della copia storica conservata dalla Wayback Machine, in modo che il lettore possa confrontare le versioni.</p><p>Le firme originali non vengono sostituite automaticamente con quella dell’associazione. Le revisione può riguardare ortografia, chiarezza, organizzazione o rettifiche fattuali; nelle modifiche sostanziali deve restare chiaro che non si tratta di una trascrizione identica all’originale.</p><h2>Come valutiamo le informazioni</h2><p>Privilegiamo fonti primarie, istituzionali, accademiche o editoriali quando occorre documentare dati, norme, eventi e riferimenti bibliografici. Le interpretazioni filosofiche e le opinioni sono presentate come tali, e non come risultati scientifici. Quando un’informazione non è ancora verificata, non la descriviamo come confermata.</p><p>Testi e proposte possono essere supportati da strumenti digitali, ma attribuzione, controlli e decisione di pubblicare restano responsabilità redazionali umane. Non dichiariamo una validazione scientifica totale degli articoli storici.</p><h2>Copertine, licenze e diritti</h2><p>Le copertine dell’archivio ripubblicato nel novembre 2026 sono <strong>illustrazioni editoriali realizzate per Agorà APS</strong>, diverse per ogni articolo; non sono fotografie storiche dell’epoca. Nelle pagine sono indicati il credito, il collegamento al disegno SVG sorgente e le condizioni d’uso. La disponibilità di un file sul sito non significa che esso sia automaticamente distribuito con licenza Creative Commons.</p><h2>Come segnalare una correzione</h2><p>Se individui un errore, una firma inesatta o un problema relativo a una fonte o a una licenza, scrivi a <a href="mailto:agora.scuoladidialogosocratico@gmail.com?subject=Segnalazione%20redazionale%20Magazine">agora.scuoladidialogosocratico@gmail.com</a>, indicando l’URL interessato e gli elementi utili per la verifica. Se una rettifica sostanziale viene effettuata, aggiorniamo la data di revisione senza cancellare la data originaria.</p><p><a href="/magazine/">Torna agli articoli del Magazine</a> · <a href="/dialogo-socratico/">Scopri il nostro metodo di dialogo</a>.</p></div></div>';
write('magazine/criteri-editoriali/index.html',layout('/magazine/criteri-editoriali/','Criteri editoriali e fonti del Magazine','Come Agorà APS attribuisce gli autori, verifica le fonti e segnala le revisioni degli articoli storici.',editorialPolicy,'/assets/agora_dialogo.webp'));

write('magazine/index.html',layout('/magazine/','Agorà Magazine – Articoli e cittadinanza','Articoli, riflessioni e aggiornamenti di Agorà APS su dialogo, educazione, partecipazione e cittadinanza attiva.',intro+archive+invitation,'/assets/agora_gruppo_home.webp'));
for(const p of posts){
 const topicSet=new Set((p.topics||[]).map(x=>String(x).toLocaleLowerCase('it')));
 const related=posts.filter(x=>x.slug!==p.slug).sort((a,b)=>{
  const score=item=>(item.topics||[]).filter(t=>topicSet.has(String(t).toLocaleLowerCase('it'))).length;
  return score(b)-score(a)||b.date.localeCompare(a.date);
 }).slice(0,3);
 const article='<nav class="mag-crumbs" aria-label="Percorso"><a href="/">Home</a> / <a href="/magazine/">Magazine</a> / <span>Articolo</span></nav><article class="mag-article"><header class="mag-article-head"><span class="mag-category">'+esc(p.category||'Magazine')+'</span><h1>'+esc(p.title)+'</h1><p class="mag-article-intro">'+esc(p.excerpt)+'</p><div class="mag-byline"><span>'+esc(p.author||'Redazione Agorà APS')+'</span><time datetime="'+p.date+'">'+dateIt(p.date)+'</time>'+(p.editorialReviewDate&&dateOk(p.editorialReviewDate)?'<small> · Revisione: <time datetime="'+p.editorialReviewDate+'">'+dateIt(p.editorialReviewDate)+'</time></small>':'')+'</div></header><figure class="mag-article-image"><img src="'+esc(p.cover)+'" alt="'+esc(p.coverAlt||'Fotografia editoriale')+'" width="1300" height="731" fetchpriority="high" decoding="async">'+(p.coverCredit?'<figcaption class="mag-cover-credit">'+(p.coverSource&&/^https:\/\//.test(p.coverSource)?'<a href="'+esc(p.coverSource)+'" rel="noopener noreferrer" target="_blank">'+esc(p.coverCredit)+'</a>':esc(p.coverCredit))+' · '+esc(p.coverLicense||'Licenza d’uso editoriale indicata nella scheda di provenienza')+' · Immagine editoriale, non originale dell’archivio storico.</figcaption>':'')+'</figure><div class="mag-article-layout"><aside class="mag-article-aside"><span>Agorà Magazine</span><p>Le idee si condividono.</p><a href="/magazine/">Torna agli articoli ↗</a></aside><div class="mag-prose">'+markdown(p.body)+archivalNote(p)+'</div></div><footer class="mag-article-bottom"><a href="/magazine/">← Tutti gli articoli</a><a href="/magazine/criteri-editoriali/">Fonti e revisione editoriale</a><a href="/contatti/">Proponi un tema ↗</a></footer></article>'+(related.length?'<section class="mag-section"><div class="mag-section-top"><h2>Continua a leggere</h2></div><div class="mag-grid">'+related.map(card).join('')+'</div></section>':'');
 write('magazine/'+p.slug+'/index.html',layout(p.url,p.title,p.excerpt,article,p.cover,p));
}
const iban=String(member.iban||'').replace(/\s/g,'').toUpperCase();
function validIban(s){
 if(!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s))return false;
 const reordered=s.slice(4)+s.slice(0,4);let rem=0;
 for(const ch of reordered){const n=/\d/.test(ch)?ch:String(ch.charCodeAt(0)-55);for(const d of n)rem=(rem*10+Number(d))%97;}
 return rem===1;
}
const show=member.bankDetailsPublic===true&&validIban(iban)&&String(member.accountHolder||'').trim().length>3;
const bic=String(member.bic||'').trim().toUpperCase();
const showBic=show&&/^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(bic);
const bank=show?'<div class="support-bank"><div><span>Intestatario</span><strong>'+esc(member.accountHolder)+'</strong></div><div><span>IBAN</span><strong class="mag-iban">'+esc(iban.replace(/(.{4})/g,'$1 ').trim())+'</strong><button type="button" data-copy-iban="'+esc(iban)+'">Copia IBAN</button></div>'+
 (showBic?'<div><span>BIC / SWIFT</span><strong>'+esc(bic)+'</strong></div>':'')+
 (member.bankName?'<div><span>Istituto</span><strong>'+esc(member.bankName)+'</strong></div>':'')+
 '<div><span>Causale consigliata</span><strong>'+esc(member.transferReason||'Quota associativa – anno e nominativo')+'</strong></div></div>':
 '<div class="support-pending"><h3>Coordinate bancarie su richiesta</h3><p>L’IBAN non è ancora pubblicato. Ti comunicheremo soltanto coordinate confermate e indicazioni aggiornate.</p><a class="mag-action" href="mailto:'+mail+'?subject='+encodeURIComponent('Richiesta coordinate quota associativa Agorà')+'">Richiedi le coordinate ↗</a></div>';
const support='<section class="support-hero"><div><span class="mag-eyebrow">Sostieni Agorà</span><h1>Il dialogo ha bisogno <em>di persone.</em></h1><p>'+esc(member.description)+'</p><a class="mag-action" href="#bonifico">Come contribuire ↘</a></div><figure><img src="/assets/agora_chi_siamo.webp" alt="Partecipanti alle esperienze culturali di Agorà" width="1300" height="731"></figure></section><section class="support-body" id="bonifico"><div><span class="mag-eyebrow">Quote associative</span><h2>Bonifico bancario, con chiarezza.</h2><p>Non usiamo servizi di pagamento esterni. Prima del versamento, verifica le condizioni di adesione e l’importo della quota vigente con l’associazione.</p><p class="support-note">'+esc(member.notes)+'</p></div>'+bank+'</section>'+invitation;
write('sostienici/index.html',layout('/sostienici/','Sostieni Agorà APS – Quota associativa e bonifico','Come sostenere Agorà APS: quote associative via bonifico, informazioni per aderire e richiedere coordinate bancarie.',support,'/assets/agora_chi_siamo.webp'));
const rss='<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Agorà Magazine</title><link>'+base+'/magazine/</link><description>Articoli e notizie di Agorà APS</description><language>it-IT</language>'+posts.slice(0,30).map(p=>'<item><title>'+esc(p.title)+'</title><link>'+base+p.url+'</link><guid isPermaLink="true">'+base+p.url+'</guid><pubDate>'+new Date(p.date+'T12:00:00Z').toUTCString()+'</pubDate><description>'+esc(p.excerpt)+'</description></item>').join('')+'</channel></rss>\n';
write('magazine/rss.xml',rss);
let sitemap=readFileSync('sitemap.xml','utf8');if(!sitemap.includes('</urlset>'))throw Error('Sitemap invalida');
const loc=[['/magazine/','2026-11-12','/assets/agora_gruppo_home.webp','Agorà Magazine'],
 ['/magazine/criteri-editoriali/','2026-11-12','/assets/agora_dialogo.webp','Criteri editoriali del Magazine'],
 ['/sostienici/','2026-11-12','/assets/agora_chi_siamo.webp','Sostieni Agorà APS'],
 ...posts.map(p=>[p.url,p.editorialReviewDate&&dateOk(p.editorialReviewDate)?p.editorialReviewDate:p.date,p.cover,p.title])];
sitemap=sitemap.replace(/<url><loc>[^<]+\/(?:magazine|sostienici)\/[^<]*<\/loc>[\s\S]*?<\/url>\s*/g,'');
sitemap=sitemap.replace('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">');
const extra=loc.map(([url,modified,img,title])=>'  <url><loc>'+base+url+'</loc><lastmod>'+modified+'</lastmod><image:image><image:loc>'+esc(absoluteCover(cover(img)))+'</image:loc><image:title>'+esc(title)+'</image:title></image:image></url>').join('\n')+'\n';
writeFileSync('sitemap.xml',sitemap.replace('</urlset>',extra+'</urlset>'));
console.log('Agorà Magazine: '+posts.length+' articolo/i, pagina Sostienici e RSS generati.');
