import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = path => readFileSync(join(root, path), 'utf8');
const files = ['identity', 'home', 'projects', 'method', 'association', 'transparency', 'contact', 'layout', 'blocks', 'opportunities', 'governance', 'whatsapp', 'membership'];
const html = read('index.html');
const errors = [];
const assert = (condition, description) => { if (!condition) errors.push(description); };

assert(/<html\s+lang="it"/i.test(html), 'Homepage: lingua italiana mancante');
assert(/<title>[^<]+<\/title>/i.test(html), 'Homepage: titolo mancante');
assert(/name="description"/i.test(html), 'Homepage: meta description mancante');
assert(/<main\b/i.test(html), 'Homepage: elemento main mancante');
assert(existsSync(join(root, '404.html')), 'Pagina 404 assente');
assert(existsSync(join(root, 'robots.txt')), 'robots.txt assente');
assert(existsSync(join(root, 'sitemap.xml')), 'sitemap.xml assente');
assert(existsSync(join(root, '_headers')), 'File Cloudflare _headers assente');

const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  assert(ids.has(match[1]), 'Collegamento interno senza destinazione: #' + match[1]);
}

const assetRefs = new Set([...html.matchAll(/(?:src|href)="\/?(assets\/[^"?#]+)"/g)].map(match => match[1]));
for (const name of files) {
  const path = 'content/' + name + '.json';
  assert(existsSync(join(root, path)), 'Contenuto assente: ' + path);
  if (!existsSync(join(root, path))) continue;
  let data;
  try { data = JSON.parse(read(path)); }
  catch (error) { errors.push('JSON non valido in ' + path + ': ' + error.message); continue; }
  const visit = value => {
    if (typeof value === 'string' && /^\/?assets\/[^?#]+$/.test(value)) assetRefs.add(value.replace(/^\//, ''));
    else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') Object.values(value).forEach(visit);
  };
  visit(data);
}
for (const path of assetRefs) {
  assert(existsSync(join(root, path)), 'Risorsa grafica assente: ' + path);
}
const ignore = read('.assetsignore');
assert(!/^_headers\s*$/m.test(ignore), '_headers non deve essere escluso dal deploy Worker');
assert(read('wrangler.jsonc').includes('"not_found_handling": "404-page"'), 'Configurazione Worker: gestione pagina 404 mancante');


const publicPaths = [
  '/','/chi-siamo/','/progetti/','/progetti/soda-labs/',
  '/progetti/odisseo-philosophorum/','/tirocini/','/volontariato-esc/',
  '/partecipa/','/contatti/','/trasparenza/','/privacy/','/accessibilita/'
];
const siteOrigin = 'https://agora-scuoladidialogosocraticoecittadinanzattiva.site';
const sitemap = read('sitemap.xml');
assert(!/MarLuna/i.test(html), 'Homepage contiene ancora riferimenti a MarLuna');
assert(!/Statuto e Atto costitutivo/i.test(html), 'Homepage contiene ancora duplicazione atti');
assert((html.match(/<h1\b/g)||[]).length===1, 'Homepage: H1 non unico');
assert(html.includes('href="/accessibilita/"'), 'Homepage senza link accessibilità');
assert(html.includes('data-a11y="contrast"'), 'Manca controllo per contrasto elevato');
assert(html.includes('data-a11y="text"'), 'Manca controllo dimensione testo');
for (const path of ['assets/a11y.js','assets/accessibility.css','assets/sections.css']) {
  assert(existsSync(join(root,path)), 'Risorsa accessibilità mancante: ' + path);
}
for(const pathname of publicPaths){
  assert(sitemap.includes('<loc>'+siteOrigin+pathname+'</loc>'), 'Sitemap priva dell’URL: '+pathname);
  if(pathname==='/')continue;
  const file=pathname.slice(1)+'index.html';
  assert(existsSync(join(root,file)), 'Pagina SEO mancante: '+file);
  if(!existsSync(join(root,file)))continue;
  const page=read(file);
  assert((page.match(/<h1\b/g)||[]).length===1,'H1 mancante o duplicato: '+file);
  assert(page.includes('<main') && page.includes('id="contenuto"'),'Landmark main mancante: '+file);
  assert(page.includes('<html lang="it"'),'Lingua italiana mancante: '+file);
  assert(page.includes('href="'+siteOrigin+pathname+'"'),'Canonical inesatto: '+file);
  assert(page.includes('href="/accessibilita/"'),'Collegamento accessibilità assente: '+file);
  assert(!/MarLuna/i.test(page),'Contenuto rimosso ancora presente: '+file);
}

assert(existsSync(join(root,'content/governance.json')), 'Mancano ruoli direttivo editabili');
assert(existsSync(join(root,'assets/experience.css')), 'CSS dinamico non trovato');
assert(existsSync(join(root,'assets/experience.js')), 'JS dinamico non trovato');
assert(existsSync(join(root,'assets/contact-form.js')), 'Form client JS non trovato');
assert(existsSync(join(root,'src/worker.js')), 'Worker contatti non trovato');
assert(html.includes('class="pathways-grid"'), 'Navigazione percorsi homepage mancante');
assert(html.includes('class="mobile-dock"'), 'Dock mobile mancante');
const contactPage=read('contatti/index.html');
assert(contactPage.includes('id="agora-contact-form"'), 'Modulo contatti non generato');
assert(contactPage.includes('action="/api/contact"'), 'Endpoint del modulo non collegato');
assert(contactPage.includes('name="consent"'), 'Consenso del modulo assente');
assert(read('chi-siamo/index.html').includes('Gioele Pio Fragale'), 'Direttivo non aggiornato in Chi siamo');
assert(read('wrangler.jsonc').includes('"send_email"'), 'Configurazione binding invio mancante');


const contactData=JSON.parse(read('content/contact.json'));
assert(contactData.phone==='+39 333 883 9329','Numero per le chiamate italiano non corrisponde');
assert(contactData.whatsappNumber==='+32 466 90 21 27','Recapito WhatsApp Business visualizzato errato');
assert(html.includes('href="tel:+393338839329"'),'Homepage: vecchio numero telefono o link tel errato');
assert(html.includes('https://wa.me/32466902127'),'Homepage: collegamento WhatsApp Business ufficiale mancante');
assert(contactPage.includes('href="tel:+393338839329"'),'Contatti: numero per chiamate assente');
assert(contactPage.includes('https://wa.me/32466902127'),'Contatti: collegamento WhatsApp Business ufficiale mancante');
assert(!html.includes('tel:+393510887084'),'Homepage: vecchio numero chiamate ancora presente');
const whatsapp=JSON.parse(read('content/whatsapp.json'));
assert(whatsapp.enabled===true && whatsapp.phoneNumber==='32466902127','Widget WhatsApp Business ufficiale non attivo');
assert(whatsapp.enabled !== true || /^[1-9]\d{7,14}$/.test(String(whatsapp.phoneNumber||'')),'Numero WhatsApp non valido: solo cifre internazionali, senza prefissi inventati');
for(const file of ['assets/visual-story.css','assets/site-chat.css','assets/site-chat.js','src/site-chat.js','migrations/0001_site_chat.sql']){
  assert(existsSync(join(root,file)),'Nuova risorsa grafica/chat mancante: '+file);
}
assert(html.includes('class="home-photo-story"'),'Homepage: galleria foto originale non presente');
assert(html.includes('src="/assets/agora_dialogo.webp"'),'Homepage: foto del dialogo mancante');
assert(html.includes('src="/assets/agora_viaggio.webp"'),'Homepage: foto del viaggio mancante');
assert(html.includes('src="/assets/agora_gruppo_home.webp"'),'Homepage: foto di gruppo mancante');
assert(html.includes('/assets/whatsapp-chat.js'),'Homepage: widget WhatsApp Business assente');
assert(!html.includes('/assets/site-chat.js'),'Homepage: vecchio widget della chat inattiva ancora caricato');
assert(html.includes('class="home-magazine-teaser"'),'Homepage senza anteprima Agorà Magazine');
assert(html.includes('href="/magazine/"'),'Homepage: Magazine non navigabile');
assert(html.includes('href="/sostienici/"'),'Homepage: Sostienici non navigabile');
const originalImages=['agora_gruppo_home','agora_dialogo','agora_chi_siamo','agora_viaggio'];
for(const image of originalImages){
 for(const suffix of ['.webp','-480.webp','-800.webp']){
  assert(existsSync(join(root,'assets/'+image+suffix)),'Fotografia originale mancante: '+image+suffix);
 }
}
for(const pathname of publicPaths){
 if(pathname==='/')continue;
 const page=read(pathname.slice(1)+'index.html');
 assert(page.includes('class="info-hero visual-cover'),'Copertina fotografica mancante: '+pathname);
 assert(page.includes('class="visual-cover-photo"'),'Fotografia di apertura mancante: '+pathname);
 assert(page.includes('alt="'),'Testo alternativo della foto mancante: '+pathname);
 assert(page.includes('/assets/visual-story.css'),'Stile visivo assente: '+pathname);
 assert(page.includes('/assets/whatsapp-chat.js'),'Widget WhatsApp assente: '+pathname);
 assert(!page.includes('/assets/site-chat.js'),'Vecchio widget chat inattivo ancora caricato: '+pathname);
}

assert(existsSync(join(root,'operatore/index.html')),'Posta operatore non creata');
assert(existsSync(join(root,'assets/operator-chat.js')),'JS posta operatore assente');
assert(existsSync(join(root,'assets/operator-chat.css')),'CSS posta operatore assente');
assert(read('operatore/index.html').includes('noindex,nofollow'),'Pagina operatore indicizzabile per errore');
assert(!sitemap.includes('/operatore/'),'Pagina operatore non deve apparire nella sitemap');
assert(read('src/site-chat.js').includes("isFreeDashboard"),'Manca modalità chat gratuita');
const wrangler=JSON.parse(read('wrangler.jsonc'));
assert(wrangler.vars?.CHAT_MODE==='free-dashboard','Modalità gratuita non selezionata');
assert(wrangler.vars?.CHAT_ENABLED==='false','Chat non deve risultare attiva senza database e protezioni');

assert(existsSync(join(root,'src/chat-email.js')),'Gateway di risposta email non presente');
assert(existsSync(join(root,'scripts/test-email-replies.mjs')),'Test Gmail ↔ chat assente');
const cfgEmail=JSON.parse(read('wrangler.jsonc'));
assert(cfgEmail.vars?.CHAT_EMAIL_REPLY_ENABLED==='false','Risposte Gmail non devono risultare attive senza Email Routing');
assert(cfgEmail.vars?.CHAT_EMAIL_NOTIFICATIONS==='true','Le notifiche Gmail devono essere predisposte');
assert(read('src/worker.js').includes('async email(message,env,ctx)'), 'Manca handler email Cloudflare');
assert(read('src/chat-email.js').includes('authentication-results'),'Controllo DMARC Email Routing assente');
assert(read('src/chat-email.js').includes('hmacReplyToken'),'Firma della conversazione email assente');


const editorial=JSON.parse(read('content/membership.json'));
const magFiles=readdirSync(join(root,'content/magazine')).filter(x=>x.endsWith('.json'));
const magIndex=read('magazine/index.html');
assert(existsSync(join(root,'assets/magazine.css')),'Magazine: foglio di stile assente');
assert(existsSync(join(root,'assets/magazine.js')),'Magazine: interazioni mancanti');
assert(existsSync(join(root,'assets/site-polish.css')),'Homepage: rifinitura responsive assente');
assert(html.includes('/assets/site-polish.css'),'Homepage: rifinitura CSS non caricata');
assert(magIndex.includes('<h1>Le domande'),'Magazine: intestazione non generata');
assert(magIndex.includes('/assets/agora_gruppo_home.webp'),'Magazine: fotografia originale mancante');
assert(sitemap.includes('<loc>'+siteOrigin+'/magazine/</loc>'),'Magazine: URL mancante dalla sitemap');
assert(sitemap.includes('<loc>'+siteOrigin+'/sostienici/</loc>'),'Sostienici: URL mancante dalla sitemap');
assert(existsSync(join(root,'magazine/rss.xml')),'Magazine: RSS non generato');
assert(read('magazine/rss.xml').includes('<rss version="2.0">'),'Magazine: feed RSS non valido');
const membershipPage=read('sostienici/index.html');
assert(membershipPage.includes('id="bonifico"'),'Sostienici: sezione bonifico assente');
assert(membershipPage.includes('href="/assets/magazine.css')||membershipPage.includes('href="/assets/magazine.css?v='),'Sostienici: stile editoriale non caricato');
if(!editorial.bankDetailsPublic)assert(!membershipPage.includes('data-copy-iban'),'Sostienici: IBAN pubblicato senza autorizzazione');
if(editorial.bankDetailsPublic){
 const normalized=String(editorial.iban||'').replace(/\s/g,'').toUpperCase();
 assert(membershipPage.includes('data-copy-iban="'+normalized+'"'),'Sostienici: IBAN autorizzato non inserito o errato');
 assert(membershipPage.includes(editorial.accountHolder),'Sostienici: intestatario non presente');
 if(editorial.bic) assert(membershipPage.includes(editorial.bic),'Sostienici: BIC non presente');
 if(editorial.bankName) assert(membershipPage.includes(editorial.bankName),'Sostienici: istituto non presente');
}

for(const file of magFiles){
 const slug=file.replace(/\.json$/,'');
 const data=JSON.parse(read('content/magazine/'+file));
 if(data.published!==true){
   assert(!sitemap.includes('<loc>'+siteOrigin+'/magazine/'+slug+'/</loc>'),'Bozza indicizzata: '+slug);
   continue;
 }
 const path='magazine/'+slug+'/index.html';
 assert(existsSync(join(root,path)),'Articolo Magazine non generato: '+slug);
 if(existsSync(join(root,path))){
  const article=read(path);
  assert(article.includes('<h1>'),'Magazine: titolo articolo assente '+slug);
  assert(article.includes('BlogPosting'),'Magazine: dati strutturati assenti '+slug);
  assert(article.includes('href="'+siteOrigin+'/magazine/'+slug+'/'),'Magazine: canonical errato '+slug);
  assert(sitemap.includes('<loc>'+siteOrigin+'/magazine/'+slug+'/</loc>'),'Magazine: articolo assente nella sitemap '+slug);
 }
}
assert(read('.pages.yml').includes('name: magazine'),'Editor: raccolta Agorà Magazine mancante');
assert(read('.pages.yml').includes('name: membership'),'Editor: bonifici non modificabili');

assert(existsSync(join(root,'scripts/social-buffer.mjs')),'Integrazione social Buffer mancante');
assert(existsSync(join(root,'scripts/test-social-buffer.mjs')),'Test social Buffer mancante');
assert(existsSync(join(root,'.github/workflows/social-buffer.yml')),'Azione GitHub per Buffer non presente');
assert(existsSync(join(root,'data/buffer-posts.json')),'Registro di idempotenza Buffer assente');
assert(read('.pages.yml').includes('name: send-to-buffer'),'Pulsante Pages CMS social non presente');
assert(JSON.parse(read('data/buffer-posts.json')).posts!==undefined,'Registro Buffer malformato');

assert(existsSync(join(root,'editor/manifest.webmanifest')),'Agorà Studio: manifesto app mancante');
assert(existsSync(join(root,'editor/studio.js')),'Agorà Studio: logica app mancante');
assert(existsSync(join(root,'editor/studio.css')),'Agorà Studio: stile app mancante');
assert(existsSync(join(root,'editor/sw.js')),'Agorà Studio: servizio offline mancante');
const editorApp=read('editor/index.html');
assert(editorApp.includes('rel="manifest"'),'Agorà Studio: collegamento manifesto assente');
assert(editorApp.includes('https://app.pagescms.org/'),'Agorà Studio: editor contenuti non raggiungibile');
assert(editorApp.includes('https://publish.buffer.com/'),'Agorà Studio: pannello social non raggiungibile');
assert(editorApp.includes('id="install-button"'),'Agorà Studio: controllo installazione assente');
const manifest=JSON.parse(read('editor/manifest.webmanifest'));
assert(manifest.start_url==='/editor/' && manifest.display==='standalone','Agorà Studio: app non installabile');
assert(read('.pages.yml').includes('value: now'),"Agorà Magazine: pubblicazione diretta non disponibile nell'editor");

if (errors.length) {
  console.error('Verifica Agorà APS: ' + errors.length + ' problema/i:\n- ' + errors.join('\n- '));
  process.exitCode = 1;
} else {
  console.log('Verifica Agorà APS superata: ' + files.length + ' file editoriali, ' + assetRefs.size + ' risorse, ' + ids.size + ' ancore HTML.');
}
