/* Libro individuale: fail-closed, senza anagrafica o CV nel repository pubblico.
   Autorizzazione tramite Cloudflare Access e allowlist AGORA_CANDIDATE_EMAILS. */
import {authorized} from './members-area.js';
import {openings} from './candidate-openings.js';

const html=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store, max-age=0','X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
const deny=(status,reason)=>new Response('<!doctype html><html lang="it"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Area riservata</title><body style="font:18px system-ui;background:#faf5ea;color:#302b25;max-width:650px;padding:3rem;margin:auto"><h1>Accesso riservato · Agorà APS</h1><p>'+html(reason)+'</p></body>',{status,headers:{...headers,'Content-Security-Policy':"default-src 'none';style-src 'unsafe-inline';frame-ancestors 'none';base-uri 'none'"}});
const styles=':root{font-family:system-ui,Arial,sans-serif;color:#302b25;background:#faf5ea;line-height:1.58}*{box-sizing:border-box}body{margin:0}a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid #92411d;outline-offset:3px}header{padding:17px max(22px,calc((100vw - 980px)/2));font-weight:800;border-bottom:1px solid #ddcdb5;letter-spacing:.1em}header span{color:#92411d;font-size:.8rem;display:block;letter-spacing:0}main{width:min(980px,calc(100% - 32px));margin:auto}h1,h2{font-family:Georgia,serif;font-weight:500;line-height:1.08}h1{font-size:clamp(2.2rem,8vw,5rem);margin:42px 0 14px}h1 em{color:#92411d}h2{font-size:clamp(1.9rem,4vw,2.7rem)}.lead{font-size:1.1rem;max-width:680px}.meta,.muted{color:#74685a;font-size:.86rem}.progress{border-block:1px solid #ddcdb5;padding:18px 0;margin:28px 0}.chapters{display:flex;gap:9px;flex-wrap:wrap;padding:16px 0}.chapters a{display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;border:1px solid #b99e81;padding:9px 12px;border-radius:8px;background:#fffdf8;text-decoration:none;color:#302b25}article{overflow-wrap:anywhere;background:#fffcf7;border:1px solid #dfd0b8;padding:clamp(16px,4vw,44px);margin:23px 0;box-shadow:8px 12px 28px #38271312;scroll-margin-top:15px}.eyebrow{text-transform:uppercase;letter-spacing:.05em;font-size:.875rem;font-weight:750;color:#92411d}.reason{max-width:720px}.steps{background:#f4e7d6;border-left:4px solid #92411d;padding:15px 20px;margin:17px 0}.steps li{padding:5px 0}.action{display:inline-block;background:#92411d;color:white;padding:14px 19px;border-radius:8px;font-weight:750;text-decoration:none;min-height:50px}.done{display:flex;gap:11px;align-items:center;margin:22px 0;font-weight:700}.done input{width:23px;height:23px;accent-color:#92411d}.note{padding:22px 0 50px;max-width:780px}textarea{display:block;font:inherit;width:100%;max-width:730px;padding:12px;border:1px solid #c0a688;border-radius:8px;background:white}.small{font-size:.875rem;color:#65594c}.details{display:grid;grid-template-columns:auto 1fr;gap:.35rem 1rem}.details dt{font-weight:700}.details dd{margin:0}.secondary{display:inline-flex;align-items:center;min-height:44px;color:#793617}.actions{display:flex;flex-wrap:wrap;gap:8px 16px}.done{min-height:44px}.skip{position:absolute;left:12px;top:12px;background:white;padding:8px}.skip:not(:focus){clip-path:inset(50%)}summary{cursor:pointer;min-height:44px;padding-block:9px}summary:focus-visible,a:focus-visible{outline:3px solid #92411d;outline-offset:3px}@media(max-width:480px){.details{display:block}.details dd{margin-bottom:.6rem}.actions>*{width:100%}.steps{padding:12px 15px}.steps ol{padding-left:20px}}footer{padding:24px;text-align:center;border-top:1px solid #dfd0b8;color:#736859;font-size:.8rem}';

