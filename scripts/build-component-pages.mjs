// scripts/build-component-pages.mjs — M3-caliber interactive spec shell for every component page.
// Reads each existing site/components/<Name>.html, preserves its authored
// content (preview, code, props, do/don't, summary, prev/next), and renders
// it inside the centrally owned shell: interactive stage toolbar + telemetry HUD,
// 4-platform tabs (Preview, Web React, Web CLI/CSS, Apple SwiftUI), numbered SVG
// anatomy diagram + slotProps parts, and live FSM matrix on stateful primitives.
// Idempotent: re-running without source changes rewrites nothing.
// Run: node scripts/build-component-pages.mjs [--check]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { syncPropertyRows } from './lib/component-props.mjs';
import { scanPrimitives, importStatement } from './lib/primitives.mjs';
import { readmeHtml } from './lib/readme-html.mjs';
import { siteFooter, siteHeader, siteStyles } from './lib/site-chrome.mjs';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const check = process.argv.includes('--check');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Split-based extraction on unique markers (robust to nested divs inside content).
function between(html, start, end) {
  const a = html.indexOf(start);
  if (a === -1) throw new Error(`marker missing: ${start}`);
  const b = html.indexOf(end, a + start.length);
  if (b === -1) throw new Error(`marker missing: ${end}`);
  return html.slice(a + start.length, b);
}
const stripTrailingDiv = (s) => s.replace(/<\/div>\s*$/, '');

// Authored parts are delimited by comment markers; the pre-redesign markers stay as a fallback.
function part(html, name, legacy) {
  const a = `<!--${name}-->`, b = `<!--/${name}-->`;
  if (html.includes(a)) return between(html, a, b);
  return legacy();
}
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
const version = JSON.parse(readFileSync(`${root}/package.json`, 'utf8')).version;

const customizationMap = new Map(
  JSON.parse(readFileSync(`${root}/docs/generated/primitive-customization.json`, 'utf8')).entries.map((e) => [e.name, e]),
);

const FSM_BY_COMPONENT = {
  Button: 'asyncAction',
  CopyButton: 'asyncAction',
  ApprovalRequest: 'asyncAction',
  RunControls: 'asyncAction',
  AgentStatus: 'asyncAction',
  AgentActivity: 'asyncAction',
  AgentLanes: 'asyncAction',
  AuthSignInCard: 'asyncAction',
  AuthSignUpCard: 'asyncAction',
  AuthMfaChallenge: 'asyncAction',
  AuthPasskeyButton: 'asyncAction',
  Collapsible: 'disclosure',
  CollapsibleGroup: 'disclosure',
  Dialog: 'disclosure',
  AlertDialog: 'disclosure',
  Lightbox: 'disclosure',
  Popover: 'disclosure',
  HoverCard: 'disclosure',
  Tooltip: 'disclosure',
  ToolCallDisclosure: 'disclosure',
  MobileNav: 'disclosure',
  TopNavMegaMenu: 'disclosure',
  BottomSheet: 'sheetDetents',
  Select: 'listboxMenu',
  Selector: 'listboxMenu',
  DropdownMenu: 'listboxMenu',
  CommandPalette: 'listboxMenu',
  Typeahead: 'listboxMenu',
  MultiSelector: 'listboxMenu',
  ComplexSelector: 'listboxMenu',
  SegmentedControl: 'selection',
  ToggleButtonGroup: 'selection',
  TabList: 'selection',
  TabMenu: 'selection',
  RadioGroup: 'selection',
  BottomSheetSwitcher: 'selection',
  SortableList: 'reorder',
  TextField: 'fieldValidation',
  TextArea: 'fieldValidation',
  Field: 'fieldValidation',
  AuthEmailField: 'fieldValidation',
  AuthPasswordInput: 'fieldValidation',
  AuthOtpInput: 'fieldValidation',
  NumberInput: 'fieldValidation',
  Toast: 'toastQueue',
};

