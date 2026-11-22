import assert from 'node:assert/strict';
import { handleCandidateGuide } from '../src/candidate-guide.js';
import { openings } from '../src/candidate-openings.js';

const url = 'https://example.com/guida-candidature/';
const request = (method = 'GET', token) => new Request(url, {
  method, headers: token ? { 'Cf-Access-Jwt-Assertion': token } : {}
});

const env = {
  AGORA_CANDIDATE_ENABLED: 'true',
  AGORA_CANDIDATE_HOST: 'example.com',
  CF_ACCESS_TEAM_DOMAIN: 'https://example.cloudflareaccess.com',
  AGORA_CANDIDATE_ACCESS_AUD: 'candidate-audience',
  CF_ACCESS_AUD: 'members-audience',
  AGORA_CANDIDATE_EMAILS: 'test-candidate@example.com',
  AGORA_CANDIDATE_NAME: 'Candidato fittizio <QA>',
  AGORA_CANDIDATE_CV_TEXT: 'Curriculum di prova: commercio e magazzino',
  AGORA_CANDIDATE_CREDIT: 'Dicitura di prova',
  AGORA_CANDIDATE_CONTACT_EMAIL: 'test-candidate@example.com',
  AGORA_CANDIDATE_CONTACT_PHONE: '123456789'
};
const privateText = /Candidato fittizio|Curriculum di prova|test-candidate@example\.com|123456789|Dicitura di prova/i;

for (const [response, status] of [
  [await handleCandidateGuide(request(), {}), 503],
  [await handleCandidateGuide(request(), env), 401],
  [await handleCandidateGuide(new Request('https://preview.example.com/guida-candidature/'), env), 404],
  [await handleCandidateGuide(request(), { ...env, AGORA_CANDIDATE_ENABLED: 'false' }), 503],
  [await handleCandidateGuide(request('POST'), env), 405],
  [await handleCandidateGuide(new Request(url + 'altra-pagina'), env), 404]
]) {
  assert.equal(response.status, status);
  assert.match(response.headers.get('X-Robots-Tag'), /noindex/);
  assert.match(response.headers.get('Cache-Control'), /no-store/);
  assert.doesNotMatch(await response.text(), privateText);
}

assert.ok(openings.length >= 70);
assert.equal(new Set(openings.map(offer => offer.id)).size, openings.length);
assert.equal(new Set(openings.map(offer => offer.url)).size, openings.length);
for (const opening of openings) {
  for (const field of ['title', 'company', 'location', 'requirements', 'fit', 'checked']) {
    assert.ok(opening[field]?.trim(), `${opening.id}: missing ${field}`);
  }
  assert.equal(new URL(opening.url).protocol, 'https:');
  assert.match(opening.checked, /^\d{4}-\d{2}-\d{2}$/);
  if (opening.deadline) assert.ok(opening.deadline >= opening.checked);
  if (opening.email) assert.ok(opening.email.includes('@'));
}

const keys = await crypto.subtle.generateKey({
  name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256'
}, true, ['sign', 'verify']);
const jwk = { ...await crypto.subtle.exportKey('jwk', keys.publicKey), kid: 'test-key' };
const base64url = value => Buffer.from(value).toString('base64url');
const signedToken = async (overrides = {}) => {
  const header = base64url(JSON.stringify({ alg: 'RS256', kid: jwk.kid }));
  const claim = base64url(JSON.stringify({
    aud: [env.AGORA_CANDIDATE_ACCESS_AUD], email: env.AGORA_CANDIDATE_EMAILS,
    exp: Math.floor(Date.now() / 1000) + 120, iss: env.CF_ACCESS_TEAM_DOMAIN,
    ...overrides
  }));
  const message = header + '.' + claim;
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, Buffer.from(message));
  return message + '.' + base64url(signature);
};
const realFetch = globalThis.fetch;
globalThis.fetch = async input => {
  assert.equal(input, env.CF_ACCESS_TEAM_DOMAIN + '/cdn-cgi/access/certs');
  return Response.json({ keys: [jwk] });
};
try {
  const token = await signedToken();
  const signedIn = await handleCandidateGuide(request('GET', token), env);
  assert.equal(signedIn.status, 200);
  assert.match(signedIn.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
  assert.equal(signedIn.headers.get('Referrer-Policy'), 'no-referrer');
  const markup = await signedIn.text();
  assert.match(markup, /Candidato fittizio &lt;QA&gt;/);
  assert.match(markup, /Dicitura di prova/);
  assert.equal((markup.match(/<article /g) || []).length, openings.length);
  const emailOpening = openings.find(offer => offer.email);
  assert.ok(emailOpening, 'No published recruitment address in the dataset');
  assert.ok(markup.includes('mailto:' + emailOpening.email));
  assert.ok(markup.includes(encodeURIComponent(env.AGORA_CANDIDATE_CV_TEXT)));
  assert.ok(markup.includes(encodeURIComponent('Candidatura per ' + emailOpening.title)));
  assert.ok(markup.includes('Leggi o copia l’email pronta'));

  const head = await handleCandidateGuide(request('HEAD', token), env);
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  for (const rejectedToken of [
    await signedToken({ email: 'another-user@example.com' }),
    await signedToken({ aud: [env.CF_ACCESS_AUD] }),
    await signedToken({ exp: Math.floor(Date.now() / 1000) - 1 })
  ]) {
    const rejected = await handleCandidateGuide(request('GET', rejectedToken), env);
    assert.equal(rejected.status, 403);
    assert.doesNotMatch(await rejected.text(), privateText);
  }
  const missingPrivateData = await handleCandidateGuide(request('GET', token), { ...env, AGORA_CANDIDATE_CV_TEXT: '' });
  assert.equal(missingPrivateData.status, 503);
  assert.doesNotMatch(await missingPrivateData.text(), privateText);
} finally {
  globalThis.fetch = realFetch;
}
console.log('candidate guide: catalog, Access, privacy and email checks passed');
