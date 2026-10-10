// scripts/build-component-index.mjs — component docs index + prev/next wiring.
// Reads docs/generated/primitive-exports.json + each manifest (name, layer),
// writes site/components/index.html grouped by layer, and fills data-prev /
// data-next in every site/components/<Name>.html (alphabetical order).
// Deterministic, no timestamps. Run: node scripts/build-component-index.mjs [--check]
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
  return { dir, name: manifest.name ?? dir, layer: manifest.layer ?? 'atom' };
});
if (process.exitCode) process.exit(process.exitCode);
items.sort((a, b) => (a.dir < b.dir ? -1 : 1));

const groups = { atom: [], molecule: [], organism: [] };
for (const item of items) (groups[item.layer] ?? groups.atom).push(item);

const section = (title, list) =>
  `<section><h2>${title} (${list.length})</h2><ul>${list
    .map((i) => `<li><a href="./${i.dir}.html">${i.name}</a></li>`)
    .join('')}</ul></section>`;

const index = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Components · Cieo</title><link rel="stylesheet" href="../../tokens/tokens.css"><link rel="stylesheet" href="../../design/primitives.css"></head>
<body class="cieo">
<header><p><a href="../">Cieo</a></p><h1>Components (${items.length})</h1><p>Every primitive, with a live example and contract on its own page.</p></header>
<main>
${section('Atoms', groups.atom)}
${section('Molecules', groups.molecule)}
${section('Organisms', groups.organism)}
</main>
<aside aria-label="On this page"><a href="#usage">Atoms</a><a href="#usage">Molecules</a><a href="#usage">Organisms</a></aside>
</body></html>
`;

const writes = [[`${root}/site/components/index.html`, index]];
items.forEach((item, i) => {
  const prev = items[(i - 1 + items.length) % items.length];
  const next = items[(i + 1) % items.length];
  const path = `${root}/site/components/${item.dir}.html`;
  const html = readFileSync(path, 'utf8')
    .replace(/<a data-prev>.*?<\/a>/, `<a data-prev href="./${prev.dir}.html">${prev.name}</a>`)
    .replace(/<a data-next>.*?<\/a>/, `<a data-next href="./${next.dir}.html">${next.name}</a>`);
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
