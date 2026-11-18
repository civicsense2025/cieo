// Composite screens: the list, which library components each one is built from, and the live-preview
// markup that shows those components. The component list is read from the composite's own markup and
// script, so it cannot drift from what the screen actually uses; the preview of each component is the
// fragment its library page ships, read at build time.
import { existsSync, readFileSync } from 'node:fs';

/** Display order, titles and one-line notes for the composites index. */
export const COMPOSITES = Object.freeze([
  { slug: 'dashboard', name: 'Admin dashboard', note: 'Track orders and adjust store settings from one admin screen.' },
  { slug: 'storefront', name: 'Storefront', note: 'Inspect the product, set quantity, and complete checkout in one flow.' },
  { slug: 'chat', name: 'AI chat', note: 'Hold a threaded conversation in a workspace that answers locally.' },
  { slug: 'agent-run', name: 'Agent run', note: 'Follow a replayed agent run: streamed text, a tool call, an approval that waits for the log, and a saved draft.' },
  { slug: 'booking', name: 'Booking', note: 'Choose a day and time, share details, and receive a reference.' },
  { slug: 'settings', name: 'Settings', note: 'Edit profile and preferences with validation, search, and save that persists.' },
  { slug: 'inbox', name: 'Inbox', note: 'Read threads, reply locally, and archive with undo.' },
  { slug: 'onboarding', name: 'Onboarding', note: 'Step through welcome, profile, and preferences to a done state with invite code.' },
]);

/** Stylesheet class stems whose component page has a different name. */
export const CLASS_ALIASES = Object.freeze({ progress: 'ProgressBar', btn: 'Button', button: 'Button', input: 'Field', check: 'CheckboxList' });
/** Most previews one page shows; the rest stay reachable from the library. */
export const MAX_PARTS = 24;

const pascal = (kebab) => kebab.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
const stripBuiltFrom = (html) => html.replace(/<section\b[^>]*data-built-from[^>]*>[\s\S]*?<\/section>/, '');