const SWIFT_COUNTERPARTS = {
  Button: `import Cieo\n\nMorphButton("Save changes", state: actionState) {\n  await save()\n}`,
  BottomSheet: `import Cieo\n\nBottomSheetPanel(isPresented: $isOpen, detents: [0.5, 0.9]) {\n  SheetBody()\n}`,
  Collapsible: `import Cieo\n\nCollapsibleSection("Details", isExpanded: $isOpen) {\n  DetailBody()\n}`,
  MotionFrame: `import Cieo\n\nCieoMotionFrame(contentKey: step, direction: dir) {\n  StepContent(step: step)\n}`,
  MorphSurface: `import Cieo\n\nCieoMorphSurface(id: "card", in: morphNamespace) {\n  CardSurface()\n}`,
  StaggerGroup: `import Cieo\n\nForEach(Array(items.enumerated()), id: \\.offset) { index, item in\n  Row(item).cieoStagger(index: index, count: items.count)\n}`,
  SegmentedControl: `import Cieo\n\nSegmentedPicker(selection: $selected, options: options)`,
  Toast: `import Cieo\n\nToastBanner(queue: toastQueue)`,
};

function swiftSnippet(dir, manifest) {
  if (SWIFT_COUNTERPARTS[dir]) return SWIFT_COUNTERPARTS[dir];
  const preset = manifest.layer === 'primitive' ? 'base' : 'snap';
  return `import Cieo\n\n// Shared Cieo tokens & Motion.${preset} spring counterpart for ${dir}\n${dir}View()\n  .environment(\\.cieoTheme, .instrument)`;
}

function extractKnobs(properties = []) {
  const skip = new Set(['className', 'slotProps', 'children', 'id', 'label', 'name', 'value', 'defaultValue']);
  const knobs = [];
  for (const p of properties) {
    if (!p || skip.has(p.id) || p.id.startsWith('on')) continue;
    if (p.type === 'boolean') {
      knobs.push({ id: p.id, kind: 'boolean', def: String(p.default ?? 'false') });
    } else if (Array.isArray(p.enum) && p.enum.length >= 2 && p.enum.length <= 8) {
      knobs.push({ id: p.id, kind: 'enum', options: p.enum.map(String) });
    }
    if (knobs.length >= 4) break;
  }
  return knobs;
}

const ANATOMY_PER_ROW = 4;
/** Every slot is drawn, in rows of four, so the diagram's markers always match the numbered list beside it. */
const anatomyRows = (parts) => Math.max(1, Math.ceil((parts.length - 1) / ANATOMY_PER_ROW));
const anatomyHeight = (parts) => 44 + anatomyRows(parts) * 52 + 4;

