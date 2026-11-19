/* Agorà APS — ingresso privato, fail-closed.
   Necessita di Cloudflare Access e allowlist soci configurata SOLO come secret.
   Non depositare anagrafiche, password, risultati e attestati nel repository pubblico. */
const htmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const headers={
 'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store, max-age=0',
 'X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; frame-src https://drive.google.com; frame-ancestors 'none'; form-action 'none'"
};
const b64url=value=>{const s=value.replace(/-/g,'+').replace(/_/g,'/');const bin=atob(s.padEnd(Math.ceil(s.length/4)*4,'='));return Uint8Array.from(bin,c=>c.charCodeAt(0))};
const decodePart=value=>JSON.parse(new TextDecoder().decode(b64url(value)));
const page=(title,body,status=200)=>new Response('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+htmlEscape(title)+' · Agorà APS</title><meta name="robots" content="noindex,nofollow"><style>:root{font-family:system-ui,sans-serif;background:#fbf5e9;color:#302b25;line-height:1.6}body{margin:0}.shell{width:min(860px,calc(100% - 36px));margin:8vh auto}header{border-bottom:2px solid #b85628;padding-bottom:14px;font-weight:750;letter-spacing:.16em}h1{font:normal clamp(2.3rem,6vw,4rem)/1.05 Georgia,serif;margin:1.1em 0 .3em}p{max-width:700px}a{color:#963a18}article{background:#fffdf8;border:1px solid #e1d3bd;padding:28px;margin:24px 0;border-radius:10px}ul{padding-left:22px}li{padding:7px 0}.small{font-size:.85rem;color:#736b61}.cta{display:inline-block;padding:12px 19px;background:#b85628;color:white;text-decoration:none;font-weight:700}a:focus-visible{outline:3px solid #b85628;outline-offset:4px}</style></head><body><main class="shell"><header>AGORÀ APS · ACCADEMIA DEL DIALOGO</header>'+body+'<p class="small"><a href="/formazione/">Formazione</a> · <a href="/">Sito pubblico</a> · <a href="/privacy/">Privacy</a></p></main></body></html>',{status,headers});
const error=(status,message)=>page(status===503?'Area in attivazione':'Accesso riservato','<h1>'+htmlEscape(status===503?'Area in attivazione':'Accesso riservato')+'</h1><p>'+htmlEscape(message)+'</p><p>Per informazioni sullo stato dell’iscrizione, contatta la segreteria di Agorà APS.</p>',status);
const validHost=raw=>{
 try{const u=new URL(raw);return u.protocol==='https:' && /^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(u.hostname) && !u.username && !u.password && u.pathname==='/' && !u.search && !u.hash ? u.origin : null}catch{return null}
};
async function authorized(request,env){
 const issuer=validHost(env.CF_ACCESS_TEAM_DOMAIN||'');
 const aud=String(env.CF_ACCESS_AUD||'').trim();
 const emails=new Set(String(env.AGORA_MEMBER_EMAILS||'').split(/[;,\s]+/).map(s=>s.toLowerCase().trim()).filter(Boolean));
 if(!issuer||!aud||emails.size===0)return {status:503,message:'L’autenticazione dei soci non è ancora abilitata.'};
 const token=request.headers.get('Cf-Access-Jwt-Assertion');
 if(!token)return {status:401,message:'È necessario effettuare l’accesso individuale tramite Cloudflare Access.'};
 const parts=token.split('.');
 if(parts.length!==3)return {status:403,message:'Credenziali non valide.'};
 try{
  const jose=decodePart(parts[0]);const claim=decodePart(parts[1]);
  if(jose.alg!=='RS256'||typeof jose.kid!=='string'||!jose.kid||!claim||typeof claim!=='object')throw Error('claims');
  const now=Math.floor(Date.now()/1000);
  const validAudience=Array.isArray(claim.aud)?claim.aud.includes(aud):claim.aud===aud;
  const email=String(claim.email||'').toLowerCase().trim();
  if(claim.iss!==issuer||!validAudience||!Number.isFinite(claim.exp)||claim.exp<=now|| (claim.nbf!==undefined&&claim.nbf>now+30)||!email||!emails.has(email))throw Error('claim denied');
  const res=await fetch(issuer+'/cdn-cgi/access/certs',{headers:{'Accept':'application/json'}});
  if(!res.ok)throw Error('jwks unavailable');
  const jwks=await res.json();
  const jwk=Array.isArray(jwks.keys)?jwks.keys.find(k=>k.kid===jose.kid&&k.kty==='RSA'&&k.n&&k.e):null;
  if(!jwk)throw Error('kid');
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const ok=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,b64url(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
  if(!ok)throw Error('signature');
  return {status:200,email};
 }catch{return {status:403,message:'Accesso non autorizzato: identità o iscrizione non verificata.'}}
}

/* La versione breve del progetto è promozionale. Il Capitolo I integrale non è stato consegnato:
   non esporre i due vecchi video brevi come lezioni riservate o completate. */
function presentePage(path){
 const base='/soci/il-libro-presente/';
 const suffix=path.slice(base.length).replace(/^\/|\/$/g,'');
 if(suffix==='capitolo-1'||suffix==='capitolo-2'){
  return '<nav aria-label="Percorso didattico"><a href="/soci/">Area soci</a> / <a href="'+base+'">Il libro presente</a></nav>'+
   '<h1>Il libro presente · capitolo integrale non ancora disponibile</h1>'+
   '<p>I video brevi precedentemente catalogati come capitoli non sono lezioni integrali. Il Capitolo I esteso è ancora in produzione e sarà pubblicato solo quando completato.</p>'+
   '<article><p>Nel frattempo puoi consultare la <a href="/formazione/il-libro-presente/">presentazione del progetto e le informazioni sull’adesione</a>.</p></article>';
 }
 if(suffix)return null;
 return '<nav aria-label="Percorso didattico"><a href="/soci/">Area soci</a> / Il libro presente</nav>'+
  '<h1>Il libro presente.</h1><p>La versione estesa del Capitolo I è in lavorazione. Non è ancora disponibile alcun video integrale in questa area.</p>'+
  '<article><h2>Capitolo I · Versione estesa</h2><p>Stato: <strong>in produzione</strong>. La disponibilità sarà comunicata quando il video sarà completato e saranno attivate le autorizzazioni individuali per i soci ammessi.</p></article>'+
  '<article><h2>Anteprima del progetto</h2><p>La versione breve già realizzata è una presentazione del progetto, non il Capitolo II.</p><a href="/formazione/il-libro-presente/">Scopri il progetto e come aderire ↗</a></article>'+
  '<p class="small">L’invio della richiesta, il bonifico e l’ammissione sono passaggi distinti. Il versamento non abilita automaticamente la visione; l’area riservata richiede autorizzazione individuale.</p>';
}

export async function handleMembersArea(request,env){
 if(request.method!=='GET'&&request.method!=='HEAD')return error(405,'Metodo non consentito.');
 const state=await authorized(request,env);
 if(state.status!==200)return error(state.status,state.message);
 const path=new URL(request.url).pathname;
 if(path==='/soci/il-libro-presente'||path.startsWith('/soci/il-libro-presente/')){
   const corso=presentePage(path==='/soci/il-libro-presente'?'/soci/il-libro-presente/':path);
   if(corso===null)return error(404,'Lezione non trovata.');
   const lesson=page('Il libro presente',corso);
   return request.method==='HEAD'?new Response(null,{status:lesson.status,headers:lesson.headers}):lesson;
 }
 const body='<h1>Il tuo spazio filosofico.</h1><p>Accesso riservato verificato. Identità associata: <strong>'+htmlEscape(state.email)+'</strong>.</p><article><h2>I miei percorsi</h2><p>Il catalogo didattico e le iscrizioni individuali saranno disponibili dopo l’approvazione dei programmi e l’attivazione del registro corsi.</p><ul><li>Videolezioni e materiale di studio</li><li>Attività e prove finali</li><li>Presenze e progressi</li></ul></article><article><h2>Il libro presente · Capitolo I esteso</h2><p>In produzione: disponibile in seguito per soci autorizzati.</p><p><a href="/soci/il-libro-presente/">Stato del percorso ↗</a></p></article><article><h2>I miei attestati</h2><p>Nessun attestato viene generato automaticamente. Il rilascio richiederà verifica della frequenza, eventuale superamento della prova finale e autorizzazione della segreteria.</p></article><a class="cta" href="/formazione/">Esplora la formazione</a>';
 const resp=page('Area soci',body);return request.method==='HEAD'?new Response(null,{status:resp.status,headers:resp.headers}):resp;
}
