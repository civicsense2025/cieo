// The contact form's rules: what it accepts, what it refuses, and that nothing secret or hostile gets through.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildEmail, escapeHtml, handleContact, LIMITS, looksAutomated, oneLine, sameOrigin, submissionKey, validateContact } from '../worker/contact.js';
import worker from '../worker/index.js';

const URL_ = 'https://cieo.example/api/contact';
const good = { name: 'Ada Lovelace', email: 'ada@example.org', topic: 'bug', message: 'The toast preview floats over the table on my phone.' };
const env = (extra = {}) => ({ RESEND_API_KEY: 're_test_key_123', CONTACT_TO: 'owner@example.net', ...extra });
// A JSON post carries the fill-time stamp the page's own script adds; pass stamp: false to leave it out.
const req = (body, { origin = 'https://cieo.example', type = 'application/json', accept = 'application/json', method = 'POST', headers = {}, stamp = true } = {}) => {
  const data = type === 'application/json' && stamp && body && body.t === undefined ? { t: String(Date.now() - 8000), ...body } : body;
  const h = { 'content-type': type, accept, ...headers };
  if (origin) h.origin = origin;
  return new Request(URL_, { method, headers: h, body: method === 'GET' ? undefined : type === 'application/json' ? JSON.stringify(data) : new URLSearchParams(data).toString() });
};
const withFetch = async (impl, run) => { const real = globalThis.fetch; const calls = []; globalThis.fetch = async (...a) => { calls.push(a); return impl(...a); }; try { return await run(calls); } finally { globalThis.fetch = real; } };
const ok = () => new Response(JSON.stringify({ id: 'abc' }), { status: 200 });
const quiet = async (run) => { const e = console.error; console.error = () => {}; try { return await run(); } finally { console.error = e; } };

test('a complete message passes, and the topic falls back to other', () => {
  assert.equal(validateContact(good).ok, true);
  assert.equal(validateContact({ ...good, topic: 'nonsense' }).value.topic, 'other');
  assert.equal(validateContact({ ...good, topic: '__proto__' }).value.topic, 'other');
});

test('each missing or oversized field is refused with a message fit to show', () => {
  for (const bad of [{ name: '' }, { name: 'x'.repeat(LIMITS.name + 1) }, { email: 'not-an-email' }, { email: 'a@b' }, { email: 'a b@c.org' }, { email: 'x@y.org, z@y.org' }, { message: 'short' }, { message: 'y'.repeat(LIMITS.message + 1) }]) {
    const r = validateContact({ ...good, ...bad });
    assert.equal(r.ok, false, JSON.stringify(bad).slice(0, 60));
    assert.match(r.error, /^[A-Z].*\.$/);
  }
  assert.equal(validateContact(null).ok, false);
});

test('line breaks cannot reach a subject line or a display name', () => {
  const r = validateContact({ ...good, name: 'Ada\r\nBcc: attacker@example.org' });
  assert.ok(!/[\r\n]/.test(r.value.name));
  const mail = buildEmail(r.value, env());
  assert.ok(!/[\r\n]/.test(mail.subject));
  assert.ok(mail.subject.length <= 150);
  assert.equal(oneLine('a\u2028b\tc'), 'a b c');
});

test('the visitor text is escaped in the html body and kept readable in the text body', () => {
  const mail = buildEmail({ ...good, name: '<script>alert(1)</script>', message: 'Use <b>bold</b> & "quotes"\nsecond line' }, env());
  assert.ok(!mail.html.includes('<script>') && !mail.html.includes('<b>'));
  assert.match(mail.html, /&lt;script&gt;/);
  assert.match(mail.text, /second line/);
  assert.deepEqual(mail.replyTo, ['ada@example.org']);
  assert.deepEqual(mail.to, ['owner@example.net']);
  assert.equal(escapeHtml(`&<>"'`), '&amp;&lt;&gt;&quot;&#39;');
});

test('the sender is the sandbox sender until a verified one is configured', () => {
  assert.match(buildEmail(good, env()).from, /onboarding@resend\.dev/);
  assert.equal(buildEmail(good, env({ CONTACT_FROM: 'Cieo <hello@cieo.example>' })).from, 'Cieo <hello@cieo.example>');
});

test('a filled hidden field, or a form sent too fast or a day late, is treated as a script', () => {
  const now = 1_000_000_000_000;
  assert.equal(looksAutomated({ website: 'http://spam' }, now), true);
  assert.equal(looksAutomated({ t: String(now - 500) }, now), true);
  assert.equal(looksAutomated({ t: String(now - LIMITS.maxFillMs - 1) }, now), true);
  assert.equal(looksAutomated({ t: String(now - 8000) }, now), false);
  assert.equal(looksAutomated({}, now), false, 'no script means no stamp, which is allowed');
});

