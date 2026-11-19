#!/usr/bin/env node
// Builds the route-split /recipes/ portal from atoms/web:
// - site/recipes/index.html (< 40 KB shell with unified siteHeader/siteFooter and Cieo token bridge)
// - site/recipes/recipes.css (stage & card layout bridged onto --cieo-* semantic tokens)
// - site/recipes/runtime.js (ES module runtime wrapping runtime.core.js + shared helpers)
// - site/recipes/chunks/<slug>.js (50 lazy-loaded category ES module chunks, minified via Vite)
// - site/recipes/recipes.js (lazy IntersectionObserver loader, search/category/family filters, slow-mo clock, theme switcher)
// Usage: node scripts/build-recipes.mjs [--check]
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minifySync } from 'vite';
import { brands } from '../design/index.js';
import { siteFooter, siteHeader, siteStyles } from './lib/site-chrome.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const atomsDir = join(root, 'atoms/web');
const outDir = join(root, 'site/recipes');
const chunksDir = join(outDir, 'chunks');

const readAtom = (rel) => readFileSync(join(atomsDir, rel), 'utf8');
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const indexRecords = JSON.parse(readAtom('index.json')).filter((r) => r.file.startsWith('blocks/'));
const blocksList = JSON.parse(readAtom('blocks.json'));
const sharedFiles = blocksList.filter((f) => f.includes('-shared.js') && f !== 'blocks/000-shared.js');

// Map every primitive directory for bidirectional recipe <-> component links
const componentDirs = readdirSync(join(root, 'src/primitives'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const compByKey = new Map();
for (const dir of componentDirs) {
  compByKey.set(dir.toLowerCase(), dir);
  compByKey.set(slugify(dir).replace(/-/g, ''), dir);
}
const MANUAL_COMP_MAP = {
  tabs: 'TabList',
  accordion: 'Collapsible',
  alert: 'Banner',
  sheet: 'BottomSheet',
  sheetdetents: 'BottomSheet',
  drawer: 'BottomSheet',
  sidesheet: 'BottomSheet',
  palette: 'CommandPalette',
  cmdpalette: 'CommandPalette',
  dropdown: 'DropdownMenu',
  submenu: 'DropdownMenuSubMenu',
  navmenu: 'TopNavMenu',
  mega: 'TopNavMegaMenu',
  navbar: 'TopNav',
  mobilemenu: 'MobileNav',
  radio: 'RadioGroup',
  togglegroup: 'ToggleButtonGroup',
  reorder: 'SortableList',
  field: 'TextField',
  longanswer: 'TextArea',
  numstep: 'NumberInput',
  range: 'Slider',
  search: 'SearchInput',
  copy: 'Button',
  avatars: 'AvatarGroup',
  tablesort: 'Table',
  BeforeAfter: 'CompareCurtain',
  beforeafter: 'CompareCurtain',
  player: 'AudioPlayer',
  agentstatus: 'AgentStatus',
  agentcursor: 'AgentActivity',
  agentpin: 'ApprovalRequest',
};

export function matchComponentForRecipe(rec) {
  if (MANUAL_COMP_MAP[rec.id] && compByKey.has(MANUAL_COMP_MAP[rec.id].toLowerCase())) {
    return MANUAL_COMP_MAP[rec.id];
  }
  const cleanId = rec.id.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (compByKey.has(cleanId)) return compByKey.get(cleanId);
  const cleanName = rec.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (compByKey.has(cleanName)) return compByKey.get(cleanName);
  return null;
}

// Group block files by category in canonical appearance order
const categoryByFile = new Map();
const categoryMeta = new Map();
for (const rec of indexRecords) {
  categoryByFile.set(rec.file, rec.category);
  if (!categoryMeta.has(rec.category)) {
    categoryMeta.set(rec.category, {
      name: rec.category,
      slug: slugify(rec.category),
      files: [],
      items: [],
    });
  }
  const comp = matchComponentForRecipe(rec);
  categoryMeta.get(rec.category).items.push({
    id: rec.id,
    name: rec.name,
    summary: rec.summary,
    api: rec.api || '',
    component: comp,
  });
}

for (const file of blocksList) {
  if (file.includes('-shared.js')) continue;
  const cat = categoryByFile.get(file);
  if (cat && categoryMeta.has(cat)) {
    categoryMeta.get(cat).files.push(file);
  }
}

const categories = [...categoryMeta.values()].filter((c) => c.files.length > 0);

function compactEmbeddedHtmlCss(source) {
  return source
    .replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => {
      const c = css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s*\n\s*/g, '')
        .replace(/\s*([{:;,>~+])\s*/g, '$1')
        .replace(/;}/g, '}');
      return `<style>${c}</style>`;
    })
    .replace(/>\n\s+</g, '><');
}

