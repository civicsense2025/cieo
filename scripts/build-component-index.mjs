// scripts/build-component-index.mjs — component docs index + prev/next wiring.
// Reads docs/generated/primitive-exports.json + each manifest (name, layer),
// writes site/components/index.html grouped by layer, and fills data-prev /
// data-next in every site/components/<Name>.html (alphabetical order).
// Deterministic, no timestamps. Run: node scripts/build-component-index.mjs [--check]
import { siteFooter, siteHeader, siteStyles } from './lib/site-chrome.mjs';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const check = process.argv.includes('--check');
const { names } = JSON.parse(readFileSync(`${root}/docs/generated/primitive-exports.json`, 'utf8'));

const items = names.map((dir) => {
  const manifest = JSON.parse(readFileSync(`${root}/src/primitives/${dir}/manifest.json`, 'utf8'));
  const page = `${root}/site/components/${dir}.html`;
  if (!existsSync(page)) {
    console.error(`missing doc page: site/components/${dir}.html`);
    process.exitCode = 1;
  }
  return { dir, name: manifest.name ?? dir, layer: manifest.layer, pack: manifest.packId };
});
if (process.exitCode) process.exit(process.exitCode);
items.sort((a, b) => (a.dir < b.dir ? -1 : 1));

// Generic parts first (by layer), then one section per use-case pack.
const LAYERS = [['primitive', 'Primitives'], ['atom', 'Atoms'], ['molecule', 'Molecules'], ['organism', 'Organisms']];
const PACKS = [['auth', 'Auth'], ['messaging', 'Messaging'], ['audio', 'Audio'], ['agent', 'Agents'], ['social', 'Social'], ['editorial', 'Editorial'], ['tools', 'Tools']];
const core = items.filter((i) => i.pack === 'core');
const unknownLayer = items.filter((i) => !LAYERS.some(([id]) => id === i.layer));
if (unknownLayer.length) { console.error(`unknown layer on: ${unknownLayer.map((i) => i.dir).join(', ')}`); process.exit(1); }
const unknownPack = items.filter((i) => i.pack !== 'core' && !PACKS.some(([id]) => id === i.pack));
if (unknownPack.length) { console.error(`unknown pack on: ${unknownPack.map((i) => i.dir).join(', ')}`); process.exit(1); }
const groups = Object.fromEntries(LAYERS.map(([id]) => [id, core.filter((i) => i.layer === id)]));
const packSection = ([id, title]) => {
  const list = items.filter((i) => i.pack === id);
  return `<section id="pack-${id}" aria-labelledby="pack-${id}-h"><h2 id="pack-${id}-h">${title} pack <span class="doc-count">${list.length}</span></h2><ul>${list.map((i) => `<li><a href="./${i.dir}.html">${i.name}</a> <span class="doc-level">${i.layer}</span></li>`).join('')}</ul></section>`;
};

const section = (id, title, list) =>
  `<section id="${id}" aria-labelledby="${id}-h"><h2 id="${id}-h">${title} <span class="doc-count">${list.length}</span></h2><ul>${list
    .map((i) => `<li><a href="./${i.dir}.html">${i.name}</a></li>`)
    .join('')}</ul></section>`;

const index = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Components · Cieo</title>${siteStyles('../', true)}</head>
<body class="cieo cieo-docsite cieo-site">${siteHeader('../', 'Library')}<main id="main"><div class="doc-shell">
<nav class="doc-rail" aria-label="On this page"><span class="doc-label">On this page</span><a href="#primitives">Primitives</a><a href="#atoms">Atoms</a><a href="#molecules">Molecules</a><a href="#organisms">Organisms</a>${PACKS.map(([id, title]) => `<a href="#pack-${id}">${title}</a>`).join('')}<a href="#elsewhere">Elsewhere</a></nav>
<div class="doc-main">
<header class="doc-head"><p class="doc-crumbs"><span>Cieo</span><span aria-hidden="true">/</span><span>Library</span></p><h1>Library <span class="doc-count">${items.length}</span></h1><p>Every primitive on its own page: the import, a preview, properties, the guide from its README, and the tokens it reads.</p></header>
<div class="doc-register">
${LAYERS.map(([id, title]) => section(id + 's', title, groups[id])).join('\n')}
${PACKS.map(packSection).join('\n')}
<section id="elsewhere" aria-labelledby="elsewhere-h"><h2 id="elsewhere-h">Elsewhere</h2><ul><li><a href="../../docs/controls.html">Form controls (cieo/controls)</a></li><li><a href="../../docs/catalogue.html">Recipe catalogue</a></li><li><a href="../../docs/studio/index.html">Design studio</a></li><li><a href="../composites/index.html">Composites</a></li></ul></section>
</div>
</div>
</div></main>${siteFooter('../')}</body></html>
`;

const writes = [[`${root}/site/components/index.html`, index]];
items.forEach((item, i) => {
  const prev = items[(i - 1 + items.length) % items.length];
  const next = items[(i + 1) % items.length];
  const path = `${root}/site/components/${item.dir}.html`;
  const html = readFileSync(path, 'utf8')
    .replace(/<a data-prev[^>]*>.*?<\/a>/, `<a data-prev href="./${prev.dir}.html">${prev.name}</a>`)
    .replace(/<a data-next[^>]*>.*?<\/a>/, `<a data-next href="./${next.dir}.html">${next.name}</a>`);
  writes.push([path, html]);
});

let dirty = false;
for (const [path, content] of writes) {
  const prev = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (prev !== content) {
    dirty = true;
    if (!check) writeFileSync(path, content);
    if (path.endsWith('index.html')) console.log(`${check ? 'stale' : 'wrote'}: ${path}`);
  }
}
if (check && dirty) {
  console.error('index check failed: run node scripts/build-component-index.mjs');
  process.exit(1);
}
console.log(`pages wired: ${items.length}`);
