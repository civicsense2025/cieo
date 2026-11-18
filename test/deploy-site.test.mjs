// The Cloudflare site folder: built only from what the pages reference, never with a broken link,
// and the docs' prev/next chain stays in step with the component list.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertSafeOut, build, collect, existsExact, localRefs } from '../scripts/build-deploy.mjs';
import { deployBlocker } from '../scripts/deploy.mjs';

const write = (repo, rel, text) => { mkdirSync(join(repo, rel, '..'), { recursive: true }); writeFileSync(join(repo, rel), text); };

test('every page, stylesheet and script the entry pages reference exists', () => {
  const { files, missing } = collect();
  assert.deepEqual(missing, []);
  for (const f of ['site/components/index.html', 'site/search-index.json', 'design/themes.css', 'design/primitives.css', 'tokens/tokens.css', 'dist/controls/controls.css', 'docs/studio/main.js']) assert.ok(files.includes(f), f);
});

test('the built folder serves the site at the root, redirects the retired bundles, and carries safe headers', () => {
  const out = mkdtempSync(join(tmpdir(), 'cieo-deploy-'));
  try {
    build(out);
    const redirects = readFileSync(join(out, '_redirects'), 'utf8');
    assert.doesNotMatch(redirects, /^\/ /m, 'the root serves the home page, it does not redirect');
    assert.match(redirects, /^\/site\/\*\s+\/:splat\s+301$/m, 'old /site/ links keep working');
    const headers = readFileSync(join(out, '_headers'), 'utf8');
    assert.match(headers, /X-Content-Type-Options: nosniff/);
    assert.match(headers, /Referrer-Policy: strict-origin-when-cross-origin/);
    assert.ok(existsSync(join(out, 'components/Toast.html')));
    assert.ok(!existsSync(join(out, 'site')), 'site/ is flattened into the root');
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
    assert.throws(() => build(join(repo, '.out'), repo), /Broken references/);
  } finally { rmSync(repo, { recursive: true, force: true }); }
});