function buildRuntimeModule() {
  const core = readAtom('runtime.core.js');
  const shared = sharedFiles.map((f) => readAtom(f)).join('\n');
  const raw = `${core}\n${shared}\nexport const recipeCore = {\n  S, EXIT, LAG, BLUR, STAGGER_MAX, ARRIVE, staggerAt, segmented, pollTally,\n  clock, now, clamp, lerp, px, $, $$, motionReduced, motionSettings,\n  resp, prog, Track, edges, Swap, Digits, drag, rb, mix, fade,\n  size, reflow, scrollState, frameLayout, money, measureW,\n  scene, ic, I, pop, openSet, outside, plate, relRect, wordSpans, bandColor, mapBg,\n  get PhotoKit() { return globalThis.PhotoKit; }\n};\n`;
  const res = minifySync('runtime.js', raw);
  if (res.errors?.length) throw new Error(`Failed minifying runtime.js: ${res.errors[0].message}`);
  return res.code;
}

function buildCategoryChunk(cat) {
  const body = cat.files
    .map((f) => `{\nconst __file = ${JSON.stringify(f)};\n${compactEmbeddedHtmlCss(readAtom(f)).replace(/\batom\s*\(/g, 'atomWithFile(__file, ')}\n}`)
    .join('\n');
  const src = `export function mountCategory(ctx) {\n  const { atom, S, EXIT, LAG, BLUR, STAGGER_MAX, ARRIVE, staggerAt, segmented, pollTally, clock, now, clamp, lerp, px, $, $$, motionReduced, motionSettings, resp, prog, Track, edges, Swap, Digits, drag, rb, mix, fade, size, reflow, scrollState, frameLayout, money, measureW, scene, ic, I, pop, openSet, outside, plate, relRect, wordSpans, bandColor, mapBg, PhotoKit } = ctx;\n  const atomWithFile = (file, o) => { o.file = file; atom(o); };\n${body}\n}\n`;
  const res = minifySync(`${cat.slug}.js`, src);
  if (res.errors?.length) throw new Error(`Failed minifying chunk ${cat.slug}: ${res.errors[0].message}`);
  return res.code;
}

const BRIDGE_CSS = `:root, .cieo-recipes-scope {
  --bg: var(--cieo-color-canvas);
  --tile: var(--cieo-color-surface);
  --card: var(--cieo-color-surface);
  --raised: var(--cieo-color-sunken);
  --surface: var(--cieo-color-surface);
  --ink: var(--cieo-color-text);
  --muted: var(--cieo-color-muted);
  --faint: var(--cieo-color-subtle);
  --line: var(--cieo-color-border);
  --line-soft: color-mix(in oklab, var(--cieo-color-border) 62%, transparent);
  --accent: var(--cieo-color-accent);
  --accent-tint: color-mix(in oklab, var(--cieo-color-accent) 12%, var(--cieo-color-surface));
  --success: var(--cieo-color-success);
  --success-tint: color-mix(in oklab, var(--cieo-color-success) 14%, var(--cieo-color-surface));
  --danger: var(--cieo-color-danger);
  --danger-tint: color-mix(in oklab, var(--cieo-color-danger) 14%, var(--cieo-color-surface));
  --warning: var(--cieo-color-warning);
  --warning-tint: color-mix(in oklab, var(--cieo-color-warning) 14%, var(--cieo-color-surface));
  --shadow: none;
  --shadow-soft: 0 1px 2px color-mix(in oklab, var(--cieo-color-text) 6%, transparent), 0 10px 28px color-mix(in oklab, var(--cieo-color-text) 7%, transparent);
  --sans: var(--cieo-font-sans);
  --mono: var(--cieo-font-mono);
}`;