test('a script is told the message went through, and nothing is sent', async () => {
  await withFetch(ok, async (calls) => {
    const res = await handleContact(req({ ...good, website: 'x' }), env());
    assert.equal(res.status, 200);
    assert.equal(calls.length, 0);
  });
});

test('only a same-origin POST is accepted', async () => {
  assert.equal(sameOrigin(req(good)), true);
  assert.equal(sameOrigin(req(good, { origin: 'https://evil.example' })), false);
  assert.equal((await handleContact(req(good, { origin: 'https://evil.example' }), env())).status, 403);
  assert.equal((await handleContact(new Request(URL_, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }), env())).status, 403);
  assert.equal((await handleContact(req(null, { method: 'GET' }), env())).status, 405);
});

test('oversized, unreadable and unsupported bodies are refused before any work', async () => {
  assert.equal((await handleContact(req({ ...good, message: 'z'.repeat(LIMITS.body) }), env())).status, 413);
  assert.equal((await handleContact(new Request(URL_, { method: 'POST', headers: { origin: 'https://cieo.example', accept: 'application/json', 'content-type': 'application/json' }, body: '{nope' }), env())).status, 400);
  assert.equal((await handleContact(new Request(URL_, { method: 'POST', headers: { origin: 'https://cieo.example', accept: 'application/json', 'content-type': 'text/plain' }, body: 'hi' }), env())).status, 400);
});

test('a valid message is sent to Resend once, with the key in the header and never in the response', async () => {
  await withFetch(ok, async (calls) => {
    const res = await handleContact(req(good), env());
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.equal(calls.length, 1);
    const [url, init] = calls[0];
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(init.method, 'POST');
    assert.equal(init.redirect, 'manual');
    assert.equal(init.headers.authorization, 'Bearer re_test_key_123');
    assert.ok(init.headers['idempotency-key']);
    const sent = JSON.parse(init.body);
    assert.deepEqual(sent.replyTo, ['ada@example.org']);
    assert.ok(!JSON.stringify(res.headers).includes('re_test_key'));
  });
});

test('a visitor without script is redirected back to the contact page', async () => {
  await withFetch(ok, async () => {
    const res = await handleContact(req(good, { type: 'application/x-www-form-urlencoded', accept: 'text/html' }), env());
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), '/site/contact?sent=1');
  });
});

test('too many messages from one place are refused, and the limiter is asked by address', async () => {
  const keys = [];
  const limiter = { limit: async ({ key }) => { keys.push(key); return { success: false }; } };
  await withFetch(ok, async (calls) => {
    const res = await handleContact(req(good, { headers: { 'cf-connecting-ip': '203.0.113.9' } }), env({ CONTACT_LIMITER: limiter }));
    assert.equal(res.status, 429);
    assert.deepEqual(keys, ['203.0.113.9']);
    assert.equal(calls.length, 0);
  });
});

test('missing secrets and a failing sender give a calm error and leak nothing', async () => {
  await quiet(async () => {
    assert.equal((await handleContact(req(good), { CONTACT_TO: 'x@example.net' })).status, 503);
    assert.equal((await handleContact(req(good), { RESEND_API_KEY: 're_x' })).status, 503);
    await withFetch(() => new Response('{"message":"bad key re_test_key_123"}', { status: 403 }), async () => {
      const res = await handleContact(req(good), env());
      assert.equal(res.status, 502);
      assert.ok(!(await res.text()).includes('re_test_key'));
    });
    await withFetch(() => { throw new Error('network down'); }, async () => assert.equal((await handleContact(req(good), env())).status, 502));
  });
});

test('a redirect from the sender is a failure, never followed', async () => {
  await quiet(() => withFetch(() => new Response(null, { status: 302, headers: { location: 'https://evil.example' } }), async () => {
    assert.equal((await handleContact(req(good), env())).status, 502);
  }));
});

test('the Worker answers /api/contact, refuses other /api paths, and hands every other path to the assets', async () => {
  const assets = { fetch: async () => new Response('asset') };
  assert.equal((await worker.fetch(new Request('https://cieo.example/api/other'), { ASSETS: assets })).status, 404);
  assert.equal(await (await worker.fetch(new Request('https://cieo.example/site/'), { ASSETS: assets })).text(), 'asset');
  assert.equal((await worker.fetch(new Request(URL_, { method: 'GET' }), { ASSETS: assets })).status, 405);
});

