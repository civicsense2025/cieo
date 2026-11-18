import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { NAV } from '../scripts/lib/site-chrome.mjs';
import { build, collect } from '../scripts/build-deploy.mjs';
import { handleContact } from '../worker/contact.js';

test('1. Unified NAV, ⌘K search-index.json, and site/search.js cover Components, Recipes, Foundations, and Composites', () => {
  const labels = NAV.map(([l]) => l);
  for (const expected of ['Foundations', 'Studio', 'Library', 'Recipes', 'Composites', 'Pricing', 'Contact']) {
    assert.ok(labels.includes(expected), `NAV missing ${expected}`);
  }
  assert.ok(existsSync('site/search.js'), 'site/search.js exists');
  assert.ok(existsSync('site/search-index.json'), 'site/search-index.json exists');
  const searchJs = readFileSync('site/search.js', 'utf8');
  assert.match(searchJs, /metaKey|ctrlKey/);
  assert.match(searchJs, /Escape/);

  const idx = JSON.parse(readFileSync('site/search-index.json', 'utf8'));
  assert.ok(Array.isArray(idx.items));
  assert.ok(idx.items.filter((x) => x.kind === 'component').length >= 254);
  assert.ok(idx.items.filter((x) => x.kind === 'recipe').length >= 400);
  assert.ok(idx.items.filter((x) => x.kind === 'foundation').length >= 6);
  assert.ok(idx.items.filter((x) => x.kind === 'composite').length >= 8);
});

