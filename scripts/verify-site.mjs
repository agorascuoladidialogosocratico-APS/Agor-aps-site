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

if (errors.length) {
  console.error('Verifica Agorà APS: ' + errors.length + ' problema/i:\n- ' + errors.join('\n- '));
  process.exitCode = 1;
} else {
  console.log('Verifica Agorà APS superata: ' + files.length + ' file editoriali, ' + assetRefs.size + ' risorse, ' + ids.size + ' ancore HTML.');
}