function buildRecipesCss() {
  return `/* Generated by scripts/build-recipes.mjs — Cieo token-bridged recipe gallery styles */
.recipes-toolbar {
  background: var(--cieo-color-canvas);
  border-block: var(--cieo-border-width) solid var(--cieo-color-border);
  padding-block: var(--cieo-space-3);
  margin-block-end: var(--cieo-space-8);
}
/* On wide screens the toolbar stays under the sticky site header; on phones it scrolls away, since it wraps to several rows. */
@media (min-width: 64rem) {
  .recipes-toolbar { position: sticky; top: var(--site-header-h); z-index: var(--cieo-layer-sticky); }
}
.recipes-toolbar-inner {
  max-width: 84rem;
  margin-inline: auto;
  padding-inline: var(--cieo-space-6);
  display: flex;
  flex-wrap: wrap;
  gap: var(--cieo-space-3);
  align-items: center;
}
.recipes-search {
  flex: 1 1 14rem;
  min-width: 12rem;
  min-height: 2.25rem;
  padding: 0 var(--cieo-space-3);
  border: var(--cieo-border-width) solid var(--cieo-color-border-strong);
  border-radius: var(--cieo-radius-control);
  background: var(--cieo-color-surface);
  color: var(--cieo-color-text);
  font: inherit;
  font-size: var(--cieo-text-small);
}
.recipes-select {
  min-height: 2.25rem;
  padding: 0 var(--cieo-space-3);
  border: var(--cieo-border-width) solid var(--cieo-color-border-strong);
  border-radius: var(--cieo-radius-control);
  background: var(--cieo-color-surface);
  color: var(--cieo-color-text);
  font: inherit;
  font-size: var(--cieo-text-small);
}
.recipes-seg {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: var(--cieo-border-width) solid var(--cieo-color-border-strong);
  border-radius: var(--cieo-radius-control);
  background: var(--cieo-color-sunken);
}
.recipes-seg button {
  border: 0;
  background: transparent;
  color: var(--cieo-color-muted);
  font: inherit;
  font-size: var(--cieo-text-caption);
  font-weight: var(--cieo-weight-medium);
  padding: var(--cieo-space-1) var(--cieo-space-2);
  border-radius: var(--cieo-radius-small);
  cursor: pointer;
}
/* Selected is ink on paper, never a faint fill alone. */
.recipes-seg button[aria-pressed="true"] {
  background: var(--cieo-color-accent);
  color: var(--cieo-color-on-accent);
}
@media (pointer: coarse) {
  .recipes-search, .recipes-select, .recipes-seg button { min-height: var(--cieo-touch-target); }
  .recipes-seg button { min-width: var(--cieo-touch-target); }
  .recipe-comp-link, .tile > footer summary { display: inline-flex; align-items: center; min-height: var(--cieo-touch-target); }
}
.recipes-count {
  margin-inline-start: auto;
  font-size: var(--cieo-text-caption);
  color: var(--cieo-color-muted);
  font-variant-numeric: tabular-nums;
}
.recipes-wrap {
  max-width: 84rem;
  margin-inline: auto;
  padding-inline: var(--cieo-space-6);
  padding-block-end: var(--cieo-space-16);
}
.recipe-groups {
  display: flex;
  flex-direction: column;
  gap: var(--cieo-space-12);
}
.recipe-group {
  display: flex;
  flex-direction: column;
  gap: var(--cieo-space-4);
  scroll-margin-top: calc(var(--site-header-h) + 6rem);
}
.recipe-group-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--cieo-space-3);
  border-block-end: var(--cieo-border-width) solid var(--cieo-color-border);
  padding-block-end: var(--cieo-space-2);
}
.recipe-group-head h2 {
  margin: 0;
  font-size: var(--cieo-text-title);
  font-weight: var(--cieo-weight-strong);
}
.recipe-group-meta {
  font-size: var(--cieo-text-caption);
  color: var(--cieo-color-muted);
  font-variant-numeric: tabular-nums;
}
.recipe-grid {
  display: grid;
  gap: var(--cieo-space-6);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 23rem), 1fr));
}
.tile {
  background: var(--cieo-color-surface);
  border: var(--cieo-border-width) solid var(--cieo-color-border);
  border-radius: var(--cieo-radius-surface);
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}
.tile.wide { grid-column: 1 / -1; }
.tile > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--cieo-space-2);
  padding: var(--cieo-space-4) var(--cieo-space-4) 0;
}
.tile h3 {
  font-size: var(--cieo-text-small);
  font-weight: var(--cieo-weight-strong);
  margin: 0;
}
.fam { display: flex; gap: 4px; margin-inline-start: auto; }
.fam span {
  font-size: var(--cieo-text-caption);
  font-weight: var(--cieo-weight-strong);
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: var(--cieo-radius-small);
  display: grid;
  place-items: center;
  background: var(--cieo-color-sunken);
  color: var(--cieo-color-muted);
}
.tile .block {
  font-size: var(--cieo-text-caption);
  color: var(--cieo-color-subtle);
  padding: 2px var(--cieo-space-4) 0;
  display: flex;
  justify-content: space-between;
  gap: var(--cieo-space-2);
}
.recipe-comp-link {
  color: var(--cieo-color-accent);
  text-decoration: none;
  font-weight: var(--cieo-weight-medium);
}
@media (hover: hover) { .recipe-comp-link:hover { text-decoration: underline; } }
.stage {
  position: relative;
  height: 300px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  user-select: none;
  -webkit-user-select: none;
  overflow: hidden;
  margin-top: 6px;
  color: var(--ink);
  font: var(--cieo-text-small)/1.45 var(--sans);
}
.tile.tall .stage, .tile.big .stage { height: 380px; }
.tile.wide.tall .stage { height: 540px; }
.tile > footer {
  padding: var(--cieo-space-3) var(--cieo-space-4) var(--cieo-space-4);
  border-block-start: var(--cieo-border-width) solid var(--cieo-color-border);
  display: flex;
  flex-direction: column;
  gap: var(--cieo-space-2);
  margin-top: auto;
}
.tile > footer summary {
  cursor: pointer;
  font-size: var(--cieo-text-caption);
  color: var(--cieo-color-muted);
  user-select: none;
}
.tile > footer p {
  margin: var(--cieo-space-2) 0;
  color: var(--cieo-color-muted);
  font-size: var(--cieo-text-caption);
}
.tile pre {
  margin: 0;
  font: var(--cieo-text-caption)/1.5 var(--cieo-font-mono);
  background: var(--cieo-color-canvas);
  border: var(--cieo-border-width) solid var(--cieo-color-border);
  border-radius: var(--cieo-radius-surface);
  padding: 8px 10px;
  overflow-x: auto;
}
.hint {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: var(--cieo-text-caption);
  color: var(--faint);
  pointer-events: none;
}
.ro { position: absolute; top: 10px; right: 14px; font-size: var(--cieo-text-caption); color: var(--faint); font-variant-numeric: tabular-nums; }
.btn { border: var(--cieo-border-width) solid var(--line); background: var(--card); color: var(--ink); border-radius: var(--cieo-radius-control); padding: 6px 12px; font-size: 13px; font-weight: 500; cursor: pointer; }
.btn.ink { background: var(--ink); color: var(--card); border-color: var(--ink); }
.card { background: var(--card); border-radius: var(--cieo-radius-surface); }
.layer { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; }
.digits { display: inline-flex; font-variant-numeric: tabular-nums; }
.dslot { position: relative; display: inline-block; height: 1.25em; overflow: hidden; vertical-align: bottom; }
.dslot .dl { position: absolute; left: 0; right: 0; top: 0; text-align: center; }
.pill { position: absolute; border-radius: 999px; }
.row { display: flex; align-items: center; gap: 10px; }
.col { display: flex; flex-direction: column; gap: 10px; }
.muted { color: var(--muted); }
.small { font-size: 13px; }
.num { font-variant-numeric: tabular-nums; }
.recipe-placeholder {
  padding: var(--cieo-space-8);
  text-align: center;
  color: var(--cieo-color-muted);
  font-size: var(--cieo-text-small);
  border: var(--cieo-border-width) dashed var(--cieo-color-border);
  border-radius: var(--cieo-radius-surface);
}
`;
}

