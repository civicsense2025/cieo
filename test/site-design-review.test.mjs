// Pins the site's design-review outcomes: shared chrome everywhere, reachable skip links, readable contrast,
// phone layouts, touch targets, search behavior, deep links and honest copy.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ENTRY_PAGES, collect } from '../scripts/build-deploy.mjs';
import { NAV } from '../scripts/lib/site-chrome.mjs';

const read = (rel) => readFileSync(rel, 'utf8');
const htmlIn = (dir) => readdirSync(dir).filter((f) => f.endsWith('.html')).map((f) => join(dir, f));
const sitePages = ['site/index.html', 'site/pricing.html', 'site/contact.html', ...['components', 'composites', 'foundations', 'recipes'].flatMap((d) => htmlIn(`site/${d}`))];
const block = (css, selector) => {
  const i = css.indexOf(`${selector} {`);
  assert.notEqual(i, -1, `${selector} rule exists`);
  return css.slice(i, css.indexOf('}', i));
};

test('every composite page carries the shared header, footer, nav, search button and search script', () => {
  const pages = htmlIn('site/composites');
  assert.equal(pages.length, 9);
  for (const page of pages) {
    const html = read(page);
    for (const [label] of NAV) assert.ok(html.includes(`>${label}</a>`), `${page} nav lacks ${label}`);
    assert.match(html, /data-search-open/, `${page} lacks the search button`);
    assert.match(html, /<script type="module" src="\.\.\/search\.js"/, `${page} lacks search.js`);
    assert.match(html, /aria-current="page">Composites</, `${page} does not mark Composites current`);
    assert.doesNotMatch(html, /color-scheme:\s*light\s*;?\s*}/, `${page} pins a dead light-only color-scheme`);
  }
});

test('the skip link on every site page lands on an element that exists', () => {
  for (const page of [...sitePages, 'docs/studio/index.html']) {
    const html = read(page);
    const target = /class="site-skip" href="#([^"]+)"/.exec(html)?.[1];
    assert.ok(target, `${page} has a skip link`);
    assert.match(html, new RegExp(`id="${target}"`), `${page}: skip target #${target} exists`);
  }
});

test('no page links the theme through /site/, which redirects once deployed at the root', () => {
  for (const page of sitePages) assert.doesNotMatch(read(page), /site\/theme\.css/, page);
});

test('the Studio carries the site chrome, keeps its deploy references valid and is a published entry', () => {
  const html = read('docs/studio/index.html');
  assert.match(html, /class="site-header"/);
  assert.match(html, /aria-current="page">Studio</);
  assert.match(html, /href="\.\.\/\.\.\/site\/site\.css"/);
  assert.ok(ENTRY_PAGES.includes('docs/studio/index.html'));
  assert.deepEqual(collect().missing, []);
});

test('the dashboard uses one hairline facts row and the composites index is a grid of live previews', () => {
  const dash = read('site/composites/dashboard.html');
  assert.match(dash, /<div class="facts">/);
  assert.doesNotMatch(dash, /dash-card/);
  const index = read('site/composites/index.html');
  assert.match(index, /<ul class="comp-cards">/);
  assert.equal((index.match(/<li class="comp-card">/g) ?? []).length, 8, 'one preview card per composite');
  assert.equal((index.match(/<iframe src="\.\/[a-z-]+\.html#embed"/g) ?? []).length, 8, 'each card shows the live screen');
  assert.doesNotMatch(index, /index-list|index-card/);
  assert.doesNotMatch(read('site/composites/storefront.html'), /system-ui/);
  assert.match(read('site/foundations/index.html'), /<ul class="index-list"/);
  assert.doesNotMatch(read('site/foundations/foundations.css'), /\.fnd-grid|\.fnd-card/);
});

