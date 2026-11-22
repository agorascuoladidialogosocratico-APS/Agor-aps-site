import {readFileSync,existsSync} from 'node:fs';
const read = file => readFileSync(file,'utf8');
const data = JSON.parse(read('content/governance.json'));
const persons = [...(data.members||[]),...(data.collaborators||[]),...(data.founders||[])].filter(p=>p.published===true);
const root = read('chi-siamo/index.html');
const errors=[];
const check=(ok,message)=>{if(!ok)errors.push(message);};
check(root.includes('Le persone che danno vita ad Agorà'),'Pagina indice persone non generata');
check(root.includes('id="direttivo"'),'Sezione Direttivo mancante');
check(root.includes('class="people-grid governance-grid"'),'Griglia Direttivo assente');
check(root.includes('href="/assets/people.css'),'Stili personali non caricati');
for (const p of persons) {
 const url='/chi-siamo/'+p.slug+'/';
 const file='chi-siamo/'+p.slug+'/index.html';
 check(existsSync(file),'Scheda personale mancante: '+file);
 check(root.includes('href="'+url+'"'),'Link alla scheda mancante: '+p.slug);
 check(read('sitemap.xml').includes('<loc>https://agora-scuoladidialogosocraticoecittadinanzattiva.site'+url+'</loc>'),'Sitemap priva di '+url);
 if(!existsSync(file))continue;
 const html=read(file);
 check(html.includes('<h1>'+p.name+'</h1>'),'Titolo persona errato: '+p.slug);
 check(html.includes('"@type":"Person"'),'Dati strutturati Person assenti: '+p.slug);
 check((html.match(/<h1\b/g)||[]).length===1,'Più di un H1: '+p.slug);
 check(!html.includes('src=""'),'Immagine vuota: '+p.slug);
 check(html.includes('href="/chi-siamo/"'),'Link di ritorno assente: '+p.slug);
 if(!p.photoApproved) check(html.includes('person-monogram'),'Foto non approvata o placeholder errato: '+p.slug);
 if(p.photoApproved){
   check(typeof p.photo==='string' && p.photo.startsWith('/assets/people/') && existsSync('.'+p.photo),'Foto pubblica assente: '+p.slug);
   check(html.includes('src="'+p.photo+'"'),'Foto non collegata al profilo: '+p.slug);
 }
 if(p.bio) check(html.includes('Il percorso') && html.includes(p.bio.split(/\n\s*\n/)[0].slice(0,30)),'Biografia non generata: '+p.slug);
 if(p.cvApproved){
   check(typeof p.cvFile==='string' && /^\/assets\/cv\/[a-z0-9][a-z0-9_.-]*\.pdf$/i.test(p.cvFile),'Percorso PDF invalido: '+p.slug);
   check(existsSync('.'+p.cvFile),'CV mancante sul filesystem: '+p.slug);
   if(existsSync('.'+p.cvFile)) check(readFileSync('.'+p.cvFile).subarray(0,5).toString('ascii')==='%PDF-','CV non in formato PDF: '+p.slug);
   check(html.includes('href="'+p.cvFile+'"'),'Link CV non presente nel profilo: '+p.slug);
   check(html.includes('class="person-cv-footer"'),'CV non collocato discretamente a fondo pagina: '+p.slug);
 } else check(!html.includes('person-cv-footer'),'Collegamento CV non autorizzato: '+p.slug);
}
check(persons.length===7,'Il sito deve contenere sette schede personali');
check(!root.includes('Federica Stefania Catalano'),'Il profilo escluso non deve apparire');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log('Schede Agorà verificate:',persons.length);
