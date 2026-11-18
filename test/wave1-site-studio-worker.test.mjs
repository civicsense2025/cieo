import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, collect, localRefs } from '../scripts/build-deploy.mjs';
import { handleContact } from '../worker/contact.js';
import { createState } from '../docs/studio/state.js';

test('build-deploy bundles .deploy/design/primitives.css into 1 consolidated stylesheet with zero @imports', () => {
  const out = mkdtempSync(join(tmpdir(), 'cieo-wave1-deploy-'));
  try {
    build(out);
    const bundled = readFileSync(join(out, 'design/primitives.css'), 'utf8');
    assert.doesNotMatch(bundled, /@import\b/, '.deploy/design/primitives.css must inline all local @imports');
    assert.match(bundled, /@layer cieo\.base, cieo\.components, cieo\.utilities, cieo\.accessibility;/);
    assert.match(bundled, /\.cieo-dialog\b/);
    assert.match(bundled, /\.cieo-tab-indicator\b/);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('localRefs catches root-absolute media src on img, audio, video, and source while allowing sample anchor links', () => {
  const refs = localRefs(
    'page.html',
    '<a href="/library">sample</a><audio src="/voice-note.m4a"></audio><img src="/img/bill.jpg"><video poster="/poster.png"><source src="/clip.mp4"></video>',
  );
  assert.deepEqual(refs, ['/voice-note.m4a', '/img/bill.jpg', '/poster.png', '/clip.mp4']);
  const { missing } = collect();
  assert.deepEqual(missing, []);
});

test('site.css targets .lane[data-lane="bounce"] .marker and specimen media in AudioPlayer and Thumbnail do not 404', () => {
  const siteCss = readFileSync('site/site.css', 'utf8');
  assert.match(siteCss, /\.lane\[data-lane="bounce"\]\s+\.marker/);
  assert.doesNotMatch(siteCss, /data-kind="bounce"/);

  const audioHtml = readFileSync('site/components/AudioPlayer.html', 'utf8');
  assert.doesNotMatch(audioHtml, /src="\/voice-note\.m4a"/);

  const thumbHtml = readFileSync('site/components/Thumbnail.html', 'utf8');
  const preview = thumbHtml.match(/<!--preview-->([\s\S]*?)<!--\/preview-->/)?.[1] ?? '';
  assert.doesNotMatch(preview, /src="\/img\/bill\.jpg"/);
});

test('static inline previews in Dialog, AlertDialog, Lightbox, and BottomSheet omit aria-modal="true" and Dialog uses .cieo-dialog', () => {
  for (const name of ['Dialog', 'AlertDialog', 'Lightbox', 'BottomSheet']) {
    const html = readFileSync(`site/components/${name}.html`, 'utf8');
    const preview = html.match(/<!--preview-->([\s\S]*?)<!--\/preview-->/)?.[1] ?? '';
    assert.doesNotMatch(preview, /aria-modal="true"/, `${name} static preview must not trap screen readers with aria-modal="true"`);
  }
  const dialogPreview = readFileSync('site/components/Dialog.html', 'utf8').match(/<!--preview-->([\s\S]*?)<!--\/preview-->/)?.[1] ?? '';
  assert.match(dialogPreview, /class="[^"]*\bcieo-dialog\b/);
});

test('all 8 composite pages and composites/index.html load site/theme.css, tokens.css, primitives.css, unified nav/footer, and single h1', () => {
  const files = readdirSync('site/composites').filter((f) => f.endsWith('.html'));
  assert.equal(files.length, 9);
  for (const file of files) {
    const html = readFileSync(`site/composites/${file}`, 'utf8');
    assert.match(html, /href="\.\.\/theme\.css"/, `${file} missing the site theme (relative to site/)`);
    assert.match(html, /href="\.\.\/\.\.\/tokens\/tokens\.css"/, `${file} missing tokens/tokens.css`);
    assert.match(html, /href="\.\.\/\.\.\/design\/primitives\.css"/, `${file} missing design/primitives.css`);
    assert.match(html, /class="site-header"/, `${file} missing unified site-header`);
    assert.match(html, /class="site-footer"/, `${file} missing unified site-footer`);
    assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${file} must have exactly one <h1>`);
  }
});

test('docs/studio exposes ground, display, elevation, square/pill radius, and links Integration notes without raw .md in .deploy', () => {
  const html = readFileSync('docs/studio/index.html', 'utf8');
  assert.doesNotMatch(html, /design-system\.md/, 'studio must not link raw .md');
  assert.match(html, /id="ground"/);
  assert.match(html, /id="display"/);
  assert.match(html, /id="elevation"/);
  for (const r of ['square', 'crisp', 'soft', 'round', 'pill']) {
    assert.match(html, new RegExp(`<option value="${r}"`), `radius missing ${r}`);
  }

  globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  globalThis.location = { href: 'https://example.test/docs/studio/', hash: '' };
  const state = createState(() => ({ scheme: 'light', reduced: false, contrast: 'standard' }), () => {});
  state.update({ ground: 'paper', display: 'serif', elevation: 'ring', radius: 'pill' });
  const opts = state.theme().options;
  assert.equal(opts.ground, 'paper');
  assert.equal(opts.display, 'serif');
  assert.equal(opts.elevation, 'ring');
  assert.equal(opts.radius, 'pill');

  const { files } = collect();
  assert.ok(!files.some((f) => f.endsWith('.md')), 'no raw .md file should be published in .deploy');
});

test('worker/contact.js forwards client UUID attemptId to Resend idempotency-key and site/contact.js handles uncertain timeouts', async () => {
  const attemptId = '123e4567-e89b-42d3-a456-426614174000';
  const realFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (...args) => {
    calls.push(args);
    return new Response(JSON.stringify({ id: 'msg_1' }), { status: 200 });
  };
  try {
    const body = {
      name: 'Ada Lovelace',
      email: 'ada@example.org',
      topic: 'question',
      message: 'Does retry preserve idempotency across timeouts?',
      t: String(Date.now() - 8000),
      attemptId,
    };
    const mkReq = () =>
      new Request('https://cieo.example/api/contact', {
        method: 'POST',
        headers: { origin: 'https://cieo.example', 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
      });
    const r1 = await handleContact(mkReq(), { RESEND_API_KEY: 're_test_123', CONTACT_TO: 'team@example.org' });
    const r2 = await handleContact(mkReq(), { RESEND_API_KEY: 're_test_123', CONTACT_TO: 'team@example.org' });
    assert.equal(r1.status, 200);
    assert.equal(r2.status, 200);
    assert.equal(calls[0][1].headers['idempotency-key'], attemptId);
    assert.equal(calls[1][1].headers['idempotency-key'], attemptId);
  } finally {
    globalThis.fetch = realFetch;
  }

  const clientJs = readFileSync('site/contact.js', 'utf8');
  assert.match(clientJs, /randomUUID/);
  assert.match(clientJs, /attemptId/);
  assert.match(clientJs, /Sending could not be confirmed\. You can safely retry without sending twice\./);
});
