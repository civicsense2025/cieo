#!/usr/bin/env node
// Builds site/search-index.json, the list the site's ⌘K search reads: every component page, motion recipe,
// foundations chapter and composite page, each with a title, a one-line summary, search tags and a link relative to /site/.
// Usage: node scripts/build-search-index.mjs [--check]
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'site/search-index.json');
const unescape = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const pick = (html, re) => unescape(re.exec(html)?.[1] ?? '').trim();

function pages(dir, kind, { skip = [] } = {}) {
  return readdirSync(join(root, 'site', dir)).filter((f) => f.endsWith('.html') && !skip.includes(f)).sort().map((f) => {
    const html = readFileSync(join(root, 'site', dir, f), 'utf8');
    const title = pick(html, /<title>([^<]*)<\/title>/).split(' · ')[0];
    const name = f.slice(0, -5);
    return { kind, title: title || name, subtitle: pick(html, /<meta name="description" content="([^"]*)"/), tags: name.toLowerCase(), href: `${dir}/${f}` };
  });
}

export function buildIndex() {
  const recipes = JSON.parse(readFileSync(join(root, 'atoms/web/index.json'), 'utf8')).filter((r) => r.file.startsWith('blocks/'))
    .map((r) => ({ kind: 'recipe', title: r.name, subtitle: r.summary, tags: `${r.category} ${r.id}`.toLowerCase(), href: `recipes/#${r.id}` }));
  const items = [
    ...pages('foundations', 'foundation'),
    ...pages('components', 'component', { skip: ['index.html'] }),
    ...recipes,
    ...pages('composites', 'composite', { skip: ['index.html'] }),
  ];
  return `${JSON.stringify({ formatVersion: 1, items })}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const next = buildIndex();
  if (process.argv.includes('--check')) {
    if (!existsSync(out) || readFileSync(out, 'utf8') !== next) { console.error('stale: site/search-index.json (run node scripts/build-search-index.mjs)'); process.exit(1); }
  } else writeFileSync(out, next);
  console.log(`search index: ${JSON.parse(next).items.length} items`);
}
