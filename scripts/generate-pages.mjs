import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
const keys=["association","method","projects","opportunities","contact","transparency","governance","home","whatsapp"];
const D=Object.fromEntries(keys.map(key=>[key,JSON.parse(readFileSync('content/'+key+'.json','utf8'))]));
const buildPages=function buildPages(D){
 const e=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
 const base="https://agora-scuoladidialogosocraticoecittadinanzattiva.site";
 const email="agora.scuoladidialogosocratico@gmail.com";
 const mailto=subject=>"mailto:"+email+"?subject="+encodeURIComponent(subject);
 const runts="https://servizi.lavoro.gov.it/runts/it-it/Ricerca-enti";
 const internal=[["/chi-siamo/","Chi siamo"],["/progetti/","Progetti"],["/tirocini/","Tirocini"],["/volontariato-esc/","ESC"],["/partecipa/","Partecipa"],["/contatti/","Contatti"]];
 const card=(title,body,tag="")=>`<article class="info-card">${tag?`<p class="tag">${e(tag)}</p>`:""}<h3>${e(title)}</h3>${body}</article>`;

 const allowedImage=(value,fallback)=>typeof value==='string' && /^\/assets\/[a-z0-9_-]+\.webp$/i.test(value)?value:fallback;
 const photographs=[
  {src:allowedImage(D.home.hero.image,'/assets/agora_gruppo_home.webp'),alt:D.home.hero.imageAlt||'Gruppo di partecipanti ad Agorà riuniti a un tavolo',label:'Le persone'},
  {src:allowedImage(D.method.image,'/assets/agora_dialogo.webp'),alt:D.method.imageAlt||'Partecipanti seduti attorno a un tavolo',label:'Il dialogo'},
  {src:allowedImage(D.association.image,'/assets/agora_chi_siamo.webp'),alt:D.association.imageAlt||'Partecipanti di Agorà all’aperto',label:'La comunità'},
  {src:allowedImage(D.projects.featured.image,'/assets/agora_viaggio.webp'),alt:D.projects.featured.imageAlt||'Binari ferroviari al tramonto',label:'Il viaggio'}
 ];
 const photoForPath={
  '/chi-siamo/':2,'/progetti/':3,'/progetti/soda-labs/':1,'/progetti/odisseo-philosophorum/':3,
  '/tirocini/':1,'/volontariato-esc/':0,'/partecipa/':2,'/contatti/':0,
  '/trasparenza/':2,'/privacy/':1,'/accessibilita/':1
 };
 const visualThemes={
  '/chi-siamo/':'community','/progetti/':'projects','/progetti/soda-labs/':'method',
  '/progetti/odisseo-philosophorum/':'travel','/tirocini/':'method','/volontariato-esc/':'travel',
  '/partecipa/':'community','/contatti/':'contact','/trasparenza/':'community',
  '/privacy/':'method','/accessibilita/':'method'
 };
 const projectGalleryPaths=new Set(['/chi-siamo/','/progetti/','/tirocini/','/partecipa/']);
 const picture=(photo,lazy=true)=>{const src=photo.src;const low=src.replace(/\.webp$/,'-480.webp');const mid=src.replace(/\.webp$/,'-800.webp');return '<img src="'+e(src)+'" srcset="'+e(low)+' 480w, '+e(mid)+' 800w, '+e(src)+' 1300w" sizes="(max-width:760px) 94vw, 60vw" alt="'+e(photo.alt)+'" width="1300" height="731" decoding="async" loading="'+(lazy?'lazy':'eager')+'"' +(lazy?'':' fetchpriority="high"')+'>';};

 const p=(path,title,desc,eyebrow,body)=>{
   const canonical=base+path;
   const leadPhoto=photographs[photoForPath[path]??0];
   const theme=visualThemes[path]||'community';
   const heroVisual='<figure class="visual-cover-photo">'+picture(leadPhoto,false)+'<figcaption><span class="visual-photo-count">AGORÀ / VISIONI</span><span>'+e(leadPhoto.label)+'</span></figcaption></figure>';
   const visualGallery=projectGalleryPaths.has(path)?'<section class="visual-gallery" aria-label="Fotografie delle esperienze di Agorà"><div class="visual-gallery-heading"><span>La nostra galleria</span><p>Il dialogo è fatto di persone, luoghi e incontri.</p></div><div class="visual-gallery-grid">'+photographs.filter(p=>p.src!==leadPhoto.src).map((photo,i)=>'<figure class="visual-gallery-item">'+picture(photo,true)+'<figcaption><span>0'+(i+1)+'</span> '+e(photo.label)+'</figcaption></figure>').join('')+'</div></section>':'';

   const schema=JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"NGO","@id":base+"/#agora","name":"Agorà – Scuola di Dialogo Socratico e Cittadinanza Attiva APS","url":base+"/"},{"@type":"WebPage","@id":canonical,"url":canonical,"name":title,"description":desc,"inLanguage":"it-IT","isPartOf":{"@id":base+"/#agora"}}]});
   const nav=internal.map(([url,label])=>`<a href="${url}"${path===url?' aria-current="page"':""}>${e(label)}</a>`).join("");
   return `<!doctype html>
<html lang="it"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#193b4a">
<title>${e(title)} | Agorà APS</title><meta name="description" content="${e(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:title" content="${e(title)} | Agorà APS"><meta property="og:description" content="${e(desc)}"><meta property="og:url" content="${canonical}">
<meta property="og:image" content="${base}/assets/agora_gruppo_home.webp">
<link rel="icon" type="image/png" href="/assets/agora_icon.png">
<link rel="stylesheet" href="/assets/sections.css?v=20261111"><link rel="stylesheet" href="/assets/accessibility.css?v=20261111"><link rel="stylesheet" href="/assets/experience.css?v=20261111"><link rel="stylesheet" href="/assets/visual-story.css?v=20261111"><link rel="stylesheet" href="/assets/site-chat.css?v=20261111">
<script type="application/ld+json">${schema}</script><script defer src="/assets/a11y.js?v=20261111"></script><script defer src="/assets/experience.js?v=20261111"></script><script defer src="/assets/contact-form.js?v=20261111"></script><script defer src="/assets/site-chat.js?v=20261111"></script>
</head><body class="info-page">
<a class="skip-link" href="#contenuto">Salta al contenuto</a>
<header class="info-header"><div class="info-header-inner"><a class="info-brand" href="/" aria-label="Agorà APS, torna all'inizio"><img alt="" src="/assets/agora_icon.png" width="48" height="48"><span>Agorà APS<small>Scuola di Dialogo Socratico</small></span></a><nav class="info-nav" aria-label="Navigazione principale">${nav}</nav></div></header>
<main class="info-main" id="contenuto"><nav class="info-breadcrumbs" aria-label="Percorso di navigazione"><a href="/">Home</a> / <span aria-current="page">${e(eyebrow)}</span></nav>
<header class="info-hero visual-cover theme-${theme}"><div class="visual-cover-copy"><p class="eyebrow">${e(eyebrow)}</p><span class="visual-cover-number" aria-hidden="true">AG / 2026</span><h1>${e(title)}</h1><p class="lead">${e(desc)}</p><a class="visual-cover-explore" href="#approfondisci">Scopri di più <span aria-hidden="true">↘</span></a></div>${heroVisual}<span class="visual-cover-decor" aria-hidden="true">✳</span></header><div id="approfondisci" class="visual-story-body">${body}</div>${visualGallery}</main>
<footer class="info-footer"><div class="info-footer-inner"><span>© 2026 Agorà APS</span><nav class="info-footer-links" aria-label="Informazioni e documenti"><a href="/trasparenza/">Trasparenza</a><a href="/privacy/">Privacy</a><a href="/accessibilita/">Accessibilità</a><a href="${runts}" rel="noopener noreferrer" target="_blank">RUNTS</a></nav><div class="accessibility-tools" aria-label="Preferenze di lettura"><button type="button" data-a11y="text" aria-pressed="false">A+ Testo</button><button type="button" data-a11y="contrast" aria-pressed="false">Contrasto</button></div></div></footer></body></html>\n`;
 };
 const A=D.association,M=D.method,P=D.projects,O=D.opportunities,C=D.contact,G=D.governance,W=D.whatsapp;
 const callDigits=String(C.phone||'').replace(/[^0-9+]/g,'');
 const waDigits=String(W.phoneNumber||'').replace(/\D/g,'');
 const waUrl=W.enabled===true && /^[1-9]\d{7,14}$/.test(waDigits)?'https://wa.me/'+waDigits:'';
 const governanceCards=G.members.map(person=>card(person.name,"<p>"+e(person.role)+"</p>","Direttivo")).join("");
 const projectCards=(P.cards||[]).map(c=>card(c.title,`<p>${e(c.description)}</p>${c.title==="SODA-LABS"?'<p><a href="/progetti/soda-labs/">Scheda del progetto</a></p>':""}`,c.category)).join("");
 const pages={};
 pages["chi-siamo/index.html"]=p("/chi-siamo/","Chi siamo – Dialogo socratico e cittadinanza attiva",
 "Agorà APS nasce in Sicilia e promuove dialogo socratico, educazione non formale e cittadinanza attiva con progetti locali ed europei.","L'associazione",`
 <section class="info-section"><h2>Una comunità che pensa e agisce</h2><p>${e(A.description1)}</p><p>${e(A.description2)}</p>
 <p>Agorà promuove conversazioni strutturate, competenze critiche e opportunità formative per giovani, educatori, ricercatori e comunità.</p></section>
 <section class="info-section"><h2>Come lavoriamo</h2><p>${e(M.description1)}</p><p>${e(M.description2)}</p></section>
 <section class="info-section" id="direttivo"><h2>Le persone e gli incarichi</h2><p>Gli incarichi qui riportati provengono dalla documentazione associativa disponibile per le convenzioni universitarie di giugno 2026. Per l'assetto formalmente registrato più recente fa fede la scheda nel RUNTS.</p><div class="info-grid governance-grid">${governanceCards}</div><p class="info-note">Verifica la composizione registrata nel <a href="${runts}" rel="noopener noreferrer" target="_blank">RUNTS</a>, cercando il codice fiscale <strong>93254890879</strong>. Le informazioni qui riportate non sostituiscono la visura ufficiale.</p></section>
 <section class="info-section"><h2>Approfondisci</h2><div class="info-grid">
 ${card("Progetti e mobilità",'<p>Scambi, laboratori e cittadinanza europea.</p><p><a href="/progetti/">Esplora i progetti</a></p>')}
 ${card("Tirocini e volontariato",'<p>Esperienze per apprendere insieme.</p><p><a href="/tirocini/">Informazioni sui tirocini</a> · <a href="/volontariato-esc/">Corpo europeo di solidarietà</a></p>')}</div></section>`);
 pages["progetti/index.html"]=p("/progetti/","Progetti Erasmus+ e attività di Agorà",
 "Scopri le attività di Agorà APS: SODA-LABS, DiscoverEU, scambi giovanili, laboratori di cittadinanza e percorsi di pensiero critico.","Progetti e iniziative",`
 <section class="info-section"><h2>Esperienze e opportunità</h2><p>${e(P.intro.description)}</p><div class="info-grid">
 ${card(P.featured.title,`<p>${e(P.featured.description)}</p><p><a href="/progetti/odisseo-philosophorum/">Leggi la scheda DiscoverEU</a></p>`,P.featured.kicker)}
 ${projectCards}</div></section>
 <section class="info-section"><h2>Vuoi partecipare o proporre un partenariato?</h2><p>Raccontaci la tua idea, il territorio o il programma europeo che ti interessa.</p><a class="info-btn" href="${mailto("Informazioni progetti europei Agorà")}">Contatta il gruppo di progetto</a></section>`);
 pages["progetti/soda-labs/index.html"]=p("/progetti/soda-labs/","SODA-LABS – Socratic Dialogue Labs",
 "SODA-LABS è un progetto Erasmus+ KA210-YOU sulla resilienza democratica e il dialogo socratico, con Agorà APS.","Progetto Erasmus+ KA210-YOU",`
 <section class="info-section"><h2>La cooperazione europea</h2><p>Socratic Dialogue Labs for Democratic Resilience: cooperazione europea per rafforzare il dialogo e la resilienza democratica.</p>
 <dl><dt><strong>Codice progetto</strong></dt><dd>2026-1-IT03-KA210-YOU-000466841</dd><dt><strong>Programma</strong></dt><dd>Erasmus+ KA210-YOU</dd><dt><strong>Stato documentale</strong></dt><dd>Convenzione perfezionata e trasmessa dall'Agenzia Italiana per la Gioventù il 3 novembre 2026, secondo le informazioni dell'associazione.</dd></dl>
 <p>Le attività e i risultati vengono comunicati progressivamente, evitando di presentare come realizzati interventi non ancora documentati.</p></section>
 <section class="info-section"><a class="info-btn" href="${mailto("Informazioni SODA-LABS")}">Chiedi informazioni su SODA-LABS</a></section>`);
 pages["progetti/odisseo-philosophorum/index.html"]=p("/progetti/odisseo-philosophorum/","Odisseo Philosophorum – DiscoverEU Inclusione",
 "Viaggio filosofico-politico di Agorà APS per cinque giovani: mobilità europea, cittadinanza attiva e apprendimento non formale.","Erasmus+ KA155-YOU",`
 <section class="info-section"><h2>Un viaggio che diventa formazione</h2><p>${e(P.featured.description)}</p><p>${e(P.journey.description)}</p>
 <dl><dt><strong>Codice progetto</strong></dt><dd>2026-1-IT03-KA155-YOU-000400338</dd><dt><strong>Periodo previsto</strong></dt><dd>30 settembre – 11 ottobre 2026</dd><dt><strong>Gruppo previsto</strong></dt><dd>Cinque giovani e due educatori accompagnatori</dd></dl>
 <p>La selezione risulta conclusa. Per informazioni sugli esiti e sugli eventuali atti accessibili, contatta Agorà; la riservatezza dei candidati viene tutelata.</p></section>
 <section class="info-section"><a class="info-btn" href="${mailto("Informazioni Odisseo Philosophorum")}">Contatta l'associazione</a></section>`);
 pages["tirocini/index.html"]=p("/tirocini/","Tirocini universitari presso Agorà APS",
 "Percorsi di tirocinio, formazione e progettazione culturale con Agorà APS: atenei convenzionati, stato delle pratiche e modalità di accesso.","Tirocini e formazione",`
 <section class="info-section"><h2>Dallo studio all'esperienza</h2><p>${e(O.university.description)}</p>
 <div class="info-card"><p class="tag">${e(O.university.status)}</p><h3>${e(O.university.institution)}</h3><p>${e(O.university.agreementDescription)}</p></div></section>
 <section class="info-section"><h2>Altri atenei: stato delle pratiche</h2><div class="info-grid">${(O.university.agreements||[]).map(a=>card(a.institution,`<p><strong>Stato:</strong> ${e(a.status)}</p><p>${e(a.description)}</p>`)).join("")}</div></section>
 <section class="info-section"><h2>Come richiedere un tirocinio</h2><ol class="info-list">${(O.university.steps||[]).map(x=>`<li>${e(x)}</li>`).join("")}</ol><p>${e(O.university.otherUniversity)}</p><a class="info-btn" href="${mailto("Tirocinio universitario con Agorà")}">Proponi un tirocinio</a></section>`);
 pages["volontariato-esc/index.html"]=p("/volontariato-esc/","Volontariato europeo con Agorà APS",
 "Agorà APS accompagna i giovani nel Corpo europeo di solidarietà come organizzazione di sostegno con Marchio di Qualità ESC.","Corpo europeo di solidarietà",`
 <section class="info-section"><h2>Un'esperienza accompagnata</h2><p>${e(O.esc.description)}</p>
 <div class="info-card"><p class="tag">${e(O.esc.status)}</p><h3>${e(O.esc.role)}</h3><p>${e(O.esc.recognition)}</p><p><strong>Riferimento:</strong> ${e(O.esc.reference)}</p></div></section>
 <section class="info-section"><h2>Come ti accompagniamo</h2><div class="info-grid">${(O.esc.steps||[]).map(x=>card(x.title,`<p>${e(x.description)}</p>`)).join("")}</div></section>
 <section class="info-section"><a class="info-btn" href="${mailto("Volontariato ESC con Agorà")}">Informazioni sul volontariato ESC</a></section>`);
 pages["partecipa/index.html"]=p("/partecipa/","Partecipa e sostieni Agorà APS",
 "Scopri come prendere parte alle attività associative di Agorà APS, aderire alla comunità e sostenere le iniziative culturali.","Partecipazione associativa",`
 <section class="info-section"><h2>Una comunità cresce con te</h2><p>Puoi partecipare ai laboratori, proporre iniziative e richiedere le modalità di adesione all'associazione.</p>
 <div class="info-grid">${card("Socio ordinario",'<p>Quota riportata nel sito associativo: <strong>10 €</strong>. Per modalità e condizioni di adesione contatta la segreteria.')}
 ${card("Socio sostenitore",'<p>Quota riportata nel sito associativo: <strong>25 €</strong>. Per modalità e condizioni di adesione contatta la segreteria.')}</div>
 <p class="info-note">L'adesione all'associazione non è un requisito né un criterio di selezione per i progetti Erasmus+.</p>
 <a class="info-btn" href="${mailto("Iscrizione o sostegno ad Agorà APS")}">Richiedi le modalità di adesione</a></section>`);
 pages["contatti/index.html"]=p("/contatti/","Contatti e sedi di Agorà APS",
 "Contatta Agorà APS per attività, tirocini, partnership, dialogo socratico e progetti europei in Sicilia.","Contatti e territorio",`
 <section class="info-section contact-section" id="scrivici" aria-labelledby="contact-form-title"><span class="contact-eyebrow">Contatto diretto</span><h2 id="contact-form-title">Un dialogo inizia da qui.</h2>
 <p>${e(C.description)}</p>
 <div class="contact-layout"><form id="agora-contact-form" class="contact-form" action="/api/contact" method="post">
 <div class="contact-form-intro"><p class="contact-form-kicker">01 / Il tuo messaggio</p><h3>Raccontaci cosa hai in mente.</h3><p>Compila i campi e inviaci la tua richiesta. I campi contrassegnati sono obbligatori.</p></div>
 <div class="contact-fields"><div class="contact-field"><label for="contact-name">Nome e cognome <span aria-hidden="true">*</span></label><input id="contact-name" name="name" type="text" autocomplete="name" minlength="2" maxlength="100" placeholder="Come possiamo chiamarti?" required></div>
 <div class="contact-field"><label for="contact-email">Indirizzo email <span aria-hidden="true">*</span></label><input id="contact-email" name="email" type="email" autocomplete="email" maxlength="254" placeholder="nome@esempio.it" required></div>
 <div class="contact-field contact-field-full"><label for="contact-topic">Di cosa vuoi parlare? <span aria-hidden="true">*</span></label><select id="contact-topic" name="topic" required><option value="">Seleziona un argomento</option><option value="Informazioni generali">Informazioni generali</option><option value="Progetti Erasmus+">Progetti Erasmus+</option><option value="Tirocini universitari">Tirocini universitari</option><option value="Volontariato ESC">Volontariato ESC</option><option value="Partenariati">Partenariati e collaborazioni</option><option value="Altro">Altro</option></select></div>
 <div class="contact-field contact-field-full"><label for="contact-message">Il tuo messaggio <span aria-hidden="true">*</span></label><textarea id="contact-message" name="message" rows="6" minlength="20" maxlength="4000" placeholder="Descrivi la tua idea, la tua domanda o l'opportunità che cerchi…" required aria-describedby="contact-counter"></textarea><span id="contact-counter" class="contact-counter" data-contact-counter>0 / 4000 caratteri</span></div>
 <div class="contact-honeypot" aria-hidden="true"><label for="contact-website">Non compilare questo campo</label><input tabindex="-1" autocomplete="off" id="contact-website" name="website"></div>
 <label class="contact-consent"><input type="checkbox" name="consent" value="yes" required><span>Ho letto le <a href="/privacy/" target="_blank" rel="noopener">informazioni sul trattamento dei dati</a> e chiedo di essere ricontattato/a riguardo al mio messaggio. <span aria-hidden="true">*</span></span></label></div>
 <div class="contact-submit-row"><button class="contact-submit" type="submit">Invia il messaggio <span aria-hidden="true">↗</span></button><p class="contact-private">I dati sono usati esclusivamente per gestire la richiesta; non sono pubblicati sul sito.</p></div>
 <p class="contact-feedback" data-contact-status role="status" aria-live="polite" hidden></p>
 </form><aside class="contact-aside"><span class="contact-aside-mark" aria-hidden="true">✳</span><h3>Preferisci scriverci direttamente?</h3><p>Siamo una comunità: ogni domanda ha il suo spazio. Puoi contattarci anche via email.</p><a class="contact-direct" href="mailto:${e(C.email)}">${e(C.email)} <span aria-hidden="true">↗</span></a><div class="contact-aside-rule"></div><div class="contact-channel"><span class="contact-channel-kicker">Chiamaci al numero italiano</span><a class="contact-direct contact-call-link" href="tel:${e(callDigits)}">${e(C.phone)} <span aria-hidden="true">↗</span></a></div><div class="contact-channel"><span class="contact-channel-kicker">Conversazione sul sito</span><button class="contact-direct contact-chat-link" type="button" data-open-site-chat>Apri la chat di Agorà <span aria-hidden="true">↗</span></button></div><p><strong>Territorio operativo</strong><br>${e(C.territory)}</p><p><strong>OID Erasmus+</strong><br>${e(C.oid)}</p><p class="contact-small">Per visite o incontri in presenza, richiedi prima un appuntamento.</p></aside></div></section>
`);
 pages["trasparenza/index.html"]=p("/trasparenza/","Trasparenza e documenti istituzionali",
 "Consulta gli atti di Agorà APS depositati nel RUNTS e trova le informazioni associative, le opportunità e i contatti ufficiali.","Trasparenza associativa",`
 <section class="info-section"><h2>La fonte ufficiale: RUNTS</h2><p>Agorà APS fa riferimento al Registro Unico Nazionale del Terzo Settore per i dati istituzionali e gli atti depositati, consultabili attraverso la ricerca degli enti.</p>
 <p>Per trovare l'associazione, cerca nel RUNTS la denominazione <strong>Agorà – Scuola di Dialogo Socratico e Cittadinanza Attiva APS</strong>.</p>
 <a class="info-btn" href="${runts}" rel="noopener noreferrer" target="_blank">Consulta il RUNTS</a></section>
 <section class="info-section"><h2>Progetti e riconoscimenti</h2><p>Le schede dei <a href="/progetti/">progetti</a> e delle <a href="/tirocini/">convenzioni universitarie</a> riportano lo stato comunicato dall'associazione; per conferme aggiornate e documenti accessibili puoi contattarci.</p>
 <p>Per informazioni su graduatorie e selezioni concluse, la disponibilità di atti e dati personali viene valutata nel rispetto delle regole applicabili.</p></section>`);
 pages["privacy/index.html"]=p("/privacy/","Informazioni sul trattamento dei dati personali",
 "Informazioni sui dati personali raccolti nei contatti e nelle candidature alle attività e ai progetti di Agorà APS.","Protezione dei dati",`
 <section class="info-section"><h2>Titolare e contatti</h2><p>Agorà – Scuola di Dialogo Socratico e Cittadinanza Attiva APS è il soggetto a cui rivolgersi per informazioni sui trattamenti connessi alle attività associative.</p><p>Contatto privacy: <a href="mailto:${email}">${email}</a>.</p></section>
 <section class="info-section"><h2>Quando ci contatti</h2><p>I dati che comunichi volontariamente via email sono utilizzati per gestire le richieste, le comunicazioni e le attività associative pertinenti. Non inviare informazioni particolarmente sensibili se non richieste e attraverso canali appropriati.</p></section>
 <section class="info-section"><h2>Chat bidirezionale del sito</h2><p>Quando il servizio sarà attivato, i messaggi che invii nella chat rimarranno consultabili nella stessa finestra del sito per la sessione corrente. Per consentire una risposta dell'associazione, il sistema utilizzerà il database Cloudflare e permetterà alle persone autorizzate di Agorà di rispondere da una posta operatore riservata, anche da smartphone. Questa modalità non invia messaggi a Meta o a WhatsApp. Al visitatore non sarà richiesto di aprire WhatsApp o di possederne un account.</p><p>Per consentire il botta e risposta dalla casella <strong>agora.scuoladidialogosocratico@gmail.com</strong>, la chat può inviare una copia dei messaggi e delle risposte alla posta associativa. Quando configurato, il server Cloudflare riceve le email di risposta inviate all'indirizzo tecnico risposte@agora-scuoladidialogosocraticoecittadinanzattiva.site, ne verifica l'origine e pubblica il testo nella conversazione del visitatore. Nessun indirizzo email del visitatore è richiesto. Le copie email nella casella Gmail non sono eliminate automaticamente dal sistema del sito e devono essere gestite secondo una politica di conservazione dedicata.</p><p>Le conversazioni del sito sono previste con una durata massima di conservazione di 30 giorni dall'ultima attività, salvo obblighi di legge diversi. La sessione di accesso alla chat viene conservata nel browser, fino alla chiusura della relativa sessione. Una verifica antispam Cloudflare Turnstile proteggerà l'apertura della conversazione. Non inserire dati particolarmente sensibili nella chat.</p><p>Prima dell'attivazione dovranno essere completate e convalidate le informazioni specifiche sulla base giuridica, i destinatari dei dati, eventuali trasferimenti e i diritti degli interessati.</p></section>
 <section class="info-section"><h2>Candidature e servizi esterni</h2><p>Per le candidature a progetti e attività possono essere utilizzati moduli Google Forms o altre piattaforme. Le informazioni specifiche sul singolo trattamento, sulle relative finalità, basi giuridiche, destinatari, tempi di conservazione e strumenti utilizzati devono essere rese disponibili nel modulo o nella comunicazione dedicata.</p><p>I collegamenti a piattaforme esterne rimandano alle loro rispettive informative.</p></section>
 <section class="info-section"><h2>I tuoi diritti</h2><p>Puoi richiedere, nei casi previsti, accesso ai dati, rettifica, cancellazione, limitazione del trattamento, opposizione e gli ulteriori diritti riconosciuti dalla normativa applicabile, scrivendo al contatto indicato. Puoi anche rivolgerti al <a href="https://www.garanteprivacy.it/" target="_blank" rel="noopener noreferrer">Garante per la protezione dei dati personali</a>.</p>
 <p class="info-note">Questa pagina riassume i canali di contatto e le principali situazioni. Le informazioni specifiche dei singoli trattamenti vanno verificate e completate dall'associazione prima della raccolta di dati tramite nuovi moduli o servizi.</p></section>`);
 pages["accessibilita/index.html"]=p("/accessibilita/","Accessibilità e preferenze di lettura",
 "Strumenti di lettura, navigazione da tastiera e contatti per segnalare ostacoli di accessibilità sul sito istituzionale di Agorà APS.","Accessibilità digitale",`
 <section class="info-section"><h2>Un sito per tutte le persone</h2><p>Progettiamo i contenuti per renderli consultabili anche da smartphone, con tastiera e con tecnologie assistive. Il sito è in miglioramento continuo: non dichiariamo una conformità certificata senza una verifica indipendente.</p></section>
 <section class="info-section"><h2>Preferenze di lettura</h2><p>Usa i pulsanti qui sotto per ingrandire i testi o attivare un contrasto cromatico più netto. Le preferenze vengono conservate solo sul tuo dispositivo quando il browser lo consente.</p>
 <div class="accessibility-tools" aria-label="Preferenze di lettura"><button type="button" data-a11y="text" aria-pressed="false">A+ Testo</button><button type="button" data-a11y="contrast" aria-pressed="false">Contrasto</button></div>
 <p>Il libro interattivo nella <a href="/">homepage</a> offre inoltre il comando per fermare le animazioni e rispetta, quando disponibile, la preferenza del dispositivo per il movimento ridotto.</p></section>
 <section class="info-section"><h2>Navigare da tastiera</h2><ul class="info-list"><li><strong>Tab</strong> e <strong>Maiusc + Tab</strong> spostano il focus tra collegamenti e comandi.</li><li><strong>Invio</strong> o <strong>Spazio</strong> attivano pulsanti e dettagli, secondo il comportamento nativo del browser.</li><li>Il collegamento <strong>Salta al contenuto</strong> è disponibile come primo elemento della pagina.</li><li>Puoi usare lo zoom del browser senza modificare le tue preferenze personali.</li></ul></section>
 <section class="info-section"><h2>Segnala una difficoltà</h2><p>Se incontri un ostacolo nella lettura, nella navigazione o nell'accesso a un documento, scrivici indicando pagina, dispositivo e problema riscontrato. Valuteremo la segnalazione e una modalità alternativa per ottenere l'informazione.</p>
 <a class="info-btn" href="${mailto("Segnalazione accessibilità sito Agorà")}">Segnala una difficoltà</a></section>`);
 return pages;
};
const pages=buildPages(D);
for(const [path,html] of Object.entries(pages)){mkdirSync(dirname(path),{recursive:true});writeFileSync(path,html);}
const site='https://agora-scuoladidialogosocraticoecittadinanzattiva.site';
const urls=['/',...Object.keys(pages).map(path=>'/'+path.replace(/index\\.html$/,'').replace(/index\.html$/,''))];
const xml='<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n'+urls.map(path=>'  <url><loc>'+site+path+'</loc><lastmod>2026-11-11</lastmod></url>').join('\\n')+'\\n</urlset>\\n';
writeFileSync('sitemap.xml',xml.replace(/\\n/g,'\n'));
console.log('Agorà: generate '+Object.keys(pages).length+' pagine autonome e sitemap.');
