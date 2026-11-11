import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = path => readFileSync(join(root, path), 'utf8');
const files = ['identity', 'home', 'projects', 'method', 'association', 'transparency', 'contact', 'layout', 'blocks', 'opportunities'];
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

if (errors.length) {
  console.error('Verifica Agorà APS: ' + errors.length + ' problema/i:\n- ' + errors.join('\n- '));
  process.exitCode = 1;
} else {
  console.log('Verifica Agorà APS superata: ' + files.length + ' file editoriali, ' + assetRefs.size + ' risorse, ' + ids.size + ' ancore HTML.');
}
