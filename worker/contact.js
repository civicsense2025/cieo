// The contact form endpoint. A visitor's message is validated, checked for abuse, and forwarded through Resend.
// Pure helpers are exported so each rule can be tested on its own. Secrets (RESEND_API_KEY, CONTACT_TO) come from the
// environment only; nothing the visitor wrote or the key itself is ever logged.

export const TOPICS = Object.freeze({ question: 'Question', bug: 'Bug', idea: 'Idea', other: 'Other' });
export const LIMITS = Object.freeze({ body: 20_000, name: 100, email: 200, message: 5000, minMessage: 10, minFillMs: 2000, maxFillMs: 24 * 60 * 60 * 1000 });
const SECURITY_HEADERS = { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' };

/** One line, no control characters: safe for a subject line and a display name. */
export const oneLine = (value) => String(value ?? '').replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ').trim();
/** Keeps line breaks and tabs in a message but drops other control characters. */
const multiLine = (value) => String(value ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
export const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const EMAIL = /^[^\s@<>"',;:()[\]\\]+@[^\s@<>"',;:()[\]\\]+\.[^\s@<>"',;:()[\]\\]{2,}$/;

/** Returns { ok: true, value } or { ok: false, error } with a message fit to show the visitor. */
export function validateContact(input) {
  const body = input && typeof input === 'object' ? input : {};
  const name = oneLine(body.name), email = oneLine(body.email), message = multiLine(body.message);
  const topic = Object.hasOwn(TOPICS, body.topic) ? body.topic : 'other';
  if (!name || name.length > LIMITS.name) return { ok: false, error: 'Please tell us your name (up to 100 characters).' };
  if (email.length > LIMITS.email || !EMAIL.test(email)) return { ok: false, error: 'Please enter an email address we can reply to.' };
  if (message.length < LIMITS.minMessage) return { ok: false, error: 'Please write a little more, at least a sentence.' };
  if (message.length > LIMITS.message) return { ok: false, error: 'That message is too long. Please keep it under 5,000 characters.' };
  return { ok: true, value: { name, email, topic, message } };
}

/** True when the visitor looks like a script: the hidden field is filled, or the form was submitted too fast or too late. */
export function looksAutomated(body, now = Date.now()) {
  if (oneLine(body?.website)) return true;
  const stamp = Number(body?.t);
  if (!Number.isFinite(stamp) || stamp <= 0) return false; // without script there is no stamp; the other checks still apply
  const elapsed = now - stamp;
  return elapsed < LIMITS.minFillMs || elapsed > LIMITS.maxFillMs;
}

export function buildEmail({ name, email, topic, message }, env) {
  const label = TOPICS[topic];
  const subject = oneLine(`[Cieo · ${label}] ${name}`).slice(0, 150);
  const text = `From: ${name} <${email}>\nAbout: ${label}\n\n${message}\n`;
  const html = `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;<br>About: ${escapeHtml(label)}</p><div style="white-space:pre-wrap">${escapeHtml(message)}</div>`;
  return { from: env.CONTACT_FROM || 'Cieo <onboarding@resend.dev>', to: [env.CONTACT_TO], replyTo: [email], subject, text, html };
}

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...SECURITY_HEADERS, 'content-type': 'application/json' } });
const fail = (status, error) => json(status, { error });

async function readBody(request) {
  const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const length = Number(request.headers.get('content-length'));
  if (Number.isFinite(length) && length > LIMITS.body) return { tooLarge: true };
  const text = await request.text();
  if (text.length > LIMITS.body) return { tooLarge: true };
  if (type === 'application/json') { try { return { body: JSON.parse(text) }; } catch { return { bad: true }; } }
  if (type === 'application/x-www-form-urlencoded') return { body: Object.fromEntries(new URLSearchParams(text)) };
  return { bad: true };
}

/** Same-origin only: a form on another site cannot post here through a visitor's browser. */
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

export async function handleContact(request, env, now = Date.now()) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { ...SECURITY_HEADERS, allow: 'POST' } });
  if (!sameOrigin(request)) return fail(403, 'This form can only be sent from the Cieo site.');
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const done = () => (wantsJson ? json(200, { ok: true }) : new Response(null, { status: 303, headers: { ...SECURITY_HEADERS, location: '/site/contact?sent=1' } }));

  const read = await readBody(request);
  if (read.tooLarge) return fail(413, 'That message is too large.');
  if (read.bad) return fail(400, 'We could not read that message.');
  if (looksAutomated(read.body, now)) return done(); // say nothing to a script; send nothing

  if (env.CONTACT_LIMITER) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const { success } = await env.CONTACT_LIMITER.limit({ key: ip });
    if (!success) return fail(429, 'Too many messages just now. Please try again in a few minutes.');
  }
  const checked = validateContact(read.body);
  if (!checked.ok) return fail(400, checked.error);
  if (!env.RESEND_API_KEY || !env.CONTACT_TO) { console.error('contact: not configured'); return fail(503, 'Messages are not being accepted right now. Please try again later.'); }

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(8000),
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json', 'idempotency-key': crypto.randomUUID() },
      body: JSON.stringify(buildEmail(checked.value, env)),
    });
  } catch { console.error('contact: send failed (network)'); return fail(502, 'We could not send that just now. Please try again.'); }
  if (!response.ok) { console.error(`contact: send refused (${response.status})`); return fail(502, 'We could not send that just now. Please try again.'); }
  return done();
}
