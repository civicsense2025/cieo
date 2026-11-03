// scripts/build-component-pages.mjs — one shell for every component page.
// Reads each existing site/components/<Name>.html, preserves its authored
// content (preview, code, props, do/don't, summary, prev/next), and renders
// it inside the centrally owned shell: the "use the import, not the markup"
// banner (import line derived from the tsx exports — never hand-written),
// inline banner styles, and the copy button script.
// Idempotent: re-running without source changes rewrites nothing.
// Run: node scripts/build-component-pages.mjs [--check]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { syncPropertyRows } from './lib/component-props.mjs';
import { scanPrimitives, importStatement } from './lib/primitives.mjs';
import { readmeHtml } from './lib/readme-html.mjs';

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

const TAB_SCRIPT = `<script data-tabs-script>(function(){var tabs=[].slice.call(document.querySelectorAll('.doc-tabs [role=tab]'));tabs.forEach(function(t,i){t.addEventListener('click',function(){select(i)});t.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();var n=(i+d+tabs.length)%tabs.length;select(n);tabs[n].focus()}})});function select(i){tabs.forEach(function(t,j){var on=i===j;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!on})}})();</script>`;
const COPY_SCRIPT = `<script data-import-banner-script>(function(){var b=document.querySelector('[data-copy-import]');if(!b)return;b.addEventListener('click',function(){var t=document.querySelector('[data-import]').textContent;function done(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy import'},1500)}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,done)}else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}ta.remove();done()}})})();</script>`;

// Authored parts are delimited by comment markers; the pre-redesign markers stay as a fallback.
function part(html, name, legacy) {
  const a = `<!--${name}-->`, b = `<!--/${name}-->`;
  if (html.includes(a)) return between(html, a, b);
  return legacy();
}
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
const version = JSON.parse(readFileSync(`${root}/package.json`, 'utf8')).version;

/** Every design and motion token the component's stylesheet reads, so the page states its dependencies. */
function tokensOf(dir) {
  const css = `${root}/design/styles/primitives/${kebab(dir)}.css`;
  if (!existsSync(css)) return [];
  return [...new Set([...readFileSync(css, 'utf8').matchAll(/var\((--(?:cieo|motion)-[\w-]+)/g)].map((m) => m[1]))].sort();
}

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
  const summary = part(html, 'summary', () => between(html, `</h1><p>`, `</p>`));
  const preview = part(html, 'preview', () => stripTrailingDiv(between(html, '<div data-preview>', '<div role="tablist"')));
  const code = part(html, 'code', () => between(html, '<code data-code>', '</code>'));
  const manifest = JSON.parse(readFileSync(`${root}/src/primitives/${dir}/manifest.json`, 'utf8'));
  const props = syncPropertyRows(between(html, '<tbody>', '</tbody>'), manifest.properties);
  const doing = part(html, 'do', () => stripTrailingDiv(between(html, '<div data-do>', '<div data-dont>')));
  const dont = part(html, 'dont', () => stripTrailingDiv(between(html, '<div data-dont>', '</section>')));
  const prev = between(html, '<a data-prev', '</a>');
  const next = between(html, '<a data-next', '</a>');
  const importLine = importStatement(dir, values);
  const readme = `${root}/src/primitives/${dir}/README.md`;
  const guide = existsSync(readme) ? readmeHtml(readFileSync(readme, 'utf8')) : '';
  const tokens = tokensOf(dir);

  const rail = [['usage', 'Usage'], ['props', 'Properties'], guide && ['guide', 'Guide'], ['best', 'Best practices'], tokens.length && ['tokens', 'Tokens']].filter(Boolean)
    .map(([id, label]) => `<a href="#${id}">${label}</a>`).join('');
  const out = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} · Cieo</title><link rel="stylesheet" href="../../design/themes.css"><link rel="stylesheet" href="../../tokens/tokens.css"><link rel="stylesheet" href="../../design/primitives.css"><link rel="stylesheet" href="../doc.css"></head><body class="cieo cieo-docsite"><div class="doc-shell"><nav class="doc-rail" aria-label="On this page"><span class="doc-label">On this page</span>${rail}</nav><div class="doc-main"><header class="doc-head"><p class="doc-crumbs"><a href="./">Components</a><span aria-hidden="true">/</span><span class="doc-level"><span data-level>${level}</span></span></p><h1>${title}</h1><p><!--summary-->${summary}<!--/summary--></p></header><section id="usage" aria-labelledby="usage-h"><h2 id="usage-h">Usage</h2><div class="cieo-import-banner" data-import-banner><p>Use the import, not the markup. Copy this line into your code; never paste the preview HTML below.</p><pre><code data-import>${importLine}</code></pre><button type="button" class="doc-button" data-copy-import>Copy import</button></div><div class="doc-example"><div class="doc-tabs" role="tablist" aria-label="Example views"><button type="button" role="tab" id="tab-preview" aria-controls="panel-preview" aria-selected="true">Preview</button><button type="button" role="tab" id="tab-code" aria-controls="panel-code" aria-selected="false" tabindex="-1">Code</button></div><div class="doc-stage" role="tabpanel" id="panel-preview" aria-labelledby="tab-preview" data-preview><!--preview-->${preview}<!--/preview--></div><pre class="doc-code" role="tabpanel" id="panel-code" aria-labelledby="tab-code" hidden><code data-code><!--code-->${code}<!--/code--></code></pre></div></section><section id="props" aria-labelledby="props-h"><h2 id="props-h">Properties</h2><div class="doc-table-wrap"><table data-props><thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody>${props}</tbody></table></div></section>${guide ? `<section id="guide" aria-labelledby="guide-h"><h2 id="guide-h">Guide</h2><div class="doc-guide">${guide}</div></section>` : ''}<section id="best" aria-labelledby="best-h"><h2 id="best-h">Best practices</h2><div class="doc-verdicts"><div data-do><!--do-->${doing}<!--/do--></div><div data-dont><!--dont-->${dont}<!--/dont--></div></div></section>${tokens.length ? `<section id="tokens" aria-labelledby="tokens-h"><h2 id="tokens-h">Tokens</h2><p>The stylesheet reads these tokens, so a theme restyles the component without overrides.</p><ul class="doc-tokens">${tokens.map((t) => `<li>${t}</li>`).join('')}</ul></section>` : ''}<footer class="doc-foot"><code data-install>npm install github:civicsense2025/cieo#v${version}</code><a data-workbench href="../../docs/workbench.html">Open in Workbench</a><nav aria-label="Components"><a data-prev${prev}</a><a data-next${next}</a></nav></footer></div></div>${TAB_SCRIPT}${COPY_SCRIPT}</body></html>`;

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
