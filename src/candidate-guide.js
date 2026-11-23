import {candidateDestinations} from './candidate-destinations.js';

const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const b64url=value=>{const normalized=value.replace(/-/g,'+').replace(/_/g,'/');const binary=atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,'='));return Uint8Array.from(binary,char=>char.charCodeAt(0))};
const decodePart=value=>JSON.parse(new TextDecoder().decode(b64url(value)));
const secureHeaders={
  'Content-Type':'text/html; charset=utf-8',
  'Cache-Control':'private, no-store, max-age=0',
  'X-Robots-Tag':'noindex, nofollow, noarchive, nosnippet, noimageindex',
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':"default-src 'none'; style-src 'self'; script-src 'self'; font-src 'self'; img-src 'self'; connect-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
};

const validTeamDomain=raw=>{
  try{const url=new URL(raw);return url.protocol==='https:'&&/^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(url.hostname)&&url.pathname==='/'&&!url.search&&!url.hash?url.origin:null}catch{return null}
};

async function authorize(request,env){
  const issuer=validTeamDomain(env.CF_ACCESS_TEAM_DOMAIN||'');
  const audience=String(env.CANDIDATE_ACCESS_AUD||'').trim();
  const allowed=new Set(String(env.CANDIDATE_ALLOWED_EMAILS||'').split(/[;,\s]+/).map(value=>value.toLowerCase().trim()).filter(Boolean));
  if(!issuer||!audience||allowed.size===0)return {status:503,message:'La protezione privata non è ancora configurata. Nessun contenuto personale è stato pubblicato.'};
  const token=request.headers.get('Cf-Access-Jwt-Assertion');
  if(!token)return {status:401,message:'Accedi con l’indirizzo email autorizzato per aprire questa guida.'};
  const parts=token.split('.');
  if(parts.length!==3)return {status:403,message:'Credenziali non valide.'};
  try{
    const jose=decodePart(parts[0]);const claim=decodePart(parts[1]);
    const now=Math.floor(Date.now()/1000);
    const audienceOk=Array.isArray(claim.aud)?claim.aud.includes(audience):claim.aud===audience;
    const email=String(claim.email||'').toLowerCase().trim();
    if(jose.alg!=='RS256'||!jose.kid||claim.iss!==issuer||!audienceOk||!Number.isFinite(claim.exp)||claim.exp<=now||(claim.nbf!==undefined&&claim.nbf>now+30)||!allowed.has(email))throw Error('denied');
    const certs=await fetch(issuer+'/cdn-cgi/access/certs',{headers:{Accept:'application/json'}});
    if(!certs.ok)throw Error('certificates');
    const keys=await certs.json();
    const jwk=Array.isArray(keys.keys)?keys.keys.find(key=>key.kid===jose.kid&&key.kty==='RSA'&&key.n&&key.e):null;
    if(!jwk)throw Error('key');
    const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
    const valid=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,b64url(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
    if(!valid)throw Error('signature');
    return {status:200,email};
  }catch{return {status:403,message:'Accesso non autorizzato. Usa l’indirizzo email indicato per questa guida.'}}
}

function parseProfile(env){
  try{
    const profile=JSON.parse(String(env.CANDIDATE_PROFILE||''));
    if(!profile||typeof profile!=='object'||!String(profile.displayName||'').trim()||!String(profile.email||'').includes('@'))return null;
    return {
      displayName:String(profile.displayName).trim().slice(0,100),
      email:String(profile.email).trim().slice(0,254),
      phone:String(profile.phone||'').trim().slice(0,40),
      summary:String(profile.summary||'').trim().slice(0,1800)
    };
  }catch{return null}
}

const typeLabels={active_job:'Posizione attiva',company_careers:'Portale aziendale',recruiter_portal:'Agenzia per il lavoro',public_portal:'Servizio pubblico',spontaneous:'Candidatura spontanea'};
const stepText=destination=>{
  if(destination.publicEmail)return ['Premi “Prepara email”.','Controlla che il CV sia allegato.','Premi Invia nella tua app di posta.','Torna qui e segna come inviata.'];
  if(destination.category==='active_job')return ['Premi “Apri la candidatura”.','Cerca il pulsante Apply o Candidati.','Compila i campi e allega il CV.','Invia soltanto dopo il controllo finale.','Torna qui e segna come inviata.'];
  if(destination.category==='public_portal')return ['Apri il servizio ufficiale.','Accedi o registrati se richiesto.','Segui le istruzioni del portale.','Segna come completato solo dopo la conferma.'];
  return ['Premi “Apri il portale”.','Cerca il ruolo indicato in questa scheda.','Apri un annuncio adatto e controlla luogo e contratto.','Compila il modulo e allega il CV.','Torna qui e segna come inviata.'];
};

function mailto(destination,profile){
  if(!destination.publicEmail)return '';
  const subject=`Candidatura ${destination.targetRole||'commerciale / logistica'} - ${profile.displayName}`;
  const body=[`Buongiorno,`,``,`mi chiamo ${profile.displayName} e desidero candidarmi per opportunità coerenti con il mio profilo presso ${destination.name}.`,``,profile.summary,``,`Allego il mio curriculum vitae. Resto disponibile per un colloquio.`,``,`Cordiali saluti,`,profile.displayName,profile.phone,profile.email].filter(Boolean).join('\n');
  return `mailto:${encodeURIComponent(destination.publicEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function card(destination,index,profile){
  const steps=stepText(destination).map((step,number)=>`<li><span>${number+1}</span><p>${escapeHtml(step)}</p></li>`).join('');
  const email=mailto(destination,profile);
  const actionLabel=email?'Prepara email':destination.category==='active_job'?'Apri la candidatura':'Apri il portale';
  const actionUrl=email||destination.url;
  return `<article class="guide-page" id="${escapeHtml(destination.slug)}" data-card data-id="${escapeHtml(destination.slug)}" data-index="${index}" hidden>
    <header class="card-heading"><p class="eyebrow">Scheda ${index+1} di ${candidateDestinations.length} · ${escapeHtml(typeLabels[destination.category]||destination.category)}</p><h2>${escapeHtml(destination.name)}</h2><p class="target">Cerca: <strong>${escapeHtml(destination.targetRole)}</strong></p></header>
    <div class="card-grid"><section><h3>Perché provarci</h3><p>${escapeHtml(destination.why)}</p><dl><div><dt>Zona</dt><dd>${escapeHtml(destination.location)}</dd></div><div><dt>Come funziona</dt><dd>${escapeHtml(destination.method)}</dd></div></dl></section>
    <section class="steps"><h3>Fai una cosa alla volta</h3><ol>${steps}</ol></section></div>
    <div class="actions"><a class="primary" href="${escapeHtml(actionUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(actionLabel)} <span aria-hidden="true">↗</span></a><button class="sent" type="button" data-sent aria-pressed="false">Segna come inviata</button></div>
    <details class="evidence"><summary>Controllo e fonte</summary><p>${escapeHtml(destination.evidence)}</p><p><a href="${escapeHtml(destination.evidenceUrl)}" target="_blank" rel="noopener noreferrer">Apri la fonte ufficiale ↗</a></p><p>Verificato il ${escapeHtml(destination.checkedAt)}. ${destination.publicEmail?`Email pubblica verificata: ${escapeHtml(destination.publicEmail)}.`:'Questa destinazione richiede un modulo o un account: non è stata inventata alcuna email.'}</p></details>
  </article>`;
}

export function candidateGuidePage(profile){
  const cards=candidateDestinations.map((destination,index)=>card(destination,index,profile)).join('');
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex"><title>La guida semplice alle candidature · Agorà APS</title><link rel="stylesheet" href="/assets/candidate-guide.css"></head><body>
  <a class="skip" href="#libro">Vai alla guida</a><header class="top"><div><p>AGORÀ APS · AREA RISERVATA</p><strong>La guida semplice alle candidature</strong></div><button type="button" data-language aria-pressed="false">Español: no</button></header>
  <main id="libro" class="book"><section class="cover" data-cover>
    <p class="eyebrow">Guida personale riservata</p><h1>Un passo alla volta, ${escapeHtml(profile.displayName)}.</h1><p class="lead">Qui trovi ${candidateDestinations.length} destinazioni controllate. Il sito non invia nulla al posto tuo: sei sempre tu a premere il pulsante finale.</p>
    <div class="tutorial"><h2>Prima di iniziare</h2><ol><li><span>1</span><p><strong>Prepara il CV.</strong> Tienilo sul telefono o sul computer.</p></li><li><span>2</span><p><strong>Apri una sola scheda.</strong> Segui i passaggi nell’ordine.</p></li><li><span>3</span><p><strong>Segna “inviata” solo alla fine.</strong> Il segno resta su questo dispositivo.</p></li></ol><p class="spanish" lang="es" hidden><strong>En español:</strong> abre una ficha, sigue un paso cada vez y marca “enviada” solamente después de recibir la confirmación.</p></div>
    <button class="primary" type="button" data-start>Inizia dalla prima candidatura →</button><p class="credits">Scritto e redatto dal Dott. Gioele Pio Fragale, consulente filosofico, su mandato di Yrene Ceccarelli</p>
  </section><section class="reader" data-reader hidden><nav class="reader-nav" aria-label="Navigazione del libro"><button type="button" data-prev>← Indietro</button><p><span data-position>1</span> / ${candidateDestinations.length}</p><button type="button" data-next>Avanti →</button></nav><div class="progress" aria-label="Progresso candidature"><div data-progress></div></div>${cards}<nav class="reader-nav bottom" aria-label="Navigazione del libro"><button type="button" data-home>Copertina</button><button type="button" data-next-bottom>Pagina successiva →</button></nav></section></main>
  <footer><p>Stato salvato soltanto su questo dispositivo. Nessuna candidatura viene inviata automaticamente.</p><p><a href="/privacy/">Privacy</a> · <a href="/">Sito pubblico Agorà APS</a></p></footer><script src="/assets/candidate-guide.js" defer></script></body></html>`;
}

function errorPage(status,message){
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Area riservata · Agorà APS</title><link rel="stylesheet" href="/assets/candidate-guide.css"></head><body><main class="error"><p class="eyebrow">AGORÀ APS · AREA RISERVATA</p><h1>${status===503?'Area non ancora attivata':'Accesso riservato'}</h1><p>${escapeHtml(message)}</p><p><a class="primary" href="/">Torna al sito pubblico</a></p></main></body></html>`;
}

export async function handleCandidateGuide(request,env){
  if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:secureHeaders});
  const auth=await authorize(request,env);
  if(auth.status!==200){const body=errorPage(auth.status,auth.message);return new Response(request.method==='HEAD'?null:body,{status:auth.status,headers:secureHeaders})}
  const profile=parseProfile(env);
  if(!profile||candidateDestinations.length<70){const body=errorPage(503,'La guida è in preparazione e resta bloccata finché profilo e destinazioni non sono completi.');return new Response(request.method==='HEAD'?null:body,{status:503,headers:secureHeaders})}
  const body=candidateGuidePage(profile);return new Response(request.method==='HEAD'?null:body,{status:200,headers:secureHeaders});
}
