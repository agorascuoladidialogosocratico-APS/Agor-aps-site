/* Agorà CMS — content stored in GitHub and maintained through Pages CMS.
   This runtime progressively enhances the server-rendered editorial fallback;
   content updates never execute HTML from editor fields. */
(() => {
  'use strict';
  const names = ['identity','home','projects','method','association','transparency','contact','layout','blocks','opportunities'];
  const text = (selector, value) => {
    const el = document.querySelector(selector);
    if (!el || typeof value !== 'string') return;
    const arrow = [...el.childNodes].some(n => n.nodeType === 1 && n.getAttribute?.('aria-hidden') === 'true');
    if (arrow) {
      const node = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      if (node) node.textContent = value + ' ';
      else el.prepend(document.createTextNode(value + ' '));
    } else el.textContent = value;
  };
  const element = (tag, attrs={}, value) => {
    const el=document.createElement(tag);
    for (const [key,val] of Object.entries(attrs)) if(val!==undefined && val!==null) el.setAttribute(key,String(val));
    if (typeof value==='string') el.textContent=value;
    return el;
  };
  const url = (u,kind='href') => {
    if(typeof u!=='string') return null;
    const s=u.trim();
    if(s.startsWith('#'))return kind==='href'?s:null;
    if(s.startsWith('/')&&!s.startsWith('//'))return s;
    if(/^https:\/\//i.test(s))return s;
    if(kind==='href' && /^(mailto:|tel:)/i.test(s))return s;
    return null;
  };
  const link = (selector,label,target) => {
    text(selector,label);
    const el=document.querySelector(selector);const safe=url(target);
    if(el&&safe)el.setAttribute('href',safe);
  };
  const image=(selector,src,alt)=>{
    const img=document.querySelector(selector); if(!img)return;
    const safe=url(src,'src'); if(safe){img.setAttribute('src',safe);
      if(/^\/assets\/agora_(chi_siamo|dialogo|viaggio|gruppo_home)\.webp$/.test(safe)){const base=safe.slice(0,-5);img.setAttribute('srcset',`${base}-480.webp 480w, ${base}-800.webp 800w, ${safe} ${/viaggio/.test(safe)?864:1500}w`);img.setAttribute('sizes','(max-width: 760px) 85vw, 520px');}
      else {img.removeAttribute('srcset');img.removeAttribute('sizes');}
    }
    if(typeof alt==='string')img.setAttribute('alt',alt);
  };
  function heading(selector,parts) {
    const el=document.querySelector(selector);if(!el)return;
    el.textContent=parts.map(item => typeof item==='string' ? item :
      item?.last || ((item?.mixed||'')+(item?.accent||''))).filter(Boolean).join(' ').replace(/([’'])\s+/g, '$1');
  }
  function applyIdentity(d) {
    if(!d)return;
    text('.brand-name',d.name);text('.footer-logo>span',d.name);
    // Keep brand subtitles as individually editable nodes even when the brand heading changes.
    for(const sel of ['.brand-name','.footer-logo>span']) {
      const el=document.querySelector(sel);if(!el)continue;
      if(sel==='.brand-name') {el.textContent='';el.append(document.createTextNode((d.name||'Agorà APS').replace(/\s+APS$/i,'')+' '));el.append(element('small',{},'APS'));el.append(element('span',{class:'brand-caption'},d.strapline||''));}
      else {el.textContent=d.name||'Agorà APS';el.append(element('small',{},d.strapline||''));}
    }
    image('.site-brand img',d.logo,'');image('.footer-logo img',d.logo,'');image('.about-brand img',d.badgeLogo,'Logo ufficiale di Agorà APS');
    link('.header-cta',d.navCta?.label,d.navCta?.url);
    const palette = {'--petrol':'petrol','--terracotta':'terracotta','--ivory':'ivory','--paper':'paper'};
    for(const [css,key] of Object.entries(palette))if(/^#[0-9a-fA-F]{6}$/.test(d.colors?.[key]||''))document.documentElement.style.setProperty(css,d.colors[key]);
    if(d.seo?.title)document.title=d.seo.title;
    const meta=document.querySelector('meta[name="description"]');if(meta&&d.seo?.description)meta.content=d.seo.description;
    const og=document.querySelector('meta[property="og:description"]');if(og&&d.seo?.description)og.content=d.seo.description;
    const ogTitle=document.querySelector('meta[property="og:title"]');if(ogTitle&&d.seo?.title)ogTitle.content=d.seo.title;
    const ogImage=document.querySelector('meta[property="og:image"]');if(ogImage&&url(d.seo?.shareImage,'src'))ogImage.content=new URL(d.seo.shareImage,location.origin==='null'?'https://agora-scuoladidialogosocraticoecittadinanzattiva.site':location.origin).href;
    const icon=document.querySelector('link[rel="icon"]');if(icon&&url(d.logo,'src'))icon.href=d.logo;
    text('.site-footer p',d.footer?.tagline);
    text('.site-footer>div>div:last-child>span',d.footer?.copyright);
  }
  function applyHome(d) {
    const h=d?.hero;if(!h)return;
    text('.hero .meta-line',h.eyebrow);
    heading('.hero h1',[h.line1||'',h.line2||'',{last:h.accent||''}]);
    text('.hero-intro p',h.description);link('.hero-actions .button',h.buttonText,h.buttonLink);
    link('.hero-actions .text-link',h.secondaryText,h.secondaryLink);
    const footnote=document.querySelector('.hero-footnote');if(footnote && h.footnote)footnote.textContent=h.footnote;
    image('.hero-figure>img',h.image,h.imageAlt);
    text('.hero-figure figcaption .caption-index',h.imageCaptionTop);
    text('.hero-figure figcaption>span:last-child',h.imageCaptionBottom);
    if(Array.isArray(d.values)) {
      const grid=document.querySelector('.values-grid');if(grid){grid.replaceChildren();
        for(const v of d.values.slice(0,8))grid.append(element('div',{},undefined));
        [...grid.children].forEach((n,i)=>{n.append(element('span',{class:'value-symbol','aria-hidden':'true'},d.values[i].symbol||'○'));n.append(element('span',{},d.values[i].title||''));});
      }
    }
  }
  function applyProjects(d) {
    if(!d)return;
    text('.projects-heading .section-label',d.intro?.eyebrow);
    heading('.projects-heading h2',[d.intro?.titleLine||'',{mixed:'',accent:d.intro?.titleAccent||''}]);
    text('.projects-heading>p',d.intro?.description);
    image('.project-feature>img',d.featured?.image,d.featured?.imageAlt);
    text('.project-kicker',d.featured?.kicker);
    text('.project-feature h3',d.featured?.title);
    text('.project-feature-content p',d.featured?.description);
    link('.project-feature-link',d.featured?.linkText,d.featured?.linkUrl);
    const list=document.querySelector('.project-list');
    if(list&&Array.isArray(d.cards)){
      list.replaceChildren();
      for(const p of d.cards.slice(0,16)){
        const inBook=!!document.querySelector('.story-book');
        const a=element(inBook?'details':'article',{class:inBook?'project-line project-detail':'project-line'}),top=element(inBook?'summary':'div',{class:'project-top'});
        top.append(element('span',{class:'project-type'},p.category||''),element('span',{class:'project-deco','aria-hidden':'true'},p.symbol||'✳'));
        if(inBook){top.querySelector('.project-deco')?.remove();top.append(element('h3',{},p.title||''),element('span',{class:'detail-plus','aria-hidden':'true'},'+'));a.append(top,element('p',{},p.description||''));}
        else a.append(top,element('h3',{},p.title||''),element('p',{},p.description||''));
        const target=url(p.linkUrl);if(target){const l=element('a',{href:target},p.linkText||'Scopri di più');l.append(element('span',{'aria-hidden':'true'},'↗'));a.append(l);}
        list.append(a);
      }
    }
    text('.journey .section-label',d.journey?.eyebrow);
    heading('.journey h2',[d.journey?.titleLine||'',{mixed:'',accent:d.journey?.titleAccent||''}]);
    text('.journey-grid>div>p:not(.section-label)',d.journey?.description);
    link('.journey .button',d.journey?.linkText,d.journey?.linkUrl);
    image('.journey img',d.journey?.image,d.journey?.imageAlt);
  }
  function applyMethod(d) {
    if(!d)return;
    text('.method-copy .section-label',d.eyebrow);
    heading('.method-copy h2',[d.titleLine||'',{mixed:d.titleMiddle||'',accent:d.titleAccent||''}]);
    const pp=document.querySelectorAll('.method-copy>p:not(.section-label)');text('.method-copy>p:not(.section-label)',d.description1);if(pp[1]&&d.description2)pp[1].textContent=d.description2;
    image('.method-figure img',d.image,d.imageAlt);text('.method-figure figcaption',d.imageCaption);
    link('.method-copy .button',d.buttonText,d.buttonUrl);
    text('.manifesto .section-label',d.manifesto?.eyebrow);
    heading('.manifesto h2',[d.manifesto?.line1||'',{mixed:'',accent:d.manifesto?.accent||''}]);
    const pp2=document.querySelectorAll('.manifesto-text>p');if(pp2[0])pp2[0].textContent=d.manifesto?.paragraph1||'';if(pp2[1])pp2[1].textContent=d.manifesto?.paragraph2||'';
    text('.focus-section .section-label',d.focus?.eyebrow);text('.focus-section h2',d.focus?.title);text('.focus-section .section-heading>p',d.focus?.description);
    const list=document.querySelector('.focus-list');if(list&&Array.isArray(d.focus?.items)){
      list.replaceChildren();for(const item of d.focus.items.slice(0,12)){
        const a=element('article');a.append(element('span',{class:'focus-glyph','aria-hidden':'true'},item.symbol||'✦'));
        const b=element('div');b.append(element('h3',{},item.title||''),element('p',{},item.description||''));a.append(b);list.append(a);
      }
    }
  }
  function applyAssociation(d){if(!d)return;
    text('.about-copy .section-label',d.eyebrow);
    heading('.about-copy h2',[d.titleLine||'',{mixed:'',accent:d.titleAccent||''}]);
    const p=document.querySelectorAll('.about-copy>p:not(.section-label)');if(p[0])p[0].textContent=d.description1||'';if(p[1])p[1].textContent=d.description2||'';
    const tags=document.querySelector('.about-notes');if(tags&&Array.isArray(d.tags)){tags.replaceChildren();d.tags.slice(0,9).forEach(x=>tags.append(element('span',{},x)));}
    link('.about-copy .text-link',d.linkText,d.linkUrl);
    image('.about-photo',d.image,d.imageAlt);text('.about-brand span',d.badgeCaption);
  }
  function applyTransparency(d) {if(!d)return;
    text('.transparency-section .section-label',d.eyebrow);
    heading('.transparency-section h2',[d.titleLine1||'',d.titleLine2||'']);
    text('.transparency-grid>div>p:not(.section-label)',d.description);
    text('.transparency-panel h3',d.panelTitle);text('.transparency-panel p',d.panelDescription);
    link('.transparency-panel .text-link',d.linkText,d.linkUrl);
  }
  function applyContact(d){if(!d)return;
    text('.contact-section .section-label',d.eyebrow);
    heading('.contact-section h2',[d.titleLine||'',{mixed:'',accent:d.titleAccent||''}]);
    text('.contact-section .contact-grid>div:first-child>p:not(.section-label)',d.description);
    link('.contact-section .button',d.buttonText,d.buttonUrl);
    text('.contact-details h3',d.orgName);text('.contact-details>p',d.orgSubtitle);
    const dd=document.querySelectorAll('.contact-details dd');
    if(dd[0]&&d.email){const a=dd[0].querySelector('a');if(a){a.textContent=d.email;a.href='mailto:'+encodeURIComponent(d.email);}}
    if(dd[1])dd[1].textContent=d.territory||'';if(dd[2])dd[2].textContent=d.oid||'';
  }
  function applyBlocks(d){const holder=document.querySelector('#custom-blocks');if(!holder)return;
    holder.replaceChildren();if(!Array.isArray(d?.items))return;
    for(const block of d.items.slice(0,20)){
      const section=element('section',{class:'custom-section'+(!block.image?' no-image':''),'aria-label':block.title||'Approfondimento'});
      if(block.background==='cream')section.style.background='var(--ivory)';
      if(block.background==='petrol'){section.style.background='var(--petrol)';section.style.color='white';}
      const grid=element('div',{class:'container custom-grid'}),copy=element('div');
      copy.append(element('p',{class:'section-label'},block.eyebrow||''),element('h2',{},block.title||''),element('p',{},block.description||''));
      const target=url(block.buttonUrl);if(block.buttonText&&target){const a=element('a',{class:'button button-primary',href:target},block.buttonText+' ↗');copy.append(a);}
      grid.append(copy);
      const src=url(block.image,'src');if(src)grid.append(element('img',{src,alt:block.imageAlt||'',loading:'lazy',decoding:'async'}));
      section.append(grid);holder.append(section);
    }
  }
  function applyOpportunities(d) {
    for(const [key,id] of [['university','tirocini'],['esc','volontariato-esc']]){
      const entry=d?.[key];if(!entry)continue;
      const scope='#'+id;
      text(scope+' .section-label',entry.eyebrow);text(scope+' h2',entry.title);
      text(scope+' .opportunity-description',entry.description);
      text(scope+' .recognition-status',entry.status);
      text(scope+' .recognition-card h3',key==='university'?entry.institution:entry.role);
      text(scope+' .recognition-card>p',key==='university'?entry.agreementDescription:entry.recognition);
      link(scope+' .opportunity-copy>.button',entry.buttonText,entry.buttonUrl);
      image(scope+' .photo-print img',entry.image,entry.imageAlt);text(scope+' figcaption',entry.caption);
      if(key==='university'){
        const list=document.querySelector(scope+' .opportunity-steps');
        if(list&&Array.isArray(entry.steps))list.replaceChildren(...entry.steps.slice(0,8).map(t=>element('li',{},t)));
        text(scope+' .other-university',entry.otherUniversity);
        const agreements=document.querySelector(scope+' .university-agreements');
        if(agreements&&Array.isArray(entry.agreements)){agreements.replaceChildren();for(const item of entry.agreements.slice(0,12)){const li=element('li');li.append(element('h4',{},item.institution||''),element('span',{class:'agreement-status'},item.status||''),element('p',{},item.description||''));agreements.append(li);}}
      } else {
        text(scope+' .recognition-reference p',entry.reference);
        const list=document.querySelector(scope+' .esc-steps');
        if(list&&Array.isArray(entry.steps)){list.replaceChildren();for(const step of entry.steps.slice(0,8)){const li=element('li');li.append(element('strong',{},step.title||''),element('p',{},step.description||''));list.append(li);}}
      }
    }
  }
  function applyLayout(d) {
    if(!Array.isArray(d?.sections))return;
    const story=document.querySelector('.story-book');
    if(story){
      const chapters={sommario:'sommario',activities:'attivita',connected:'realta-collegate',board:'direttivo',publications:'pubblicazioni',research:'ricerca',membership:'iscrizioni',privacy:'privacy',epilogue:'epilogo',association:'associazione',method:'laboratori',projects:'progetti',university:'tirocini',esc:'volontariato-esc',transparency:'trasparenza',contact:'contatti'};
      const nested={manifesto:'manifesto',journey:'odisseo',focus:'strumenti',custom:'custom-blocks'};
      for(const sec of d.sections){
        if(chapters[sec.id]){const page=document.getElementById(chapters[sec.id]);if(page){page.dataset.excluded=String(sec.visible===false);story.append(page);}}
        else if(nested[sec.id]){const node=document.getElementById(nested[sec.id]);if(node)node.hidden=sec.visible===false;}
      }
      return;
    }
    const mapping={values:'.values-strip',projects:'#progetti',method:'#laboratori',manifesto:'#manifesto',association:'#associazione',journey:'#odisseo',focus:'#strumenti',transparency:'#trasparenza',custom:'#custom-blocks',contact:'#contatti'};
    const main=document.querySelector('main');if(!main)return;
    const touched=new Set();
    for(const sec of d.sections){const selector=mapping[sec.id];if(!selector||touched.has(sec.id))continue;touched.add(sec.id);
      const node=main.querySelector(selector);if(!node)continue;node.hidden=(sec.visible===false);main.append(node);
    }
    for(const [id,sel] of Object.entries(mapping)){if(touched.has(id))continue;const el=main.querySelector(sel);if(el)main.append(el);}
  }
  async function init(){
    const results=await Promise.all(names.map(async name=>{
      try {const response=await fetch(`/content/${name}.json`,{cache:'no-cache'});if(!response.ok)throw Error(response.status);return await response.json();}
      catch(err){console.warn('Contenuti Agorà non disponibili:',name,err);return null;}
    }));
    const [identity,home,projects,method,association,transparency,contact,layout,blocks,opportunities]=results;
    try { applyIdentity(identity);applyHome(home);applyProjects(projects);applyMethod(method);applyAssociation(association);applyTransparency(transparency);applyContact(contact);applyBlocks(blocks);applyOpportunities(opportunities);applyLayout(layout); }
    catch(err){console.error('Errore nel caricamento dei contenuti del sito',err);}
    document.dispatchEvent(new CustomEvent('agora:cms:loaded',{detail:{success:results.filter(Boolean).length,total:names.length}}));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();