function buildRecipesJs() {
  const loaderEntries = categories
    .map((c) => `  ${JSON.stringify(c.slug)}: () => import('./chunks/${c.slug}.js')`)
    .join(',\n');
  const manifestData = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    count: c.items.length,
    items: c.items,
  }));

  return `// Generated by scripts/build-recipes.mjs — lazy category chunk loader & interactive stage controller
import { recipeCore } from './runtime.js';
import { createTheme, variables } from '../../design/index.js';

const CHUNK_LOADERS = {
${loaderEntries}
};

const CATEGORIES = ${JSON.stringify(manifestData)};
const FAM_NAMES = { M: 'Morph', S: 'Swap', D: 'Drag', E: 'Edges', X: 'Enter/Exit', T: 'Time' };
const COMP_BY_ID = new Map();
for (const c of CATEGORIES) for (const it of c.items) if (it.component) COMP_BY_ID.set(it.id, it.component);

const groupsRoot = document.getElementById('recipe-groups');
const searchInput = document.querySelector('[data-recipe-search]');
const catSelect = document.querySelector('[data-recipe-cat]');
const famButtons = [...document.querySelectorAll('[data-recipe-fam] button')];
const speedButtons = [...document.querySelectorAll('[data-recipe-speed] button')];
const brandSelect = document.querySelector('[data-recipe-brand]');
const schemeSelect = document.querySelector('[data-recipe-scheme]');
const countOut = document.querySelector('[data-recipe-count]');

let activeFam = '*';
let activeCat = '*';
let activeQuery = '';
const mountedAtoms = [];
const loadedSlugs = new Set();
const loadingSlugs = new Map();
const sectionMap = new Map();

let rafId = 0;
function ensureLoop() {
  if (rafId || document.hidden) return;
  const anyVisible = mountedAtoms.some((a) => a.visible && a.render && !a.el.hidden);
  if (!anyVisible) return;
  recipeCore.clock.last = performance.now();
  rafId = requestAnimationFrame(tick);
}

function tick(ms) {
  rafId = 0;
  if (document.hidden) return;
  const dt = Math.min(0.05, Math.max(0, (ms - recipeCore.clock.last) / 1000));
  recipeCore.clock.last = ms;
  recipeCore.clock.t += dt * recipeCore.clock.scale;
  const t = recipeCore.clock.t;
  let stillVisible = false;
  for (const a of mountedAtoms) {
    if (a.visible && a.render && !a.el.hidden) {
      stillVisible = true;
      try { a.render(t); } catch { a.render = null; }
    }
  }
  if (stillVisible) rafId = requestAnimationFrame(tick);
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) ensureLoop();
});

const tileObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const a = entry.target.__cieoAtom;
    if (!a) continue;
    if (entry.isIntersecting && !a.inited) {
      a.inited = true;
      const stage = a.el.querySelector('.stage');
      try { a.render = stage ? a.init(stage) : null; } catch { a.render = null; }
    }
    a.visible = entry.isIntersecting;
  }
  ensureLoop();
}, { rootMargin: '320px' });

function createTile(a) {
  const el = document.createElement('article');
  el.className = 'tile' + (a.wide ? ' wide' : '') + (a.tall ? ' tall' : '') + (a.big ? ' big' : '');
  el.id = a.id;
  const fams = (a.fam || []).map((f) => \`<span role="img" aria-label="\${FAM_NAMES[f] || f}" title="\${FAM_NAMES[f] || f}">\${f}</span>\`).join('');
  const comp = COMP_BY_ID.get(a.id);
  const compHtml = comp ? \`<a class="recipe-comp-link" href="../components/\${comp}.html">\${comp} spec →</a>\` : '';
  el.innerHTML = \`<header><h3></h3><div class="fam">\${fams}</div></header><div class="block"><span data-block-name></span>\${compHtml}</div><div class="stage">\${a.html}</div><footer><details><summary>Formula &amp; source (\${a.file || 'atoms/web'})</summary><p data-desc></p><pre data-api></pre></details></footer>\`;
  el.querySelector('h3').textContent = a.name;
  el.querySelector('[data-block-name]').textContent = a.block || a.cat;
  el.querySelector('[data-desc]').textContent = a.desc || '';
  el.querySelector('[data-api]').textContent = a.api || '';
  el.__cieoAtom = a;
  a.el = el;
  a.inited = false;
  a.visible = false;
  a.render = null;
  // Wake loop on direct pointer/key interaction inside stage
  el.addEventListener('pointerdown', () => ensureLoop(), { passive: true });
  el.addEventListener('keydown', () => ensureLoop(), { passive: true });
  tileObserver.observe(el);
  return el;
}

async function loadCategory(slug) {
  if (loadedSlugs.has(slug)) return;
  if (loadingSlugs.has(slug)) return loadingSlugs.get(slug);
  const loader = CHUNK_LOADERS[slug];
  if (!loader) return;
  const p = loader().then((mod) => {
    const collected = [];
    mod.mountCategory({
      ...recipeCore,
      atom(o) { collected.push(o); },
    });
    loadedSlugs.add(slug);
    const sec = sectionMap.get(slug);
    if (!sec) return;
    const grid = sec.querySelector('.recipe-grid');
    grid.innerHTML = '';
    for (const a of collected) {
      mountedAtoms.push(a);
      const tile = createTile(a);
      if (a.wide) grid.insertBefore(tile, grid.querySelector('.tile:not(.wide)'));
      else grid.appendChild(tile);
    }
    applyFilters();
  });
  loadingSlugs.set(slug, p);
  return p;
}

const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const slug = entry.target.dataset.slug;
      if (slug) loadCategory(slug);
    }
  }
}, { rootMargin: '600px' });

function matchesMeta(item, catName) {
  if (activeCat !== '*' && catName !== activeCat) return false;
  if (!activeQuery) return true;
  const q = activeQuery;
  return item.name.toLowerCase().includes(q) ||
    item.id.toLowerCase().includes(q) ||
    catName.toLowerCase().includes(q) ||
    item.summary.toLowerCase().includes(q) ||
    item.api.toLowerCase().includes(q);
}

function matchesAtom(a) {
  if (activeCat !== '*' && a.cat !== activeCat) return false;
  if (activeFam !== '*' && !(a.fam || []).includes(activeFam)) return false;
  if (!activeQuery) return true;
  const q = activeQuery;
  return a.name.toLowerCase().includes(q) ||
    a.id.toLowerCase().includes(q) ||
    a.cat.toLowerCase().includes(q) ||
    (a.desc || '').toLowerCase().includes(q) ||
    (a.api || '').toLowerCase().includes(q);
}

function applyFilters() {
  let totalVisible = 0;
  for (const cat of CATEGORIES) {
    const sec = sectionMap.get(cat.slug);
    if (!sec) continue;
    if (loadedSlugs.has(cat.slug)) {
      const tiles = [...sec.querySelectorAll('.tile')];
      let shown = 0;
      for (const tile of tiles) {
        const ok = matchesAtom(tile.__cieoAtom);
        tile.hidden = !ok;
        if (ok) shown += 1;
      }
      sec.hidden = shown === 0;
      totalVisible += shown;
    } else {
      if (activeFam !== '*' || activeQuery || activeCat === cat.name) {
        const metaHits = cat.items.filter((it) => matchesMeta(it, cat.name)).length;
        sec.hidden = metaHits === 0;
        if (metaHits > 0 && (activeFam !== '*' || activeQuery || activeCat === cat.name)) {
          loadCategory(cat.slug);
        }
        totalVisible += metaHits;
      } else {
        const showSec = activeCat === '*' || activeCat === cat.name;
        sec.hidden = !showSec;
        if (showSec) totalVisible += cat.count;
      }
    }
  }
  if (countOut) countOut.textContent = \`\${totalVisible} \${totalVisible === 1 ? 'recipe' : 'recipes'}\`;
  ensureLoop();
}

function initSections() {
  for (const cat of CATEGORIES) {
    const sec = document.createElement('section');
    sec.className = 'recipe-group';
    sec.id = 'cat-' + cat.slug;
    sec.dataset.slug = cat.slug;
    sec.innerHTML = \`<div class="recipe-group-head"><h2>\${cat.name}</h2><span class="recipe-group-meta">\${cat.count} recipes</span></div><div class="recipe-grid"><div class="recipe-placeholder">Loading \${cat.name} recipes…</div></div>\`;
    groupsRoot.appendChild(sec);
    sectionMap.set(cat.slug, sec);
    sectionObserver.observe(sec);
  }
  // Eagerly hydrate the first category; deep links are handled by goToHash, on load and on every hash change.
  if (CATEGORIES[0]) loadCategory(CATEGORIES[0].slug);
  goToHash();
}

// Load the category that owns the hash target, then scroll to it. A filter that hides the target is cleared first.
async function goToHash() {
  let hashId = location.hash.slice(1);
  try { hashId = decodeURIComponent(hashId); } catch { /* keep the raw hash */ }
  if (!hashId) return;
  const owner = CATEGORIES.find((c) => 'cat-' + c.slug === hashId || c.items.some((it) => it.id === hashId));
  if (!owner) return;
  await loadCategory(owner.slug);
  let target = document.getElementById(hashId);
  if (target?.hidden || target?.closest('[hidden]')) {
    activeQuery = ''; activeCat = '*'; activeFam = '*';
    if (searchInput) searchInput.value = '';
    if (catSelect) catSelect.value = '*';
    famButtons.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.fam || '*') === '*')));
    applyFilters();
    target = document.getElementById(hashId);
  }
  target?.scrollIntoView({ block: 'start' });
}
window.addEventListener('hashchange', goToHash);

searchInput?.addEventListener('input', () => {
  activeQuery = searchInput.value.trim().toLowerCase();
  applyFilters();
});

catSelect?.addEventListener('change', () => {
  activeCat = catSelect.value;
  applyFilters();
});

famButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    activeFam = btn.dataset.fam || '*';
    famButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    applyFilters();
  });
});

speedButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const s = Number(btn.dataset.speed || '1');
    recipeCore.clock.scale = s;
    speedButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    ensureLoop();
  });
});

function applyLiveTheme() {
  const brand = brandSelect?.value || 'instrument';
  const schemePref = schemeSelect?.value || 'system';
  const scheme = schemePref === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : schemePref;
  const theme = createTheme({ brand, ground: 'paper', scheme, radius: 'pill', density: 'comfortable' });
  const vars = variables(theme);
  for (const [k, v] of Object.entries(vars)) document.documentElement.style.setProperty(k, v);
  document.documentElement.style.colorScheme = scheme;
}

brandSelect?.addEventListener('change', applyLiveTheme);
schemeSelect?.addEventListener('change', applyLiveTheme);

initSections();
applyFilters();
`;
}