test('sample links, inline script text and folder links do not count as broken', () => {
  const refs = localRefs('x.html', '<a href="/library">demo</a><script>const t = `<a href="${url}">`</script><a href="./sub/">folder</a>');
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

test('a link with the wrong letter case fails, because Cloudflare is case-sensitive and macOS is not', () => {
  assert.ok(existsExact(process.cwd(), 'site/components/Toast.html'));
  assert.ok(!existsExact(process.cwd(), 'site/components/toast.html'));
  assert.ok(!existsExact(process.cwd(), 'Design/themes.css'));
  const repo = mkdtempSync(join(tmpdir(), 'cieo-deploy-repo-'));
  try {
    write(repo, 'a/index.html', '<a href="./Page.html">x</a><img srcset="./one.png 1x, ./two.png 2x"><video poster="./cover.png"></video>');
    write(repo, 'a/page.html', '<p/>');
    const { missing } = collect(repo, ['a/index.html']);
    assert.deepEqual(missing, ['a/Page.html', 'a/cover.png', 'a/one.png', 'a/two.png']);
  } finally { rmSync(repo, { recursive: true, force: true }); }
});

test('the output folder can never be the repository, a source folder or an ancestor', () => {
  const repo = mkdtempSync(join(tmpdir(), 'cieo-deploy-repo-'));
  try {
    for (const bad of [repo, join(repo, 'src'), join(repo, 'site/components'), join(repo, '..'), join(repo, 'dist')]) assert.throws(() => assertSafeOut(bad, repo), /Refusing/, bad);
    for (const ok of [join(repo, '.deploy'), join(tmpdir(), 'somewhere-else')]) assert.doesNotThrow(() => assertSafeOut(ok, repo), ok);
  } finally { rmSync(repo, { recursive: true, force: true }); }
});

test('the site has a root page and a not-found page of its own', () => {
  const out = mkdtempSync(join(tmpdir(), 'cieo-deploy-'));
  try {
    build(out);
    const home = readFileSync(join(out, 'index.html'), 'utf8');
    assert.match(home, /Motion that settles\./);
    assert.doesNotMatch(home, /http-equiv="refresh"/);
    assert.match(readFileSync(join(out, '404.html'), 'utf8'), /Page not found/);
    assert.match(readFileSync(join(out, '_headers'), 'utf8'), /\.mjs/);
  } finally { rmSync(out, { recursive: true, force: true }); }
});

test('a deploy is refused from a dirty tree, a branch, or a main that is not origin/main', () => {
  const ok = { branch: 'main', dirty: false, head: 'abc', originMain: 'abc' };
  assert.equal(deployBlocker(ok), null);
  assert.match(deployBlocker({ ...ok, dirty: true }), /uncommitted/);
  assert.match(deployBlocker({ ...ok, branch: 'feat/x' }), /not main/);
  assert.match(deployBlocker({ ...ok, head: 'def' }), /not at origin\/main/);
  assert.match(deployBlocker({ ...ok, originMain: '' }), /git fetch/);
});

test('every component page links to its alphabetical neighbours', () => {
  const names = readdirSync('site/components').filter((f) => f.endsWith('.html') && f !== 'index.html').map((f) => f.slice(0, -5)).sort((a, b) => (a < b ? -1 : 1));
  names.forEach((name, i) => {
    const html = readFileSync(`site/components/${name}.html`, 'utf8');
    assert.match(html, new RegExp(`<a data-prev href="\\./${names[(i - 1 + names.length) % names.length]}\\.html">`), `${name} prev`);
    assert.match(html, new RegExp(`<a data-next href="\\./${names[(i + 1) % names.length]}\\.html">`), `${name} next`);
  });
});

test('wrangler serves the built folder as assets and the folder is never committed', () => {
  const cfg = readFileSync('wrangler.jsonc', 'utf8');
  assert.match(cfg, /"name": "cieo"/);
  assert.match(cfg, /"directory": "\.deploy"/);
  assert.match(readFileSync('.gitignore', 'utf8'), /^\.deploy\/$/m);
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(pkg.scripts.deploy, 'node scripts/deploy.mjs', 'deploys go through the guard');
  assert.match(readFileSync('scripts/deploy.mjs', 'utf8'), /wrangler@\d+\.\d+\.\d+/, 'wrangler is pinned, not floating');
});

test('the Worker is served on the public custom domain, and no secret or address is committed in its config', () => {
  const config = readFileSync('wrangler.jsonc', 'utf8');
  assert.match(config, /"routes": \[\{ "pattern": "[a-z0-9.-]+", "custom_domain": true \}\]/);
  assert.ok(!/re_[A-Za-z0-9]{16,}|@[a-z0-9-]+\.[a-z]{2,}/i.test(config.replace(/"Cieo <[^>]*>"/g, '')), 'no key or email address in the config');
});

/** Resolves a page's reference the way a browser does (`..` stops at the root), then applies the published redirects and Cloudflare's folder-index rule. */
function servedFile(out, pagePath, ref, redirects) {
  let path = new URL(ref, `https://cieo.test${pagePath}`).pathname;
  for (const [from, to] of redirects) {
    if (from.endsWith('/*') && path.startsWith(from.slice(0, -1))) path = to.replace(':splat', path.slice(from.length - 1));
    else if (from === path) path = to;
  }
  path = decodeURIComponent(path);
  if (path.endsWith('/')) path += 'index.html';
  return existsSync(join(out, path)) ? path : null;
}

test('every link, script, stylesheet, image and search result in the built site resolves once site/ is served at the root', () => {
  const out = mkdtempSync(join(tmpdir(), 'cieo-deploy-links-'));
  try {
    build(out);
    const redirects = readFileSync(join(out, '_redirects'), 'utf8').trim().split('\n').map((l) => l.split(/\s+/).slice(0, 2));
    const pages = [];
    const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith('.html')) pages.push(p); } };
    walk(out);
    assert.ok(pages.length > 250, 'the built site holds the component pages');
    const broken = [];
    for (const file of pages) {
      const pagePath = `/${file.slice(out.length + 1)}`;
      const markup = readFileSync(file, 'utf8').replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>');
      for (const m of markup.matchAll(/<(\w+)\b[^>]*?\b(?:href|src)=["']([^"']+)["']/g)) {
        const [, tag, ref] = m;
        if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(ref)) continue;
        if (ref.startsWith('/') && !/^(?:link|script|img|audio|video|source)$/i.test(tag)) continue; // root links in previews are sample content
        if (!servedFile(out, pagePath, ref, redirects)) broken.push(`${pagePath} -> ${ref}`);
      }
    }
    assert.deepEqual(broken.slice(0, 10), [], `${broken.length} references do not resolve`);

    const { items } = JSON.parse(readFileSync(join(out, 'search-index.json'), 'utf8'));
    const lost = items.filter((i) => !servedFile(out, '/index.html', i.href, redirects)).map((i) => i.href);
    assert.deepEqual(lost.slice(0, 10), [], `${lost.length} search results lead nowhere`);

    for (const [from, to] of redirects) {
      assert.match(from, /^\//); assert.match(to, /^\//);
      if (!from.endsWith('*')) assert.ok(servedFile(out, '/index.html', to, []), `redirect target ${to} exists`);
    }
  } finally { rmSync(out, { recursive: true, force: true }); }
});