test('the Worker config runs code only for the form, rate limits it, and commits no secret or address', () => {
  const cfg = readFileSync('wrangler.jsonc', 'utf8');
  assert.match(cfg, /"main": "worker\/index\.js"/);
  assert.match(cfg, /"run_worker_first": \["\/api\/\*"\]/);
  assert.match(cfg, /"CONTACT_LIMITER"/);
  assert.ok(!/re_[A-Za-z0-9]{8,}/.test(cfg), 'no API key');
  // The sender is a public From address and may be set; the inbox that receives messages (CONTACT_TO) must stay a secret.
  const sender = cfg.match(/"CONTACT_FROM": "Cieo <(hello@[\w.-]+\.[a-z]{2,})>"/);
  assert.ok(sender, 'the sender is a role address on the verified domain');
  assert.ok(!/[\w.-]+@[\w-]+\.[a-z]{2,}/i.test(cfg.replace(sender[1], '')), 'no other email address');
  assert.ok(!/"CONTACT_TO"/.test(cfg), 'the receiving inbox is not in the config');
});

test('the contact page posts to the endpoint the Worker serves, and every field has a label', () => {
  const html = readFileSync('site/contact.html', 'utf8');
  assert.match(html, /action="\/api\/contact"/);
  for (const name of ['name', 'email', 'topic', 'message']) assert.match(html, new RegExp(`<label>[^<]*<(?:input|select|textarea) name="${name}"`), name);
  assert.match(html, /name="website"[^>]*tabindex="-1"/);
});

test('a script post without the page\'s fill-time stamp is dropped, but a plain form post is judged without one', async () => {
  assert.equal(looksAutomated({}, Date.now(), { stampRequired: true }), true);
  assert.equal(looksAutomated({}, Date.now(), { stampRequired: false }), false);
  await withFetch(ok, async (calls) => {
    assert.equal((await handleContact(req(good, { stamp: false }), env())).status, 200);
    assert.equal(calls.length, 0, 'nothing sent');
    const plain = await handleContact(req(good, { type: 'application/x-www-form-urlencoded', accept: 'text/html' }), env());
    assert.equal(plain.status, 303);
    assert.equal(calls.length, 1, 'a visitor without script is still served');
  });
});

test('the same submission always gets the same idempotency key, and a different one a different key', async () => {
  const a = await submissionKey(good, '1700000000000'), b = await submissionKey({ ...good }, '1700000000000');
  assert.equal(a, b);
  assert.notEqual(a, await submissionKey({ ...good, message: 'A different message entirely.' }, '1700000000000'));
  assert.notEqual(a, await submissionKey(good, '1700000009999'));
  assert.match(a, /^[0-9a-f]{48}$/);
  const keys = [];
  await withFetch(ok, async (calls) => {
    for (let i = 0; i < 2; i += 1) { await handleContact(req({ ...good, t: String(Date.now() - 8000) }), env()); keys.push(calls[i][1].headers['idempotency-key']); }
  });
  assert.equal(keys[0].length, 48);
});

test('a visitor without script lands back on the form with the reason, never on a JSON page', async () => {
  const plain = (body, extra = {}) => req(body, { type: 'application/x-www-form-urlencoded', accept: 'text/html', ...extra });
  const where = async (request, e = env()) => { const r = await handleContact(request, e); return [r.status, r.headers.get('location')]; };
  assert.deepEqual(await where(plain({ ...good, email: 'nope' })), [303, '/site/contact?error=invalid']);
  assert.deepEqual(await where(plain(good), env({ CONTACT_LIMITER: { limit: async () => ({ success: false }) } })), [303, '/site/contact?error=busy']);
  await quiet(async () => assert.deepEqual(await where(plain(good), { CONTACT_TO: 'x@example.net' }), [303, '/site/contact?error=closed']));
  const html = readFileSync('site/contact.js', 'utf8');
  for (const code of ['invalid', 'large', 'unreadable', 'busy', 'closed', 'failed']) assert.match(html, new RegExp(`${code}: '`), `contact.js words the ${code} reason`);
});

test('a request that lost its Origin is accepted only when the browser labels it same-origin', () => {
  assert.equal(sameOrigin(req(good, { origin: null, headers: { 'sec-fetch-site': 'same-origin' } })), true);
  assert.equal(sameOrigin(req(good, { origin: null, headers: { 'sec-fetch-site': 'cross-site' } })), false);
  assert.equal(sameOrigin(req(good, { origin: null })), false);
});