/** Component names a composite uses: data-parts tokens first, then stylesheet classes that name a component, in order of first use. */
export function partsUsed(html, js, hasPage) {
  const source = `${stripBuiltFrom(html)}\n${js}`;
  const hits = [];
  for (const m of source.matchAll(/data-parts(?:="|': ?'|["']\s*,\s*["'])([^"']+)/g)) for (const n of m[1].split(/\s+/)) hits.push([m.index, n]);
  for (const m of source.matchAll(/\bcieo-(?:p-)?([a-z0-9]+(?:-[a-z0-9]+)*)/g)) {
    const name = CLASS_ALIASES[m[1]] ?? pascal(m[1]);
    if (hasPage(name)) hits.push([m.index, name]);
  }
  const seen = new Set();
  return hits.sort((a, b) => a[0] - b[0]).map(([, n]) => n).filter((n) => hasPage(n) && !seen.has(n) && seen.add(n)).slice(0, MAX_PARTS);
}

/** The fragment between the preview markers of a component page, or null. */
export function previewFragment(pageHtml) {
  const m = /<!--preview-->([\s\S]*?)<!--\/preview-->/.exec(pageHtml);
  return m ? m[1].trim() : null;
}

/** Makes a library fragment safe to sit beside others on one page: one landmark and one h1 per page, no live links, unique ids. */
export function isolateFragment(fragment, scope) {
  const pre = `cp-${scope}-`;
  // A bare list item or row would end the card's own <li> or float out of it, so it gets the parent it needs.
  const first = /^<(li|dt|dd|tr|td|th|option)\b/.exec(fragment.trim())?.[1];
  if (first === 'li') fragment = `<ul>${fragment}</ul>`;
  else if (first === 'dt' || first === 'dd') fragment = `<dl>${fragment}</dl>`;
  else if (first === 'tr') fragment = `<table><tbody>${fragment}</tbody></table>`;
  else if (first === 'td' || first === 'th') fragment = `<table><tbody><tr>${fragment}</tr></tbody></table>`;
  else if (first === 'option') fragment = `<select>${fragment}</select>`;
  const idList = (v) => v.split(/\s+/).map((x) => (x ? pre + x : x)).join(' ');
  return fragment
    .replace(/<(\/?)(main|section)\b/g, '<$1div')
    .replace(/<(\/?)h1\b/g, '<$1h2')
    .replace(/<(\/?)(header|footer|nav)\b([^>]*)>/g, (_, s, tag, rest) => `<${s}div${rest}${s ? '' : ` data-was="${tag}"`}>`)
    .replace(/\s(href|action|formaction)=("[^"]*")/g, (_, a, v) => (a === 'href' && v.startsWith('"#') ? ` data-anchor=${v}` : ` data-${a}=${v}`))
    .replace(/\sid="([^"]*)"/g, (_, v) => ` id="${pre}${v}"`)
    .replace(/\s(for|list|form)="([^"]*)"/g, (_, a, v) => ` ${a}="${pre}${v}"`)
    .replace(/\s(aria-(?:labelledby|describedby|controls|owns|activedescendant))="([^"]*)"/g, (_, a, v) => ` ${a}="${idList(v)}"`);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const label = (layer) => (layer ? layer[0].toUpperCase() + layer.slice(1) : 'Component');

/** Reads what one composite needs from the repository. */
export function compositeParts(repo, slug) {
  const html = readFileSync(`${repo}/site/composites/${slug}.html`, 'utf8');
  const jsPath = `${repo}/site/composites/${slug}.js`;
  const js = existsSync(jsPath) ? readFileSync(jsPath, 'utf8') : '';
  return partsUsed(html, js, (n) => existsSync(`${repo}/site/components/${n}.html`));
}

function layerOf(repo, name) {
  try { return JSON.parse(readFileSync(`${repo}/src/primitives/${name}/manifest.json`, 'utf8')).layer; } catch { return ''; }
}

/** The "Built from" section: one card per component with its live preview, each linking to the library page. */
export function builtFromSection(repo, slug, up = '../') {
  const cards = compositeParts(repo, slug).map((name) => {
    const fragment = previewFragment(readFileSync(`${repo}/site/components/${name}.html`, 'utf8'));
    const stage = fragment ? `<div class="comp-part-stage" inert>${isolateFragment(fragment, name)}</div>` : '';
    return `<li class="comp-part"><a class="comp-part-link" href="${up}components/${name}.html"><span class="comp-part-name">${esc(name)}</span><span class="comp-part-layer">${label(layerOf(repo, name))}</span></a>${stage}</li>`;
  });
  return `<section data-built-from aria-labelledby="built-from-h">
<h2 id="built-from-h">Built from</h2>
<p data-reuse>${cards.length} library components make up this screen. Each card is the component itself; open one to see its usage and props. Recompose from the parts, never paste this page.</p>
<ul class="comp-parts">
${cards.join('\n')}
</ul>
</section>`;
}

/** The composites index: a card per screen with a live, scaled preview and the components it is built from. */
export function indexCards(repo) {
  const cards = COMPOSITES.map(({ slug, name, note }, i) => {
    const parts = compositeParts(repo, slug);
    const shown = parts.slice(0, 6).map((p) => `<li><a href="../components/${p}.html">${esc(p)}</a></li>`).join('');
    const more = parts.length > 6 ? `<li class="comp-chip-more">+${parts.length - 6} more</li>` : '';
    return `<li class="comp-card">
<div class="comp-card-frame" aria-hidden="true"><iframe src="./${slug}.html#embed" title="Preview of ${esc(name)}" loading="lazy" tabindex="-1" inert></iframe></div>
<div class="comp-card-body">
<p class="site-label">${String(i + 1).padStart(2, '0')} / ${parts.length} components</p>
<h2><a href="./${slug}.html">${esc(name)}</a></h2>
<p>${esc(note)}</p>
<ul class="comp-chips" aria-label="Built from">${shown}${more}</ul>
</div>
</li>`;
  });
  return `<ul class="comp-cards">\n${cards.join('\n')}\n</ul>`;
}

/** Stylesheets and the embed hook every composite page carries; the hook lets the index show the screen alone in a frame. The controls sheet loads only for screens that use its classes. */
export function compositeHead(up = '../', controls = false) {
  const sheet = controls ? `<link rel="stylesheet" href="${up}../dist/controls/controls.css">` : '';
  return `${sheet}<link rel="stylesheet" href="${up}composites/composites.css"><script>if(location.hash==='#embed')document.documentElement.classList.add('comp-embed')</script>`;
}
