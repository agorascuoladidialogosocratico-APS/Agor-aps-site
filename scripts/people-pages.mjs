/* Agorà · profili istituzionali. Dati minimi finché la biografia non è autorizzata. */
const site = 'https://agora-scuoladidialogosocraticoecittadinanzattiva.site';
const validSlug = x => typeof x === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x);
const validImage = x => typeof x === 'string' && /^\/assets\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:png|webp|jpe?g)$/i.test(x);
const link = x => {
  if(typeof x !== 'string') return '';
  const value=x.trim();
  if(value.startsWith('/') && !value.startsWith('//') && /^\/[a-z0-9/_#?.=&%-]*$/i.test(value))return value;
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:'';}catch{return '';}
};
const people = data => {
  const result=[], seen=new Set();
  for(const [group,entries] of [['Direttivo',data.members],['Collaboratori',data.collaborators],['Fondatori',data.founders]]){
    for(const item of Array.isArray(entries)?entries:[]){
      if(item?.published!==true || !validSlug(item.slug)||!item.name||!item.role||seen.has(item.slug))continue;
      seen.add(item.slug);result.push({...item,group});
    }
  }
  return result;
};
const photoEnabled = x => x.photoApproved===true && validImage(x.photo);
const cvEnabled = x => x.cvApproved===true && typeof x.cvFile==='string' && /^\/assets\/cv\/[a-z0-9][a-z0-9_.-]*\.pdf$/i.test(x.cvFile);
const picture=(x,e,large=false)=>{
  const cls='person-portrait'+(large?' person-portrait-large':'');
  if(photoEnabled(x))return '<div class="'+cls+'"><img src="'+e(x.photo)+'" alt="'+e(x.photoAlt||('Ritratto di '+x.name))+'" loading="lazy" decoding="async"></div>';
  const initials=String(x.name).trim().split(/\s+/).slice(0,2).map(word=>word[0]||'').join('').toUpperCase();
  return '<div class="'+cls+' person-monogram" aria-hidden="true"><span>'+e(initials)+'</span></div>';
};
const card=(x,e,tag)=>
  '<article class="person-card">'+picture(x,e)+
  '<div class="person-card-copy"><p class="person-kicker">'+e(tag)+'</p>'+
  '<h3><a href="/chi-siamo/'+x.slug+'/">'+e(x.name)+'</a></h3>'+
  '<p class="person-role">'+e(x.role)+'</p>'+
  (x.specialty?'<p class="person-specialty">'+e(x.specialty)+'</p>':'')+
  (x.summary?'<p class="person-summary">'+e(x.summary)+'</p>':'')+
  '<a class="person-card-action" aria-label="Scopri il percorso di '+e(x.name)+'" href="/chi-siamo/'+x.slug+'/">Scopri la persona <span aria-hidden="true">↗</span></a>'+
  '</div></article>';
const links=(entries,e)=>{
  const items=(Array.isArray(entries)?entries:[]).map(x=>({name:String(x?.label||'').trim(),url:link(x?.url)})).filter(x=>x.name&&x.url);
  return items.length?'<ul class="person-links">'+items.map(x=>'<li><a href="'+e(x.url)+'"'+(x.url.startsWith('https://')?' target="_blank" rel="noopener noreferrer"':'')+'>'+e(x.name)+' <span aria-hidden="true">↗</span></a></li>').join('')+'</ul>':'';
};
export function buildPeopleSection(data,e,runts){
  const all=people(data),board=all.filter(x=>x.group==='Direttivo'),team=all.filter(x=>x.group==='Collaboratori'),founders=all.filter(x=>x.founder===true);
  return '<section class="info-section people-introduction" id="persone"><p class="person-kicker">Agorà / Le persone</p><h2>Le persone che danno vita ad Agorà</h2><p>Una comunità si costruisce attraverso responsabilità, idee e relazioni. Conosci le persone che contribuiscono alla vita dell’associazione.</p><nav class="people-anchor-nav" aria-label="Sezioni delle persone"><a href="#direttivo">Consiglio direttivo</a>'+(team.length?'<a href="#collaboratori">Collaboratori</a>':'')+(founders.length?'<a href="#fondatori">Fondatori</a>':'')+'</nav></section>'+
  '<section class="info-section" id="direttivo"><div class="people-section-heading"><div><p class="person-kicker">Governance</p><h2>Il Consiglio Direttivo</h2></div><p>Le cariche si riferiscono alla documentazione associativa del giugno 2026; per variazioni successive fa fede il RUNTS.</p></div><div class="people-grid governance-grid">'+board.map(x=>card(x,e,'Consiglio Direttivo')).join('')+'</div><p class="info-note">Verifica gli incarichi nel <a href="'+e(runts)+'" target="_blank" rel="noopener noreferrer">RUNTS</a> cercando il codice fiscale <strong>93254890879</strong>. Le schede personali non sostituiscono la visura ufficiale.</p></section>'+
  (team.length?'<section class="info-section" id="collaboratori"><p class="person-kicker">La comunità</p><h2>Collaboratori e professionisti</h2><div class="people-grid">'+team.map(x=>card(x,e,'Collaborazioni')).join('')+'</div></section>':'')+
  (founders.length?'<section class="info-section" id="fondatori"><p class="person-kicker">Le origini</p><h2>I fondatori</h2><p>Questi sono i fondatori con una scheda pubblica, non necessariamente l’elenco integrale dell’atto costitutivo.</p><div class="people-grid">'+founders.map(x=>card(x,e,'Fondatori')).join('')+'</div></section>':'')+
  '<section class="info-section people-join"><div><p class="person-kicker">Una comunità aperta</p><h2>Le prossime persone di Agorà</h2><p>Vuoi contribuire come volontario, formatore, facilitatore o partner? Ogni percorso inizia con un incontro.</p></div><a class="info-btn" href="/partecipa/">Partecipa alla comunità</a></section>';
}
export function buildPeopleProfilePages(data,render,e){
  const output={};
  for(const x of people(data)){
    const path='/chi-siamo/'+x.slug+'/';
    const cvInline=cvEnabled(x)?
      '<p class="person-cv-footer">Per approfondire: <a href="'+e(x.cvFile)+'" download="'+e(x.slug)+'.pdf">curriculum vitae (PDF) ↗</a>'+
      (x.cvUpdated?' <span>· '+e(x.cvUpdated)+'</span>':'')+'</p>':'';
    const education=x.education?'<section class="info-section person-story-section"><p class="person-kicker">Studi e prospettiva</p><h2>Formazione e ricerca</h2><p>'+e(x.education)+'</p></section>':'';
    const contribution=x.contribution?'<section class="info-section person-story-section"><p class="person-kicker">La comunità</p><h2>Il contributo ad Agorà</h2><p>'+e(x.contribution)+'</p></section>':'';
    const activities=(links(x.projects,e)||links(x.links,e))?
      '<section class="info-section person-story-section"><p class="person-kicker">Esperienze documentate</p><h2>Progetti, scritti e approfondimenti</h2>'+
      links(x.projects,e)+links(x.links,e)+'</section>':'';
    const bioText=x.bio?String(x.bio).split(/\\n\\s*\\n/).filter(Boolean).map(y=>'<p>'+e(y).replace(/\\n/g,' ')+'</p>').join(''):
      '<p>Profilo in aggiornamento con le informazioni biografiche autorizzate.</p>';
    const body='<section class="info-section person-detail-layout">'+picture(x,e,true)+
      '<div class="person-detail-copy"><p class="person-kicker">'+e(x.group)+'</p>'+
      (x.specialty?'<p class="person-detail-specialty">'+e(x.specialty)+'</p>':'')+
      '<h2>Il percorso</h2><p class="person-role">'+e(x.role)+'</p>'+
      (x.summary?'<p class="person-detail-lead">'+e(x.summary)+'</p>':'')+
      '<div class="person-bio">'+bioText+'</div>'+
      '</div></section>'+education+contribution+activities+
      '<section class="info-section person-back"><a class="info-btn" href="/chi-siamo/#persone">← Tutte le persone</a> '+
      '<a class="person-contact" href="/contatti/">Contatta Agorà</a>'+cvInline+'</section>';
    let html=render(path,x.name,x.name+', '+x.role+' di Agorà APS. Scheda istituzionale e attività documentate.','Le persone di Agorà',body);
    const structured={'@context':'https://schema.org','@type':'Person','@id':site+path+'#persona',name:x.name,jobTitle:x.role,url:site+path,memberOf:{'@id':site+'/#agora'}};
    if(photoEnabled(x))structured.image=site+x.photo;
    if(x.summary)structured.description=x.summary;
    if(cvEnabled(x))structured.subjectOf={'@type':'DigitalDocument',url:site+x.cvFile,encodingFormat:'application/pdf',name:'Curriculum vitae di '+x.name};
    const external=(Array.isArray(x.links)?x.links:[]).map(item=>link(item?.url)).filter(url=>url.startsWith('https://'));
    if(external.length)structured.sameAs=external;
    html=html.replace('</head>','<script type="application/ld+json">'+JSON.stringify(structured).replace(/</g,'\\u003c')+'</script></head>');
    output['chi-siamo/'+x.slug+'/index.html']=html;
  }
  return output;
}
