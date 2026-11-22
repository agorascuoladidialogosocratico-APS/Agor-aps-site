import assert from 'node:assert/strict';
import {handleCandidateGuide} from '../src/candidate-guide.js';

const url='https://agora-scuoladidialogosocraticoecittadinanzattiva.site/guida-candidature/';
const request=method=>new Request(url,{method});

// Fail closed by default; no private content when Access is not configured.
const unconfigured=await handleCandidateGuide(request('GET'),{});
assert.equal(unconfigured.status,503);
assert.match(unconfigured.headers.get('X-Robots-Tag'),/noindex/);
assert.match(unconfigured.headers.get('Cache-Control'),/no-store/);
assert.doesNotMatch(await unconfigured.text(),/juancmilazzo27|3283332044/i);

// Correctly configured issuer/AUD/allowlist, but no signed user token => 401.
const env={
 CF_ACCESS_TEAM_DOMAIN:'https://sample.cloudflareaccess.com',
 AGORA_CANDIDATE_ACCESS_AUD:'dummy-aud',
 AGORA_CANDIDATE_EMAILS:'candidate@example.com',
 AGORA_CANDIDATE_NAME:'Test Candidate',
 AGORA_CANDIDATE_CV_TEXT:'Experience in sales and logistics',
 AGORA_CANDIDATE_CREDIT:'Test credit',
 AGORA_CANDIDATE_CONTACT_EMAIL:'candidate@example.com',
 AGORA_CANDIDATE_CONTACT_PHONE:'00000'
};
const withoutToken=await handleCandidateGuide(request('GET'),env);
assert.equal(withoutToken.status,401);
assert.doesNotMatch(await withoutToken.text(),/Test Candidate|Experience in sales/);
const invalidMethod=await handleCandidateGuide(request('POST'),env);
assert.equal(invalidMethod.status,405);
const invalidPath=await handleCandidateGuide(new Request(url+'unlisted'),env);
assert.equal(invalidPath.status,404);
console.log('candidate guide: fail-closed checks passed');