function renderAnatomySvg(parts) {
  const inner = parts.slice(1);
  const w = Math.floor((440 - (ANATOMY_PER_ROW - 1) * 12) / ANATOMY_PER_ROW);
  const boxes = inner.map((p, i) => {
    const x = 40 + (i % ANATOMY_PER_ROW) * (w + 12);
    const y = 30 + Math.floor(i / ANATOMY_PER_ROW) * 52;
    const label = p.length > 11 ? `${p.slice(0, 10)}…` : p;
    return `<rect x="${x}" y="${y}" width="${w}" height="40" rx="6" fill="none" stroke="currentColor" stroke-dasharray="3 3"/><circle cx="${x + 14}" cy="${y + 20}" r="9" fill="currentColor"/><text x="${x + 14}" y="${y + 24}" text-anchor="middle" font-size="10" fill="var(--cieo-color-canvas)">${i + 2}</text><text x="${x + 30}" y="${y + 24}" font-size="11" fill="currentColor">${esc(label)}</text>`;
  }).join('');
  const frameH = anatomyHeight(parts) - 28;
  return `<rect x="16" y="14" width="488" height="${frameH}" rx="10" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="30" cy="26" r="9" fill="currentColor"/><text x="30" y="30" text-anchor="middle" font-size="10" fill="var(--cieo-color-canvas)">1</text>${inner.length ? boxes : `<text x="46" y="30" font-size="11" fill="currentColor">root</text>`}`;
}

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
  const html = raw.replaceAll('<div data-dont">', '<div data-dont>');
  const title = between(html, '<title>', ' · Cieo</title>');
  const summary = part(html, 'summary', () => between(html, `</h1><p>`, `</p>`));
  const preview = part(html, 'preview', () => stripTrailingDiv(between(html, '<div data-preview>', '<div role="tablist"'))).replace(/\s+aria-modal="true"/g, '');
  const code = part(html, 'code', () => between(html, '<code data-code>', '</code>'));
  const manifest = JSON.parse(readFileSync(`${root}/src/primitives/${dir}/manifest.json`, 'utf8'));
  if (!manifest.layer || !manifest.packId) throw new Error(`${dir}: manifest needs layer and packId`);
  const level = manifest.layer[0].toUpperCase() + manifest.layer.slice(1) + (manifest.packId === 'core' ? '' : ` · ${manifest.packId[0].toUpperCase()}${manifest.packId.slice(1)} pack`);
  const propsTableHtml = html.includes('<table data-props>') ? between(html, '<table data-props>', '</table>') : html;
  const props = syncPropertyRows(between(propsTableHtml, '<tbody>', '</tbody>'), manifest.properties);
  const doing = part(html, 'do', () => stripTrailingDiv(between(html, '<div data-do>', '<div data-dont>')));
  const dont = part(html, 'dont', () => stripTrailingDiv(between(html, '<div data-dont>', '</section>')));
  const prev = between(html, '<a data-prev', '</a>');
  const next = between(html, '<a data-next', '</a>');
  const importLine = importStatement(dir, values);
  const readme = `${root}/src/primitives/${dir}/README.md`;
  const guide = existsSync(readme) ? readmeHtml(readFileSync(readme, 'utf8')) : '';
  const tokens = tokensOf(dir);

  const cust = customizationMap.get(dir) ?? { status: 'named-slots', parts: ['root'] };
  const parts = cust.parts?.length ? cust.parts : ['root'];
  const knobs = extractKnobs(manifest.properties);
  const fsmKind = FSM_BY_COMPONENT[dir] ?? null;
  const cliSnippet = `npx cieo add ${dir}\n/* Root selector: .cieo-${kebab(dir)} (${cust.status})${tokens.length ? `\n   Tokens: ${tokens.slice(0, 5).join(', ')}` : ''} */`;
  const swiftCode = swiftSnippet(dir, manifest);

  const rail = [
    ['usage', 'Usage'],
    ['anatomy', 'Anatomy'],
    fsmKind && ['state-machine', 'State machine'],
    ['props', 'Properties'],
    guide && ['guide', 'Guide'],
    ['best', 'Best practices'],
    tokens.length && ['tokens', 'Tokens'],
  ].filter(Boolean).map(([id, label]) => `<a href="#${id}">${label}</a>`).join('');

  const anatomySection = `<section id="anatomy" aria-labelledby="anatomy-h"><h2 id="anatomy-h">Anatomy</h2><figure class="doc-anatomy"><svg data-anatomy-svg viewBox="0 0 520 ${anatomyHeight(parts)}" role="img" aria-label="${esc(title)} anatomy">${renderAnatomySvg(parts)}</svg><ol class="doc-anatomy-list">${parts.map((p, i) => `<li><b>${i + 1}</b><code>slotProps.${esc(p)}</code></li>`).join('')}</ol></figure></section>`;
  const fsmSection = fsmKind
    ? `<section id="state-machine" data-fsm-machine="${fsmKind}" aria-labelledby="fsm-h"><h2 id="fsm-h">State machine</h2><p>Interactive <code>${fsmKind}</code> state transitions and <code>TransitionEnvelope</code> output from <code>cieo/state</code>.</p><div class="doc-fsm" data-fsm-mount></div></section>`
    : '';

  const out = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} · Cieo</title>${siteStyles('../', true)}</head><body class="cieo cieo-docsite cieo-site">${siteHeader('../', 'Library')}<main id="main"><div class="doc-shell"><nav class="doc-rail" aria-label="On this page"><span class="doc-label">On this page</span>${rail}</nav><div class="doc-main"><header class="doc-head"><p class="doc-crumbs"><a href="./">Library</a><span aria-hidden="true">/</span><span class="doc-level"><span data-level>${level}</span></span></p><h1>${title}</h1><p><!--summary-->${summary}<!--/summary--></p></header><section id="usage" aria-labelledby="usage-h"><h2 id="usage-h">Usage</h2><div class="cieo-import-banner" data-import-banner><p>Use the import, not the markup. Copy this line into your code; never paste the preview HTML below.</p><pre><code data-import>${importLine}</code></pre><button type="button" class="doc-button" data-copy-import>Copy import</button></div><div class="doc-example"><div class="doc-tabs" role="tablist" aria-label="Example views"><button type="button" role="tab" id="tab-preview" aria-controls="panel-preview" aria-selected="true">Preview</button><button type="button" role="tab" id="tab-code" aria-controls="panel-code" aria-selected="false" tabindex="-1">Web (React)</button><button type="button" role="tab" id="tab-cli" aria-controls="panel-cli" aria-selected="false" tabindex="-1">Web (CLI / CSS)</button><button type="button" role="tab" id="tab-swift" aria-controls="panel-swift" aria-selected="false" tabindex="-1">Apple (SwiftUI)</button></div><div class="doc-stage-bar" data-stage-toolbar data-component="${dir}" data-knobs="${esc(JSON.stringify(knobs))}"></div><div class="doc-telemetry" data-telemetry aria-live="polite">preset base · ω 22 rad/s · ζ 1.00 · settle 418 ms (1×) · 0.0% overshoot</div><div class="doc-stage" role="tabpanel" id="panel-preview" aria-labelledby="tab-preview" data-preview><!--preview-->${preview}<!--/preview--></div><pre class="doc-code" role="tabpanel" id="panel-code" aria-labelledby="tab-code" hidden><code data-code><!--code-->${code}<!--/code--></code></pre><pre class="doc-code" role="tabpanel" id="panel-cli" aria-labelledby="tab-cli" hidden><code data-cli>${esc(cliSnippet)}</code></pre><pre class="doc-code" role="tabpanel" id="panel-swift" aria-labelledby="tab-swift" hidden><code data-swift>${esc(swiftCode)}</code></pre></div></section>${anatomySection}${fsmSection}<section id="props" aria-labelledby="props-h"><h2 id="props-h">Properties</h2><div class="doc-table-wrap"><table data-props><thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody>${props}</tbody></table></div></section>${guide ? `<section id="guide" aria-labelledby="guide-h"><h2 id="guide-h">Guide</h2><div class="doc-guide">${guide}</div></section>` : ''}<section id="best" aria-labelledby="best-h"><h2 id="best-h">Best practices</h2><div class="doc-verdicts"><div data-do><!--do-->${doing}<!--/do--></div><div data-dont><!--dont-->${dont}<!--/dont--></div></div></section>${tokens.length ? `<section id="tokens" aria-labelledby="tokens-h"><h2 id="tokens-h">Tokens</h2><p>The stylesheet reads these tokens, so a theme restyles the component without overrides.</p><ul class="doc-tokens">${tokens.map((t) => `<li>${t}</li>`).join('')}</ul></section>` : ''}<footer class="doc-foot"><code data-install>npm install github:civicsense2025/cieo#v${version}</code><a data-workbench href="../recipes/">Explore Motion Recipes</a><nav aria-label="Components"><a data-prev${prev}</a><a data-next${next}</a></nav></footer></div></div></main>${siteFooter('../')}<script type="module" src="../doc-playground.js"></script></body></html>`;

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