const checkDate = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome'
});
const formatDate = date => checkDate.format(new Date(date));
const validEmail = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

function renderOpening(opening, index, applicant) {
  const {id, title, company, location, requirements, fit, url, deadline, checked, email, pay, contract, applicantInstruction} = opening;
  const emailAvailable = validEmail.test(email ?? '');
  const subject = `Candidatura per ${title} – ${applicant.name.replace(/[\r\n]+/g, ' ')}`;
  const body = [
    'Buongiorno,',
    `sono ${applicant.name} e mi candido per la posizione di ${title} (${location}).`,
    'Il mio curriculum',
    applicant.cv,
    `Contatti: ${applicant.email} | ${applicant.phone}`,
    `Cordiali saluti,\n${applicant.name}`
  ].join('\n\n');
  const mailLink = emailAvailable
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))}`
    : '';
  const steps = emailAvailable
    ? '<li>Premi <strong>Apri email pronta</strong>.</li><li>Controlla il destinatario, l’oggetto e il CV già nel messaggio. Allega il PDF se l’annuncio lo chiede.</li><li>Premi <strong>Invia</strong> nell’app di posta e controlla la cartella Inviati.</li>'
    : '<li>Premi <strong>Apri la candidatura</strong>.</li><li>Premi il pulsante di candidatura sul sito. Accedi o registrati se richiesto.</li><li>Carica il CV in PDF e invia il modulo. Cerca la conferma sul sito o nella posta.</li>';
  return `<article id="cap-${html(id)}" aria-labelledby="titolo-${html(id)}">
    <p class="eyebrow">Scheda ${index + 1} · ${html(company)}</p>
    <h2 id="titolo-${html(id)}">${html(title)}</h2>
    <dl class="details">
      <dt>Sede</dt><dd>${html(location)}</dd>
      <dt>Requisiti</dt><dd>${html(requirements)}</dd>
      <dt>Contratto</dt><dd>${html(contract || 'Da chiedere al selezionatore')}</dd>
      <dt>Compenso</dt><dd>${html(pay || 'Non indicato')}</dd>
      <dt>Stato al controllo</dt><dd>Candidature aperte il ${formatDate(checked)}</dd>
      <dt>Scadenza</dt><dd>${deadline ? formatDate(deadline) : 'Non indicata'}</dd>
    </dl>
    <p class="reason">${html(fit)}</p>
    <div class="steps"><strong>Come candidarti</strong><ol>${steps}</ol>
      ${applicantInstruction ? `<p>${html(applicantInstruction)}</p>` : ''}
    </div>
    <div class="actions">
      ${emailAvailable ? `<a class="action" href="${html(mailLink)}">Apri email pronta</a>` : ''}
      <a class="${emailAvailable ? 'secondary' : 'action'}" href="${html(url)}" target="_blank" rel="noopener noreferrer">${emailAvailable ? 'Leggi l’annuncio' : 'Apri la candidatura'} (nuova scheda)</a>
    </div>
    ${emailAvailable ? `<details><summary>Leggi o copia l’email pronta</summary>
      <p><strong>Destinatario</strong> ${html(email)}</p><p><strong>Oggetto</strong> ${html(subject)}</p>
      <label for="messaggio-${html(id)}">Testo da copiare</label><textarea id="messaggio-${html(id)}" readonly rows="10">${html(body)}</textarea>
    </details>` : ''}
    <label class="done"><input type="checkbox" data-task="${html(id)}"> Ho inviato la candidatura</label>
    <a class="secondary" href="#indice">Torna all’indice</a>
  </article>`;
}

const progressScript = `
  const key = 'agora:guide:progress:v2';
  const boxes = [...document.querySelectorAll('input[data-task]')];
  const count = document.getElementById('count');
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem(key)) ?? {}; } catch {}
  function update() {
    count.textContent = boxes.filter(box => box.checked).length;
  }
  for (const box of boxes) {
    const id = box.dataset.task;
    box.checked = progress[id] === true;
    box.addEventListener('change', () => {
      progress[id] = box.checked;
      try { localStorage.setItem(key, JSON.stringify(progress)); } catch {}
      update();
    });
  }
  update();
  window.addEventListener('pageshow', event => {
    if (event.persisted) location.reload();
  });