test('2. Deploy folder eliminates 12.66 MB monolithic docs/*.html bloat (< 5 MB total), flattens site/ to /, and emits 301 redirects', async () => {
  const { files, missing } = collect();
  assert.deepEqual(missing, []);
  for (const retired of ['docs/catalogue.html', 'docs/library.html', 'docs/collection.html', 'docs/workbench.html', 'docs/agent-identity.html']) { // us-spelling-keep
    assert.ok(!files.includes(retired), `${retired} must not be in deploy collect()`);
  }

  const out = mkdtempSync(join(tmpdir(), 'cieo-wave3-deploy-'));
  try {
    build(out);
    // Visitors download compressed files, so the budget is gzip size per file; the raw ceiling is what the four retired 3.2 MB bundles would blow through.
    let totalBytes = 0, gzipBytes = 0;
    const walk = (d) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else { const buf = readFileSync(p); totalBytes += buf.length; gzipBytes += gzipSync(buf).length; }
      }
    };
    walk(out);
    assert.ok(gzipBytes < 3 * 1024 * 1024, `expected .deploy < 3 MB gzipped, got ${(gzipBytes / 1048576).toFixed(2)} MB`);
    assert.ok(totalBytes < 9 * 1024 * 1024, `expected .deploy < 9 MB raw, got ${(totalBytes / 1048576).toFixed(2)} MB`);

    // Root flattened routes exist with real content (no meta refresh)
    const rootHome = readFileSync(join(out, 'index.html'), 'utf8');
    assert.doesNotMatch(rootHome, /http-equiv="refresh"/);
    assert.match(rootHome, /Motion that settles\./);
    assert.ok(existsSync(join(out, 'components/Button.html')));
    assert.ok(existsSync(join(out, 'recipes/index.html')));
    assert.ok(existsSync(join(out, 'foundations/physics.html')));
    assert.ok(existsSync(join(out, 'composites/dashboard.html')));

    const redirects = readFileSync(join(out, '_redirects'), 'utf8');
    assert.match(redirects, /\/docs\/catalogue\.html\s+\/recipes\/\s+301/); // us-spelling-keep
    assert.match(redirects, /\/docs\/workbench\.html\s+\/recipes\/\s+301/);
    assert.match(redirects, /\/docs\/agent-identity\.html\s+\/foundations\/agents\.html\s+301/);
    assert.match(redirects, /\/site\/\*\s+\/:splat\s+301/);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }

  // Contact worker supports root /contact referer as well as /site/contact
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ id: 'ok' }), { status: 200 });
  try {
    const req = new Request('https://cieo.example/api/contact', {
      method: 'POST',
      headers: {
        origin: 'https://cieo.example',
        referer: 'https://cieo.example/contact',
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'text/html',
      },
      body: new URLSearchParams({ name: 'Ada', email: 'ada@example.org', topic: 'question', message: 'Testing root contact redirect behavior.' }).toString(),
    });
    const res = await handleContact(req, { RESEND_API_KEY: 're_test_1', CONTACT_TO: 'team@example.org' });
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), '/contact?sent=1');
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('3. CLI `cieo recipes --out` exports standalone offline HTML bundle', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cieo-cli-recipes-'));
  try {
    const outFile = join(dir, 'offline-recipes.html');
    const r = spawnSync(process.execPath, ['bin/cieo.mjs', 'recipes', '--out', outFile], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(existsSync(outFile));
    assert.ok(statSync(outFile).size > 500_000);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('4. atoms/web hygiene + route-split /recipes/ with lazy chunks, token bridge, slow-mo, and component cross-links', () => {
  const rt = readFileSync('atoms/web/runtime.core.js', 'utf8');
  assert.match(rt, /addEventListener\?\.\(['"]change['"]/);
  assert.match(rt, /document\.hidden/);
  assert.match(rt, /ARRIVE\s*=\s*0?\.45/);

  // Zero z < 0.7 leaks in blocks
  for (const f of readdirSync('atoms/web/blocks').filter((x) => x.endsWith('.js'))) {
    const s = readFileSync(join('atoms/web/blocks', f), 'utf8');
    assert.doesNotMatch(s, /\bz\s*:\s*0?\.[0-6]\b/, `${f} has underdamped z < 0.7 leak`);
  }

  assert.ok(existsSync('site/recipes/index.html'));
  const html = readFileSync('site/recipes/index.html', 'utf8');
  assert.ok(Buffer.byteLength(html) < 120_000, 'recipes shell stays lightweight');
  assert.doesNotMatch(html, /fonts\.googleapis\.com|Geist/i, 'no external Google Geist font loads');
  assert.match(html, /--bg:\s*var\(--cieo-color-canvas\)/);
  assert.match(html, /0\.25/);
  assert.match(html, /0\.1/);

  const chunks = readdirSync('site/recipes/chunks').filter((f) => f.endsWith('.js'));
  assert.ok(chunks.length >= 25, `expected >= 25 lazy category chunks, got ${chunks.length}`);
});

test('5. Foundations portal renders all 6 interactive chapters with single h1 and zero brand leaks', () => {
  for (const page of ['index.html', 'physics.html', 'choreography.html', 'color.html', 'typography.html', 'agents.html']) {
    const p = join('site/foundations', page);
    assert.ok(existsSync(p), `missing ${p}`);
    const html = readFileSync(p, 'utf8');
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${p} has single h1`);
    assert.match(html, /aria-current="page">Foundations<\/a>/);
    assert.doesNotMatch(html, /fonts\.googleapis\.com/i);
  }
  // Each chapter shows the real code in its how-to paragraph; the plain-language lead and headings are checked in foundations-plain.test.mjs.
  assert.match(readFileSync('site/foundations/physics.html', 'utf8'), /rubberBand[\s\S]*projectToDetent|projectToDetent[\s\S]*rubberBand/);
  assert.match(readFileSync('site/foundations/choreography.html', 'utf8'), /MotionFrame[\s\S]*SharedAxis|SharedAxis[\s\S]*MotionFrame/i);
  assert.match(readFileSync('site/foundations/color.html', 'utf8'), /168 combinations of brand, light\/dark and contrast/);
  assert.match(readFileSync('site/foundations/typography.html', 'utf8'), /Pill/);
  assert.match(readFileSync('site/foundations/agents.html', 'utf8'), /square|antenna/i);
});

test('6. M3-caliber component spec pages: stage toolbar, slow-mo & telemetry HUD, multi-platform tabs, SVG anatomy, and live FSM matrix', () => {
  const btnHtml = readFileSync('site/components/Button.html', 'utf8');
  assert.match(btnHtml, /data-stage-toolbar/);
  assert.match(btnHtml, /data-telemetry/);
  assert.match(btnHtml, /Web \(React\)/);
  assert.match(btnHtml, /Web \(CLI \/ CSS\)/);
  assert.match(btnHtml, /Apple \(SwiftUI\)/);
  assert.match(btnHtml, /id="anatomy"/);
  assert.match(btnHtml, /<svg[^>]*data-anatomy-svg/);
  assert.match(btnHtml, /data-fsm-machine="asyncAction"/);
  assert.match(btnHtml, /<a data-workbench href="\.\.\/recipes\/">/);
  assert.ok(existsSync('site/doc-playground.js'));
});