function buildRecipesHtml() {
  const totalRecipes = indexRecords.length;
  const brandOpts = Object.entries(brands)
    .map(([id, b]) => `<option value="${esc(id)}"${id === 'instrument' ? ' selected' : ''}>Brand: ${esc(b.label || id)}</option>`)
    .join('');
  const catOpts = categories
    .map((c) => `<option value="${esc(c.name)}">${esc(c.name)} (${c.items.length})</option>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Motion Recipes · Cieo</title>
<meta name="description" content="Explore ${totalRecipes} interactive closed-form spring motion recipes across ${categories.length} categories, lazy-loaded by route and themed by Cieo tokens.">
<meta name="color-scheme" content="light dark">
${siteStyles('../')}
<link rel="stylesheet" href="./recipes.css">
<style>${BRIDGE_CSS}</style>
</head>
<body class="cieo cieo-site cieo-recipes-scope">
${siteHeader('../', 'Recipes')}
<main id="main">
  <section class="site-wrap site-hero">
    <h1 class="site-display">Motion recipes.</h1>
    <p class="site-lead">${totalRecipes} live motion examples. Slow them down, read the formula, open the part.</p>
  </section>
  <div class="recipes-toolbar" data-recipes-toolbar role="region" aria-label="Recipe filters and playback controls">
    <div class="recipes-toolbar-inner">
      <input class="recipes-search" type="search" data-recipe-search placeholder="Filter ${totalRecipes} recipes, categories, or formulas…" aria-label="Filter motion recipes">
      <select class="recipes-select" data-recipe-cat aria-label="Filter by category">
        <option value="*">All categories (${totalRecipes})</option>
        ${catOpts}
      </select>
      <div class="recipes-seg" data-recipe-fam role="group" aria-label="Motion family">
        <button type="button" data-fam="*" aria-pressed="true" aria-label="All families">All</button>
        <button type="button" data-fam="M" aria-pressed="false" title="Morph" aria-label="Morph family">M</button>
        <button type="button" data-fam="S" aria-pressed="false" title="Swap" aria-label="Swap family">S</button>
        <button type="button" data-fam="D" aria-pressed="false" title="Drag" aria-label="Drag family">D</button>
        <button type="button" data-fam="E" aria-pressed="false" title="Edges" aria-label="Edges family">E</button>
        <button type="button" data-fam="X" aria-pressed="false" title="Enter and exit" aria-label="Enter and exit family">X</button>
        <button type="button" data-fam="T" aria-pressed="false" title="Time" aria-label="Time family">T</button>
      </div>
      <div class="recipes-seg" data-recipe-speed role="group" aria-label="Slow-motion time dilation">
        <button type="button" data-speed="1" aria-pressed="true">1×</button>
        <button type="button" data-speed="0.25" aria-pressed="false">0.25×</button>
        <button type="button" data-speed="0.1" aria-pressed="false">0.1×</button>
      </div>
      <select class="recipes-select" data-recipe-brand aria-label="Brand theme">${brandOpts}</select>
      <select class="recipes-select" data-recipe-scheme aria-label="Color scheme">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <output class="recipes-count" data-recipe-count aria-live="polite">${totalRecipes} recipes</output>
    </div>
  </div>
  <div class="recipes-wrap">
    <div id="recipe-groups" class="recipe-groups"></div>
  </div>
</main>
${siteFooter('../')}
<script type="module" src="./recipes.js"></script>
</body>
</html>
`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outputs = new Map();
  outputs.set(join(outDir, 'runtime.js'), buildRuntimeModule());
  outputs.set(join(outDir, 'recipes.css'), buildRecipesCss());
  outputs.set(join(outDir, 'recipes.js'), buildRecipesJs());
  outputs.set(join(outDir, 'index.html'), buildRecipesHtml());
  for (const cat of categories) {
    outputs.set(join(chunksDir, `${cat.slug}.js`), buildCategoryChunk(cat));
  }

  if (check) {
    let stale = 0;
    for (const [file, content] of outputs) {
      const cur = existsSync(file) ? readFileSync(file, 'utf8') : null;
      if (cur !== content) {
        console.error(`stale: ${file}`);
        stale += 1;
      }
    }
    if (stale) process.exit(1);
    console.log(`recipes verified: ${categories.length} chunks`);
  } else {
    rmSync(chunksDir, { recursive: true, force: true });
    mkdirSync(chunksDir, { recursive: true });
    for (const [file, content] of outputs) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, content);
    }
    const shellKb = (Buffer.byteLength(outputs.get(join(outDir, 'index.html'))) / 1024).toFixed(1);
    console.log(`build-recipes: ${indexRecords.length} recipes across ${categories.length} lazy chunks (shell ${shellKb} KB)`);
  }
}