`;

function render(request, env) {
  const applicant = {
    name: String(env.AGORA_CANDIDATE_NAME || '').trim(),
    cv: String(env.AGORA_CANDIDATE_CV_TEXT || '').trim(),
    email: String(env.AGORA_CANDIDATE_CONTACT_EMAIL || '').trim(),
    phone: String(env.AGORA_CANDIDATE_CONTACT_PHONE || '').trim()
  };
  const author = String(env.AGORA_CANDIDATE_CREDIT || '').trim();
  if (!author || !applicant.name || !applicant.cv || !validEmail.test(applicant.email) || !applicant.phone) {
    return deny(503, 'Il libro è in preparazione.');
  }
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, '0')).join('');
  const responseHeaders = {
    ...headers,
    'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'`
  };
  if (request.method === 'HEAD') return new Response(null, {headers: responseHeaders});
  const cards = openings.map((opening, index) => renderOpening(opening, index, applicant)).join('');
  const index = openings.map(({id, title, location}, i) => (
    `<a href="#cap-${html(id)}" aria-label="Scheda ${i + 1}, ${html(title)}, ${html(location)}">${i + 1}</a>`
  )).join('');
  return new Response(`<!doctype html>
  <html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive"><title>Libro delle candidature · Agorà APS</title>
  <style nonce="${nonce}">${styles}</style></head>
  <body><a class="skip" href="#indice">Vai all’indice delle candidature</a>
  <header>AGORÀ APS <span>Il libro delle candidature · accesso individuale</span></header>
  <main id="inizio">
    <h1>Una candidatura <em>alla volta.</em></h1>
    <p class="lead">Guida preparata per ${html(applicant.name)}. Scegli una scheda, leggi i requisiti e segui i passaggi.</p>
    <p class="meta">${html(author)}</p>
    <section class="progress" aria-label="Progresso">
      <p role="status"><strong id="count">0</strong> candidature segnate come inviate su ${openings.length}.</p>
      <p class="small">La spunta registra l’invio solo su questo browser. Premi il pulsante sul sito o nell’email per inviare la candidatura.</p>
    </section>
    <nav id="indice" class="chapters" aria-label="Indice delle candidature" tabindex="-1">${index}</nav>
    ${cards}
  </main><footer>Agorà APS · Accesso individuale tramite Cloudflare Access</footer>
  <script nonce="${nonce}">${progressScript}</script></body></html>`, {headers: responseHeaders});
}

export async function handleCandidateGuide(request, env) {
  const { pathname: path, protocol, host } = new URL(request.url);
  if (path !== '/guida-candidature' && path !== '/guida-candidature/') {
    return deny(404, 'Pagina non trovata.');
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return deny(405, 'Metodo non consentito.');
  }
  if (env.AGORA_CANDIDATE_ENABLED !== 'true' || !env.AGORA_CANDIDATE_HOST) {
    return deny(503, 'L’accesso al libro è in preparazione.');
  }
  if (protocol !== 'https:' || host !== env.AGORA_CANDIDATE_HOST) {
    return deny(404, 'Pagina non trovata.');
  }
  const auth = await authorized(request, env, 'AGORA_CANDIDATE_EMAILS', 'AGORA_CANDIDATE_ACCESS_AUD');
  if (auth.status === 503) return deny(503, 'L’accesso al libro è in preparazione.');
  if (auth.status !== 200) return deny(auth.status, auth.message);
  return render(request, env);
}
