// scripts/build-component-pages.mjs — one shell for every component page.
// Reads each existing site/components/<Name>.html, preserves its authored
// content (preview, code, props, do/don't, summary, prev/next), and renders
// it inside the centrally owned shell: the "use the import, not the markup"
// banner (import line derived from the tsx exports — never hand-written),
// inline banner styles, and the copy button script.
// Idempotent: re-running without source changes rewrites nothing.
// Run: node scripts/build-component-pages.mjs [--check]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { scanPrimitives, importStatement } from './lib/primitives.mjs';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const check = process.argv.includes('--check');

// Split-based extraction on unique markers (robust to nested divs inside content).
function between(html, start, end) {
  const a = html.indexOf(start);
  if (a === -1) throw new Error(`marker missing: ${start}`);
  const b = html.indexOf(end, a + start.length);
  if (b === -1) throw new Error(`marker missing: ${end}`);
  return html.slice(a + start.length, b);
}
const stripTrailingDiv = (s) => s.replace(/<\/div>\s*$/, '');

const BANNER_STYLE = `<style data-import-banner-style>.cieo-import-banner{border:2px solid var(--cieo-color-accent);border-radius:var(--cieo-radius-control);padding:var(--cieo-space-4);margin-block-end:var(--cieo-space-4);background:var(--cieo-color-surface)}.cieo-import-banner p{margin:0 0 var(--cieo-space-2)}.cieo-import-banner pre{margin:0 0 var(--cieo-space-2);overflow-x:auto}.cieo-import-banner button{cursor:pointer}</style>`;
const COPY_SCRIPT = `<script data-import-banner-script>(function(){var b=document.querySelector('[data-copy-import]');if(!b)return;b.addEventListener('click',function(){var t=document.querySelector('[data-import]').textContent;function done(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy import'},1500)}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,done)}else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}ta.remove();done()}})})();</script>`;

const entries = scanPrimitives(root);
let dirty = false;
for (const { dir, values } of entries) {
  const path = `${root}/site/components/${dir}.html`;
  if (!existsSync(path)) {
    console.error(`missing doc page: site/components/${dir}.html`);
    process.exitCode = 1;
    continue;
  }
  const raw = readFileSync(path, 'utf8');
  // Normalize a lane typo (stray quote) found in 4 pages; emitted shell is clean.
  const html = raw.replaceAll('<div data-dont">', '<div data-dont>');
  const title = between(html, '<title>', ' · Cieo</title>');
  const level = between(html, '<span data-level>', '</span>');
  const summary = between(html, `</h1><p>`, `</p>`);
  const preview = stripTrailingDiv(between(html, '<div data-preview>', '<div role="tablist"'));
  const code = between(html, '<code data-code>', '</code>');
  const props = between(html, '<tbody>', '</tbody>');
  const doing = stripTrailingDiv(between(html, '<div data-do>', '<div data-dont>'));
  const dont = stripTrailingDiv(between(html, '<div data-dont>', '</section>'));
  const prev = between(html, '<a data-prev', '</a>');
  const next = between(html, '<a data-next', '</a>');
  const importLine = importStatement(dir, values);

  const out = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} · Cieo</title><link rel="stylesheet" href="../../tokens/tokens.css"><link rel="stylesheet" href="../../design/primitives.css">${BANNER_STYLE}</head><body class="cieo"><header><p><a href="../">Components</a> · <span data-level>${level}</span></p><h1>${title}</h1><p>${summary}</p></header><main><section id="usage"><h2>Usage</h2><div class="cieo-import-banner" data-import-banner><p><strong>Use the import, not the markup.</strong> Copy this line into your code — never paste the preview HTML below.</p><pre><code data-import>${importLine}</code></pre><button type="button" data-copy-import>Copy import</button></div><div data-preview>${preview}</div><div role="tablist" aria-label="Example views"><button role="tab" aria-selected="true">Description</button><button role="tab" aria-selected="false">Code</button></div><pre><code data-code>${code}</code></pre></section><section id="props"><h2>Properties</h2><table data-props><thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody>${props}</tbody></table></section><section id="best"><h2>Best practices</h2><div data-do>${doing}</div><div data-dont>${dont}</div></section></main><aside aria-label="On this page"><a href="#usage">Usage</a><a href="#best">Best practices</a><a href="#props">Properties</a></aside><footer><code data-install>npm install github:civicsense2025/cieo#v0.3.0</code><a data-workbench href="../../docs/workbench.html">Open in Workbench</a><nav><a data-prev${prev}</a><a data-next${next}</a></nav></footer>${COPY_SCRIPT}</body></html>`;

  if (html !== out) {
    dirty = true;
    if (!check) writeFileSync(path, out);
    else console.log(`drift: site/components/${dir}.html`);
  }
}
if (check && dirty) {
  console.error('pages check failed: run node scripts/build-component-pages.mjs');
  process.exit(1);
}
if (process.exitCode) process.exit(process.exitCode);
console.log(`pages rendered: ${entries.length}${check ? ' (check)' : ''}`);
