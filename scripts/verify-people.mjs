import {readFileSync,existsSync} from 'node:fs';
const read = file => readFileSync(file,'utf8');
const data = JSON.parse(read('content/governance.json'));
const persons = [...(data.members||[]),...(data.collaborators||[])].filter(p=>p.published===true);
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
}
check(persons.length>=4,'Mancano i membri del Direttivo iniziale');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log('Schede Agorà verificate:',persons.length);