test('on phones the nav folds into a menu opened by a two-line button, and search is an icon', () => {
  const css = read('site/site.css');
  const phone = css.slice(css.indexOf('@media (max-width: 64rem)'));
  assert.match(phone, /\.site-nav \{[^}]*display: none/);
  assert.match(phone, /\.site-header\[data-menu-open\] \.site-nav \{[^}]*display: flex/);
  assert.match(phone, /\.site-menu-btn \{[^}]*display: inline-flex/);
  const chrome = read('scripts/lib/site-chrome.mjs');
  assert.match(chrome, /M3 7h14M3 13h14/, 'a two-line hamburger');
  assert.doesNotMatch(chrome, /<span>Search<\/span>/, 'search is an icon, labeled for screen readers');
});

test('phones keep the chapter and section links as a scrolling row instead of hiding them', () => {
  const css = read('site/doc.css');
  assert.doesNotMatch(css, /\.doc-rail \{ display: none/);
  assert.match(css, /\.doc-rail \{[^}]*overflow-x: auto/);
});

test('the recipes toolbar sticks under the site header with a solid background and no blur', () => {
  const css = read('site/recipes/recipes.css');
  assert.doesNotMatch(css, /backdrop-filter/);
  const sticky = css.slice(css.indexOf('@media (min-width: 64rem)'));
  assert.match(sticky, /top: var\(--site-header-h\)/);
  assert.match(sticky, /z-index: var\(--cieo-layer-sticky\)/);
  assert.match(block(css, '.recipes-toolbar'), /background: var\(--cieo-color-canvas\)/);
});

test('control edges use the strong border token and selected states are ink, not a faint fill', () => {
  const rec = read('site/recipes/recipes.css'), fnd = read('site/foundations/foundations.css'), doc = read('site/doc.css');
  for (const [css, sel] of [[rec, '.recipes-search'], [rec, '.recipes-select'], [rec, '.recipes-seg'], [fnd, '.fnd-controls select'], [fnd, '.fnd-presets'], [fnd, '.fnd-tabs'], [doc, '.doc-knob select']]) {
    assert.match(block(css, sel), /border(?:-color)?:[^;]*--cieo-color-border-strong/, `${sel} edge`);
  }
  assert.match(block(rec, '.recipes-seg button[aria-pressed="true"]'), /background: var\(--cieo-color-accent\)/);
  assert.match(block(fnd, '.fnd-presets button[aria-pressed="true"]'), /background: var\(--cieo-color-accent\)/);
  assert.match(block(fnd, '.fnd-tab-pill'), /border: [^;]*--cieo-color-text/);
});

test('coarse pointers get 44px targets for nav, search and every docs control family', () => {
  for (const f of ['site/site.css', 'site/doc.css', 'site/foundations/foundations.css', 'site/recipes/recipes.css']) {
    const css = read(f);
    assert.match(css, /@media \(pointer: coarse\)/, `${f} has a coarse-pointer rule`);
    assert.match(css, /min-(?:block-size|height): var\(--cieo-touch-target\)/, `${f} uses the touch-target token`);
  }
  assert.match(read('site/site.css'), /pointer: coarse\)\s*\{[^}]*\.site-nav a[^}]*\.site-search-btn/s);
});

