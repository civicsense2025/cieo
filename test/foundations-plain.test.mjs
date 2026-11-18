import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { FOUNDATION_CHAPTERS, foundationPages } from '../scripts/build-foundations.mjs';
import { cliCommand, exportContent } from '../docs/studio/exports.js';
import { createTheme } from '../design/index.js';

const read = (p) => readFileSync(p, 'utf8');
const pages = readdirSync('site/foundations').filter((f) => f.endsWith('.html'));
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
const JARGON = /zeta|ζ|ω|oklch|rubberband|projecttodetent|sharedaxis|morphsurface|motionframe|stagger|detent|damped|closed-form|tier|wcag/i;
const SERIF = /Iowan|Palatino|Georgia|(?<!sans-)\bserif\b/i;

test('foundations pages are exactly what the builder produces', () => {
  for (const [rel, content] of Object.entries(foundationPages())) assert.equal(read(rel), content, `${rel} is stale: run node scripts/build-foundations.mjs`);
});

test('headings, rail and index cards use plain words, never the internal names', () => {
  for (const c of FOUNDATION_CHAPTERS) assert.doesNotMatch(`${c.title} ${c.summary}`, JARGON, c.title);
  assert.deepEqual(FOUNDATION_CHAPTERS.slice(1).map((c) => c.title), ['Springs that settle', 'Motion between screens', 'Color that stays readable', 'Type and shape', 'Agents you can trust']);
  for (const page of pages) {
    const html = read(join('site/foundations', page));
    for (const [, heading] of html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)) assert.doesNotMatch(text(heading), JARGON, `${page}: "${text(heading).trim()}"`);
  }
});

test('each chapter leads with the person using the app, shows a live demo, then how to use it with real code', () => {
  for (const page of pages.filter((p) => p !== 'index.html')) {
    const html = read(join('site/foundations', page));
    const head = html.indexOf('</header>'), lab = html.indexOf('class="fnd-lab'), how = html.indexOf('How to use it');
    assert.ok(head > 0 && lab > head && how > lab, `${page}: lead, then demo, then how to use it`);
    assert.match(html, /<pre class="doc-code"><code>[\s\S]*?(createTheme|useSpring|MotionFrame|rubberBand)[\s\S]*?<\/code><\/pre>|AgentIcon/, `${page}: real code in the how-to`);
  }
});

test('technical terms are defined once, in plain words, where they first appear', () => {
  assert.match(read('site/foundations/physics.html'), /springs, which are motion that eases to rest/);
  assert.match(read('site/foundations/color.html'), /contrast, meaning how clearly text stands out/);
  assert.match(read('site/foundations/color.html'), /OKLCH, a color model where equal steps look equally different/);
  assert.match(read('site/foundations/agents.html'), /agents/);
});

test('the choreography tab strip is a real tablist with only tabs inside it', () => {
  const html = read('site/foundations/choreography.html');
  const list = /<div class="fnd-tablist" role="tablist"[^>]*>([\s\S]*?)<\/div>/.exec(html)[1];
  assert.equal([...list.matchAll(/<button\b/g)].length, 4);
  assert.doesNotMatch(list, /<span/, 'decoration lives outside the tablist');
  assert.match(html, /aria-selected="true" tabindex="0" data-step="0"/);
});

test('there is no serif face anywhere on the site, the studio or the theme sources', () => {
  const files = ['site/theme.css', 'site/site.css', 'site/doc.css', 'site/foundations/foundations.css', 'site/foundations/foundations.js', 'docs/studio/studio.css', 'docs/studio/index.html', 'docs/studio/main.js', 'design/presets.js', 'design/foundations.js', 'design/themes.css', 'scripts/lib/site-theme.mjs']
    .concat(pages.map((p) => join('site/foundations', p)));
  for (const f of files) assert.doesNotMatch(read(f).replace(/sans-serif/g, ''), SERIF, f);
  const theme = createTheme({ brand: 'instrument', ground: 'paper', radius: 'pill', elevation: 'ring' });
  assert.deepEqual(theme.tokens['font-display'].value, theme.tokens['font-sans'].value);
});

test('the Studio is a focused editor: controls, a live board of real components, and copyable exports', () => {
  const html = read('docs/studio/index.html');
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.match(html, /<h1>Theme Studio<\/h1>/);
  assert.doesNotMatch(html, /Fieldwork|Your character|orbit|hero|specimen|Every surface/i, 'no marketing hero or decorative mock');
  for (const id of ['ground', 'scheme', 'contrast', 'density', 'radius', 'elevation', 'font', 'accent']) assert.match(html, new RegExp(`id="${id}"`), id);
  assert.match(html, /id="brand-choices"/);
  const board = html.slice(html.indexOf('id="board"'), html.indexOf('aria-labelledby="export-title"'));
  for (const part of ['cieo-btn--primary', 'data-state="loading"', 'disabled=""', 'cieo-field--input', 'data-status="invalid"', 'cieo-select-native', 'role="switch"', 'cieo-card', 'cieo-p-banner', 'cieo-toast', 'cieo-table-row', 'role="tablist"']) assert.ok(board.includes(part), `board shows ${part}`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
  for (const f of ['css', 'json', 'swift', 'cli']) assert.match(html, new RegExp(`data-format="${f}"`), f);
  assert.match(html, /id="copy"/);
  assert.match(read('docs/studio/main.js'), /applyTheme\(\$\('board'\)/, 'only the board takes the edited theme');
});

test('the Studio exports every format, and the command reproduces only what differs from the default', () => {
  const theme = createTheme({ brand: 'lagoon', ground: 'paper', radius: 'pill', scheme: 'dark' });
  assert.equal(cliCommand(theme), 'npx cieo theme brand=lagoon scheme=dark radius=pill ground=paper\n');
  assert.equal(cliCommand(createTheme()), 'npx cieo theme brand=studio\n');
  assert.match(exportContent(theme, 'css'), /--cieo-color-accent/);
  assert.ok(JSON.parse(exportContent(theme, 'json')));
  assert.match(exportContent(theme, 'swift'), /\bstruct\b|\benum\b|\blet\b/);
  assert.equal(exportContent(theme, 'cli'), cliCommand(theme));
});
