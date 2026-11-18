// The contact form's rules: what it accepts, what it refuses, and that nothing secret or hostile gets through.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildEmail, escapeHtml, handleContact, LIMITS, looksAutomated, oneLine, sameOrigin, validateContact } from '../worker/contact.js';
import worker from '../worker/index.js';

const URL_ = 'https://cieo.example/api/contact';
const good = { name: 'Ada Lovelace', email: 'ada@example.org', topic: 'bug', message: 'The toast preview floats over the table on my phone.' };
const env = (extra = {}) => ({ RESEND_API_KEY: 're_test_key_123', CONTACT_TO: 'owner@example.net', ...extra });
const req = (body, { origin = 'https://cieo.example', type = 'application/json', accept = 'application/json', method = 'POST', headers = {} } = {}) =>
  new Request(URL_, { method, headers: { origin, 'content-type': type, accept, ...headers }, body: method === 'GET' ? undefined : type === 'application/json' ? JSON.stringify(body) : new URLSearchParams(body).toString() });
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
  assert.equal((await handleContact(new Request(URL_, { method: 'POST', headers: { origin: 'https://cieo.example', 'content-type': 'application/json' }, body: '{nope' }), env())).status, 400);
  assert.equal((await handleContact(new Request(URL_, { method: 'POST', headers: { origin: 'https://cieo.example', 'content-type': 'text/plain' }, body: 'hi' }), env())).status, 400);
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
  assert.ok(!/[\w.-]+@[\w-]+\.[a-z]{2,}/i.test(cfg.replace(/hello@your-domain/g, '')), 'no email address');
});

test('the contact page posts to the endpoint the Worker serves, and every field has a label', () => {
  const html = readFileSync('site/contact.html', 'utf8');
  assert.match(html, /action="\/api\/contact"/);
  for (const name of ['name', 'email', 'topic', 'message']) assert.match(html, new RegExp(`<label>[^<]*<(?:input|select|textarea) name="${name}"`), name);
  assert.match(html, /name="website"[^>]*tabindex="-1"/);
});
