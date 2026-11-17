// The Cloudflare site folder: built only from what the pages reference, never with a broken link,
// and the docs' prev/next chain stays in step with the component list.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, collect, localRefs } from '../scripts/build-deploy.mjs';

const write = (repo, rel, text) => { mkdirSync(join(repo, rel, '..'), { recursive: true }); writeFileSync(join(repo, rel), text); };

test('every page, stylesheet and script the entry pages reference exists', () => {
  const { files, missing } = collect();
  assert.deepEqual(missing, []);
  for (const f of ['site/components/index.html', 'design/themes.css', 'design/primitives.css', 'tokens/tokens.css', 'dist/controls/controls.css', 'docs/studio/main.js']) assert.ok(files.includes(f), f);
});

test('the built folder serves the site root to the components index and carries safe headers', () => {
  const out = mkdtempSync(join(tmpdir(), 'cieo-deploy-'));
  try {
    build(out);
    assert.equal(readFileSync(join(out, '_redirects'), 'utf8').trim(), '/ /site/components/ 302');
    const headers = readFileSync(join(out, '_headers'), 'utf8');
    assert.match(headers, /X-Content-Type-Options: nosniff/);
    assert.match(headers, /Referrer-Policy: strict-origin-when-cross-origin/);
    assert.ok(existsSync(join(out, 'site/components/Toast.html')));
    assert.ok(!existsSync(join(out, 'src')), 'source is not published');
    assert.ok(!existsSync(join(out, 'node_modules')));
  } finally { rmSync(out, { recursive: true, force: true }); }
});

test('a missing stylesheet, script or image fails the build and names the page', () => {
  const repo = mkdtempSync(join(tmpdir(), 'cieo-deploy-repo-'));
  try {
    write(repo, 'a/index.html', '<link rel="stylesheet" href="./gone.css"><img src="./gone.png"><script src="/root.js"></script>');
    const { missing } = collect(repo, ['a/index.html']);
    assert.deepEqual(missing.map((m) => m.split(' ')[0]), ['a/gone.css', 'a/gone.png', 'a/index.html']);
    assert.throws(() => build(join(repo, 'out'), repo), /Broken references/);
  } finally { rmSync(repo, { recursive: true, force: true }); }
});

test('sample links, inline script text and folder links do not count as broken', () => {
  const refs = localRefs('x.html', '<a href="/library">demo</a><audio src="/note.m4a"></audio><script>const t = `<a href="${url}">`</script><a href="./sub/">folder</a>');
  assert.deepEqual(refs, ['./sub/']);
  const repo = mkdtempSync(join(tmpdir(), 'cieo-deploy-repo-'));
  try {
    write(repo, 'a/index.html', '<a href="./sub/">folder</a><link rel="stylesheet" href="./s.css">');
    write(repo, 'a/sub/index.html', '<p>ok</p>');
    write(repo, 'a/s.css', '@import "./t.css"; a { background: url("./img.svg") }');
    write(repo, 'a/t.css', 'p{}'); write(repo, 'a/img.svg', '<svg/>');
    assert.deepEqual(collect(repo, ['a/index.html']), { files: ['a/img.svg', 'a/index.html', 'a/s.css', 'a/sub/index.html', 'a/t.css'], missing: [] });
  } finally { rmSync(repo, { recursive: true, force: true }); }
});

test('no doc page shows a photo that is not in the repository', () => {
  for (const f of ['site/components/AspectRatio.html', 'site/components/Lightbox.html', 'site/composites/storefront.html']) {
    assert.ok(!/\.(jpe?g|png|webp)["']/.test(readFileSync(f, 'utf8')), `${f} references a missing photo`);
  }
});

test('every component page links to its alphabetical neighbours', () => {
  const names = readdirSync('site/components').filter((f) => f.endsWith('.html') && f !== 'index.html').map((f) => f.slice(0, -5)).sort((a, b) => (a < b ? -1 : 1));
  names.forEach((name, i) => {
    const html = readFileSync(`site/components/${name}.html`, 'utf8');
    assert.match(html, new RegExp(`<a data-prev href="\\./${names[(i - 1 + names.length) % names.length]}\\.html">`), `${name} prev`);
    assert.match(html, new RegExp(`<a data-next href="\\./${names[(i + 1) % names.length]}\\.html">`), `${name} next`);
  });
});

test('wrangler serves the built folder as static assets and the folder is never committed', () => {
  const cfg = readFileSync('wrangler.jsonc', 'utf8');
  assert.match(cfg, /"name": "cieo"/);
  assert.match(cfg, /"directory": "\.deploy"/);
  assert.ok(!/"main"/.test(cfg), 'static assets only: no worker code to run');
  assert.match(readFileSync('.gitignore', 'utf8'), /^\.deploy\/$/m);
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.match(pkg.scripts.deploy, /wrangler@\d+\.\d+\.\d+ deploy/, 'wrangler is pinned, not floating');
});