test('hover styles apply only where hover exists', () => {
  const rec = read('site/recipes/recipes.css');
  assert.match(rec, /@media \(hover: hover\) \{ \.recipe-comp-link:hover/);
  assert.doesNotMatch(read('site/foundations/foundations.css'), /:hover/);
});

test('portal styles use tokens, not hard-coded hairlines and radii', () => {
  for (const f of ['site/foundations/foundations.css', 'site/recipes/recipes.css']) {
    const css = read(f);
    assert.doesNotMatch(css, /border[^:]*:\s*1px (solid|dashed)/, `${f} hard-codes a 1px border`);
    assert.doesNotMatch(css, /border-radius:\s*(5|9|11|12|14)px/, `${f} hard-codes a radius`);
  }
});

test('search: visible focus, inert page and locked scroll while open, honest expanded state, counts from the index', () => {
  assert.match(read('site/site.css'), /\.site-search-bar:focus-within \{[^}]*outline: var\(--cieo-focus-width\)/);
  const js = read('site/search.js');
  assert.match(js, /\.inert = true/);
  assert.match(js, /\.inert = false/);
  assert.match(js, /documentElement\.style\.overflow = 'hidden'/);
  assert.match(js, /setAttribute\('aria-expanded', 'false'\)/);
  assert.doesNotMatch(js, /\b254\b/, 'the placeholder must not hard-code a count');
  assert.match(js, /n\('composite'\)/);
  assert.match(read('scripts/lib/site-chrome.mjs'), /recipes, composites, and foundations/);
});

test('choreography tabs are a real tablist: roving tabindex, arrow keys, controlled tabpanel', () => {
  const html = read('site/foundations/choreography.html');
  assert.equal([...html.matchAll(/role="tab"[^>]*aria-controls="choreo-panel"/g)].length, 4);
  assert.equal([...html.matchAll(/role="tab"[^>]*tabindex="-1"/g)].length, 3);
  assert.match(html, /role="tabpanel"[^>]*aria-labelledby="choreo-tab-0"|aria-labelledby="choreo-tab-0"[^>]*role="tabpanel"/);
  assert.match(read('site/foundations/foundations.js'), /import \{ rovingTabs \} from '\.\.\/roving-tabs\.js'/);
  assert.match(read('site/doc-playground.js'), /import \{ rovingTabs \} from '\.\/roving-tabs\.js'/);
  const tabs = read('site/roving-tabs.js');
  for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) assert.ok(tabs.includes(key), key);
});

test('the playground slow-motion buttons stretch the stage motion tokens and "(default)" removes the prop', () => {
  const js = read('site/doc-playground.js');
  assert.match(js, /stage\.style\.setProperty\(name, value\)/);
  assert.match(js, /--cieo-motion-duration-/);
  assert.match(js, /else if \(target\) \{\s*delete target\.dataset\[prop\];/);
});

test('every component page draws one anatomy marker per listed slot', () => {
  for (const page of htmlIn('site/components').filter((p) => !p.endsWith('index.html'))) {
    const html = read(page);
    const svg = /<svg data-anatomy-svg[\s\S]*?<\/svg>/.exec(html)?.[0];
    if (!svg) continue;
    const listed = [...html.matchAll(/<li><b>(\d+)<\/b>/g)].length;
    const drawn = [...svg.matchAll(/text-anchor="middle" font-size="10"[^>]*>(\d+)</g)].length;
    assert.equal(drawn, listed, `${page}: ${drawn} markers drawn for ${listed} slots`);
  }
});

test('recipes: family buttons and tile chips are named in full, and hash changes load and scroll to the target', () => {
  const html = read('site/recipes/index.html');
  for (const name of ['Morph', 'Swap', 'Drag', 'Edges', 'Enter and exit', 'Time']) assert.match(html, new RegExp(`aria-label="${name} family"`));
  const js = read('site/recipes/recipes.js');
  assert.match(js, /role="img" aria-label=/);
  assert.match(js, /window\.addEventListener\('hashchange', goToHash\)/);
  assert.match(js, /await loadCategory\(owner\.slug\)/);
  assert.match(js, /scrollIntoView/);
});

test('copy is honest about bounce, and every page states the same recipe count', () => {
  const pages = [...sitePages, 'docs/studio/index.html'];
  for (const page of pages) assert.doesNotMatch(read(page), /zero bounce|never wobbles|never bounce past/i, page);
  assert.match(read('site/recipes/index.html'), /ζ = 1 default; the 0\.7 floor allows at most about 5% overshoot/);
  assert.match(read('site/foundations/physics.html'), /most a spring may overshoot is about 5%/);
  const counts = new Set([
    /<span class="fact-number">(\d+)<\/span><span class="site-label">Motion recipes/.exec(read('site/index.html'))?.[1],
    /<li>(\d+) motion recipes/.exec(read('site/pricing.html'))?.[1],
    /(\d+) live interface motion specimens/.exec(read('site/recipes/index.html'))?.[1],
    /watch (\d+) motion examples/.exec(read('site/foundations/index.html'))?.[1],
    String(JSON.parse(read('atoms/web/index.json')).filter((r) => r.file.startsWith('blocks/')).length),
  ]);
  assert.equal(counts.size, 1, `recipe counts disagree: ${[...counts]}`);
});
