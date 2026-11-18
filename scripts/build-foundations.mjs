#!/usr/bin/env node
// Builds the Foundations portal (site/foundations/*.html + foundations.css + foundations.js):
// - index.html        Overview & architecture map
// - physics.html      Closed-form spring response, zeta clamping, rubberBand & projectToDetent
// - choreography.html Presence, MotionFrame, SharedAxis, Edges, MorphSurface & StaggerGroup
// - color.html        4-Tier OKLCH color architecture & 168-combination WCAG contrast explorer
// - typography.html   Iowan Old Style display + sans/mono scale, 5 corner profiles & 3 densities
// - agents.html       Square agent marks with globe antenna, 24 status glyphs & non-optimistic approvals
// Usage: node scripts/build-foundations.mjs [--check]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brands, grounds, radii, densities } from '../design/index.js';
import { AGENT_ICONS, AGENT_ICON_VIEWBOX, agentIconGlyph, agentIconOutline, agentIconStrokeWidth, roundIconUnit } from '../dist/agent/icons.js';
import { recipeCount } from './lib/recipe-count.mjs';
import { siteFooter, siteHeader, siteStyles } from './lib/site-chrome.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const outDir = join(root, 'site/foundations');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const FOUNDATION_CHAPTERS = Object.freeze([
  { slug: 'index.html', title: 'Overview', summary: 'How spring math, OKLCH tokens, choreography, and truthful state fit together across Web and SwiftUI.' },
  { slug: 'physics.html', title: 'Physics & Velocity', summary: 'Closed-form damped springs (zeta in [0.7, 1.0]), momentum projection, rubberBand bounds, and projectToDetent.' },
  { slug: 'choreography.html', title: 'Choreography', summary: 'Presence asymmetry, MotionFrame height morphs, SharedAxis transitions, 2D Edges lag, and MorphSurface FLIP.' },
  { slug: 'color.html', title: 'OKLCH Color & Contrast', summary: 'Four-tier semantic tokens and live explorer across all 168 WCAG-audited brand, ground, scheme, and contrast pairs.' },
  { slug: 'typography.html', title: 'Typography & Shape', summary: 'Editorial Iowan Old Style display serif, tabular UI sans/mono scale, 5 corner profiles, and 3 density tiers.' },
  { slug: 'agents.html', title: 'Agent Identity', summary: 'Why agents are square with a globe antenna while people stay round, 24 live status glyphs, and non-optimistic approvals.' },
]);

function renderIconTree(nodes) {
  return nodes.map(([tag, attrs, children]) => {
    const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(' ');
    return children && children.length
      ? `<${tag} ${attrStr}>${renderIconTree(children)}</${tag}>`
      : `<${tag} ${attrStr}/>`;
  }).join('');
}

function renderStaticAgentSvg(icon, size = 32) {
  const sw = agentIconStrokeWidth(size);
  const outline = agentIconOutline(sw);
  const outlineStr = Object.entries(outline).map(([k, v]) => `${k}="${esc(v)}"`).join(' ');
  const glyph = renderIconTree(agentIconGlyph(icon, size));
  return `<svg viewBox="${AGENT_ICON_VIEWBOX}" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${roundIconUnit(sw)}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect ${outlineStr}/>${glyph}</svg>`;
}

function shell({ slug, title, description, body }) {
  const rail = FOUNDATION_CHAPTERS.map((c) => (
    `<a href="./${c.slug}"${c.slug === slug ? ' aria-current="page"' : ''}>${esc(c.title)}</a>`
  )).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Foundations · Cieo</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="light dark">
${siteStyles('../', true)}
<link rel="stylesheet" href="./foundations.css">
</head>
<body class="cieo cieo-docsite cieo-site">
${siteHeader('../', 'Foundations')}
<main id="main">
  <div class="doc-shell">
    <nav class="doc-rail" aria-label="Foundations chapters">
      <span class="doc-label">Foundations</span>
      ${rail}
    </nav>
    <div class="doc-main">
      ${body}
    </div>
  </div>
</main>
${siteFooter('../')}
<script type="module" src="./foundations.js"></script>
</body>
</html>
`;
}

function overviewPage() {
  const cards = FOUNDATION_CHAPTERS.slice(1).map((c, i) => `<li><a href="./${c.slug}"><span class="index-count">0${i + 1}</span><span class="index-name">${esc(c.title)}</span><span class="index-note">${esc(c.summary)}</span></a></li>`).join('');

  return shell({
    slug: 'index.html',
    title: 'Foundations',
    description: 'The physics, choreography, OKLCH color architecture, typography, and agent supervision contracts shared by Cieo on Web and SwiftUI.',
    body: `<header class="doc-head">
      <p class="doc-crumbs"><a href="../">Home</a><span aria-hidden="true">/</span><span>Foundations</span></p>
      <h1>Foundations that hold across platforms.</h1>
      <p>Every Cieo control, primitive, and recipe obeys one physical and visual contract: closed-form springs that settle without visible bounce (ζ = 1 default; the 0.7 floor allows at most about 5% overshoot), OKLCH palettes audited across 168 theme combinations, and state machines that never claim an unconfirmed outcome.</p>
    </header>
    <section aria-label="Chapters">
      <ul class="index-list">${cards}</ul>
    </section>
    <section class="fnd-callout">
      <h2>Explore live surfaces</h2>
      <p>Test tokens interactively in <a href="../../docs/studio/">Theme Studio</a>, inspect all components in the <a href="../components/">Component Library</a>, or scrub ${recipeCount()} specimens in <a href="../recipes/">Motion Recipes</a>.</p>
    </section>`,
  });
}

function physicsPage() {
  return shell({
    slug: 'physics.html',
    title: 'Physics & Velocity',
    description: 'Interactive closed-form spring response explorer, damping ratio zeta clamping, rubberBand drag bounds, and projectToDetent velocity snapping.',
    body: `<header class="doc-head">
      <p class="doc-crumbs"><a href="./">Foundations</a><span aria-hidden="true">/</span><span>Physics &amp; Velocity</span></p>
      <h1>Closed-form spring physics.</h1>
      <p>Every motion is evaluated analytically at timestamp <code>t</code> as a sum of damped step responses: zero numerical drift, interruptible mid-flight with continuous velocity, and clamped to <code>0.7 ≤ zeta ≤ 1.0</code>: zeta = 1 is the default, and the 0.7 floor allows at most about 5% overshoot.</p>
    </header>

    <section aria-labelledby="curve-h">
      <h2 id="curve-h">Interactive step response &amp; overshoot explorer</h2>
      <div class="fnd-lab" data-physics-lab>
        <div class="fnd-controls">
          <div class="fnd-presets" role="group" aria-label="Spring presets">
            <button type="button" data-preset="snap" data-w="34" aria-pressed="false">snap · ω 34</button>
            <button type="button" data-preset="base" data-w="22" aria-pressed="true">base · ω 22</button>
            <button type="button" data-preset="soft" data-w="15" aria-pressed="false">soft · ω 15</button>
            <button type="button" data-preset="lazy" data-w="9" aria-pressed="false">lazy · ω 9</button>
          </div>
          <label class="fnd-slider">Natural frequency ω (<output data-w-out>22</output> rad/s)
            <input type="range" min="6" max="45" step="1" value="22" data-w-input>
          </label>
          <label class="fnd-slider">Damping ratio zeta (<output data-z-out>1.00</output>)
            <input type="range" min="0.7" max="1" step="0.02" value="1" data-z-input>
          </label>
        </div>
        <svg class="fnd-plot" viewBox="0 0 600 200" role="img" aria-label="Closed-form spring step response curve" data-spring-svg>
          <line x1="36" y1="36" x2="576" y2="36" class="fnd-axis-target" />
          <line x1="36" y1="168" x2="576" y2="168" class="fnd-axis-base" />
          <path d="" class="fnd-curve-under" data-curve-bounce />
          <path d="" class="fnd-curve-main" data-curve-cieo />
        </svg>
        <p class="fnd-readout" data-physics-readout aria-live="polite">ω = 22 rad/s · zeta = 1.00 · 99.9% settle = 418 ms · Cieo overshoot = 0.0% (unclamped bouncy zeta = 0.45 overshoots by 20.5%)</p>
      </div>
    </section>

    <section aria-labelledby="gesture-h">
      <h2 id="gesture-h">Gesture boundaries: <code>rubberBand</code> &amp; <code>projectToDetent</code></h2>
      <p>Direct manipulation tracks the pointer 1:1 inside valid bounds, compresses asymptotically past limits via <code>rubberBand(offset, dimension, 0.55)</code>, and projects release velocity onto sorted sheet detents via <code>projectToDetent(position, velocity, detents)</code>.</p>
      <div class="fnd-lab" data-detent-lab>
        <div class="fnd-controls">
          <label class="fnd-slider">Release position (<output data-pos-out>0.48</output>)
            <input type="range" min="0" max="1" step="0.02" value="0.48" data-pos-input>
          </label>
          <label class="fnd-slider">Release velocity (<output data-vel-out>0</output> /s)
            <input type="range" min="-2.5" max="2.5" step="0.1" value="0" data-vel-input>
          </label>
          <label class="fnd-slider">Over-drag offset (<output data-rb-in>80</output> px)
            <input type="range" min="-240" max="240" step="10" value="80" data-rb-input>
          </label>
        </div>
        <p class="fnd-readout" data-detent-readout aria-live="polite">Detents [0, 0.5, 0.9] → snapped detent: 0.50 · rubberBand(80px, 200px) → 49.4 px</p>
      </div>
    </section>`,
  });
}

function choreographyPage() {
  return shell({
    slug: 'choreography.html',
    title: 'Choreography',
    description: 'Interactive choreography specimens: Presence enter/exit, MotionFrame, SharedAxis directional transitions, 2D Edges lag, and MorphSurface FLIP.',
    body: `<header class="doc-head">
      <p class="doc-crumbs"><a href="./">Foundations</a><span aria-hidden="true">/</span><span>Choreography</span></p>
      <h1>Five choreography primitives.</h1>
      <p>Coordinated surfaces share a small set of spatial rules: asymmetric enter/exit timing, 60 ms leading-before-trailing edge lag, directional shared-axis steps, interruptible container morphs, and stagger spans strictly capped at 300 ms.</p>
    </header>

    <section aria-labelledby="edges-h">
      <h2 id="edges-h">1. Leading &amp; trailing <code>Edges</code> + directional <code>SharedAxis</code></h2>
      <p>Click or arrow through the steps below: the leading edge departs immediately while the trailing edge follows 60 ms later, and the content panel slides along the motion axis according to <code>direction: -1 | +1</code>.</p>
      <div class="fnd-lab" data-choreo-demo>
        <div class="fnd-tabs" role="tablist" aria-label="Choreography specimen steps">
          <span class="fnd-tab-pill" data-choreo-pill aria-hidden="true"></span>
          <button type="button" role="tab" id="choreo-tab-0" aria-controls="choreo-panel" aria-selected="true" tabindex="0" data-step="0">1. Presence</button>
          <button type="button" role="tab" id="choreo-tab-1" aria-controls="choreo-panel" aria-selected="false" tabindex="-1" data-step="1">2. MotionFrame</button>
          <button type="button" role="tab" id="choreo-tab-2" aria-controls="choreo-panel" aria-selected="false" tabindex="-1" data-step="2">3. SharedAxis</button>
          <button type="button" role="tab" id="choreo-tab-3" aria-controls="choreo-panel" aria-selected="false" tabindex="-1" data-step="3">4. MorphSurface</button>
        </div>
        <div class="fnd-stage-card" id="choreo-panel" role="tabpanel" aria-labelledby="choreo-tab-0" tabindex="0" data-choreo-panel>
          <h3 data-choreo-title>Presence &amp; Arrival</h3>
          <p data-choreo-body>Overlays enter on the base spring (ω = 22) from 0.97 scale and exit faster on snap (ω = 34). New list items arrive from ARRIVE = 0.45 opacity, never from 0, and StaggerGroup compresses per-item delays so total stagger never exceeds 300 ms.</p>
        </div>
      </div>
    </section>

    <section aria-labelledby="primitives-map-h">
      <h2 id="primitives-map-h">2. Component mapping</h2>
      <div class="doc-table-wrap">
        <table>
          <thead><tr><th>Primitive / Hook</th><th>Web API</th><th>Apple SwiftUI Counterpart</th><th>Contract</th></tr></thead>
          <tbody>
            <tr><td><a href="../components/MotionFrame.html">MotionFrame</a></td><td><code>&lt;MotionFrame contentKey={step}&gt;</code></td><td><code>CieoMotionFrame</code></td><td>ResizeObserver height spring + directional swap</td></tr>
            <tr><td><a href="../components/MorphSurface.html">MorphSurface</a></td><td><code>&lt;MorphSurface layoutId="card"&gt;</code></td><td><code>CieoMorphSurface</code></td><td>5-channel SpringRect FLIP container transform</td></tr>
            <tr><td><a href="../components/StaggerGroup.html">StaggerGroup</a></td><td><code>&lt;StaggerGroup budget={300}&gt;</code></td><td><code>Motion.stagger(i, count:)</code></td><td>Bounded ≤ 300 ms arrival from 0.45 opacity</td></tr>
            <tr><td><code>useSharedAxis</code></td><td><code>import { useSharedAxis } from 'cieo/react'</code></td><td><code>.cieoSharedAxis(direction:)</code></td><td>Directional ±14 px slide + opacity settle</td></tr>
            <tr><td><code>useEdges</code></td><td><code>import { useEdges } from 'cieo/react'</code></td><td><code>EdgesTrack</code></td><td>Leading edge now, trailing edge after 60 ms lag</td></tr>
          </tbody>
        </table>
      </div>
    </section>`,
  });
}

function colorPage() {
  const brandOpts = Object.entries(brands).map(([id, b]) => `<option value="${esc(id)}"${id === 'instrument' ? ' selected' : ''}>${esc(b.label || id)}</option>`).join('');
  const groundOpts = Object.entries(grounds).map(([id, g]) => `<option value="${esc(id)}"${id === 'paper' ? ' selected' : ''}>${esc(g.label || id)}</option>`).join('');

  return shell({
    slug: 'color.html',
    title: 'OKLCH Color & Contrast',
    description: 'Four-tier OKLCH color system and interactive explorer across all 168 WCAG-audited brand, ground, scheme, and contrast combinations.',
    body: `<header class="doc-head">
      <p class="doc-crumbs"><a href="./">Foundations</a><span aria-hidden="true">/</span><span>OKLCH Color &amp; Contrast</span></p>
      <h1>Perceptual OKLCH color, 168 combinations audited.</h1>
      <p>Cieo generates every surface, ink, border, accent, and status pair in perceptual OKLCH space and audits all <strong>168 combinations</strong> (7 brands × 3 grounds × 2 schemes × 2 contrast modes × status roles) against WCAG contrast thresholds before release.</p>
    </header>

    <section aria-labelledby="matrix-h">
      <h2 id="matrix-h">Interactive contrast &amp; token auditor</h2>
      <div class="fnd-lab" data-color-lab>
        <div class="fnd-controls">
          <label>Brand <select data-color-brand>${brandOpts}</select></label>
          <label>Ground <select data-color-ground>${groundOpts}</select></label>
          <label>Scheme <select data-color-scheme><option value="light">Light</option><option value="dark">Dark</option></select></label>
          <label>Contrast <select data-color-contrast><option value="standard">Standard (AA)</option><option value="high">High (AAA-targeted)</option></select></label>
        </div>
        <div class="fnd-swatches" data-color-swatches></div>
        <div class="doc-table-wrap">
          <table data-contrast-table>
            <thead><tr><th>Foreground / Background Pair</th><th>Ratio</th><th>Required</th><th>Verdict</th></tr></thead>
            <tbody data-contrast-rows>
              <tr><td>text on canvas</td><td>15.4:1</td><td>4.5:1</td><td>PASS</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>`,
  });
}

function typographyPage() {
  const radiusButtons = Object.keys(radii).map((r) => `<button type="button" data-shape-radius="${esc(r)}" aria-pressed="${r === 'pill' ? 'true' : 'false'}">${esc(r)}</button>`).join('');
  const densityButtons = Object.keys(densities).map((d) => `<button type="button" data-shape-density="${esc(d)}" aria-pressed="${d === 'comfortable' ? 'true' : 'false'}">${esc(d)}</button>`).join('');

  return shell({
    slug: 'typography.html',
    title: 'Typography & Shape',
    description: 'Iowan Old Style display serif, tabular UI sans and monospace scale, 5 corner profiles (square, crisp, soft, round, pill), and 3 densities.',
    body: `<header class="doc-head">
      <p class="doc-crumbs"><a href="./">Foundations</a><span aria-hidden="true">/</span><span>Typography &amp; Shape</span></p>
      <h1>Editorial voice and quiet geometry.</h1>
      <p>Display headings pair <code>Iowan Old Style</code> editorial serif with clean system sans body copy and tabular monospace telemetry—zero external font round-trips, zero layout shift.</p>
    </header>

    <section aria-labelledby="type-h">
      <h2 id="type-h">Type scale specimen</h2>
      <div class="fnd-lab fnd-type-stack">
        <div><span class="site-label">Display · --cieo-font-display (Iowan Old Style)</span><p class="fnd-specimen-display">Motion that settles without a bounce.</p></div>
        <div><span class="site-label">Title · --cieo-text-xl / --cieo-font-sans</span><p class="fnd-specimen-title">Every control reads semantic tokens, never hardcoded hex values.</p></div>
        <div><span class="site-label">Numeric &amp; Code · --cieo-font-mono (tabular-nums)</span><p class="fnd-specimen-mono">ω = 22 rad/s · ζ = 1.00 · settle = 180.4 ms · 0123456789</p></div>
      </div>
    </section>

    <section aria-labelledby="shape-h">
      <h2 id="shape-h">Interactive corner profiles &amp; density scale</h2>
      <p>Switch among all 5 corner profiles (<code>square</code>, <code>crisp</code>, <code>soft</code>, <code>round</code>, <code>pill</code>) and 3 density tiers without shrinking accessible hit targets below 24×24 CSS px.</p>
      <div class="fnd-lab" data-shape-lab>
        <div class="fnd-controls">
          <div class="fnd-presets" role="group" aria-label="Corner profile">${radiusButtons}</div>
          <div class="fnd-presets" role="group" aria-label="Density">${densityButtons}</div>
        </div>
        <div class="fnd-shape-preview" data-shape-stage>
          <div class="fnd-shape-card">
            <strong>Surface radius &amp; control rhythm</strong>
            <p>Controls, inputs, and cards inherit <code>--cieo-radius-control</code> and <code>--cieo-radius-surface</code> automatically.</p>
            <div class="fnd-shape-actions">
              <button type="button" class="cieo cieo-button" data-variant="primary">Save changes</button>
              <span class="cieo cieo-badge" data-status="success">Synced</span>
            </div>
          </div>
        </div>
      </div>
    </section>`,
  });
}

function agentsPage() {
  const iconCards = AGENT_ICONS.map((icon) => `
    <div class="fnd-agent-glyph" data-agent-icon="${esc(icon.id)}">
      <div class="fnd-agent-svg" data-icon-slot="${esc(icon.id)}">${renderStaticAgentSvg(icon, 32)}</div>
      <strong>${esc(icon.name)}</strong>
      <span>${esc(icon.group)}</span>
    </div>
  `).join('');

  return shell({
    slug: 'agents.html',
    title: 'Agent Identity & Supervision',
    description: 'Visual identity and supervision laws for software agents: square bodies with globe antennas versus round human avatars, 24 status glyphs, and non-optimistic approvals.',
    body: `<header class="doc-head">
      <p class="doc-crumbs"><a href="./">Foundations</a><span aria-hidden="true">/</span><span>Agent Identity</span></p>
      <h1>Agents are square; people are round.</h1>
      <p>A reader must tell in a peripheral glance who acted and who approved. Human avatars are always circular; software agents always occupy a crisp rounded-square silhouette topped with a globe antenna.</p>
    </header>

    <section aria-labelledby="silhouette-h">
      <h2 id="silhouette-h">1. Silhouette &amp; supervision contract</h2>
      <div class="fnd-lab fnd-compare-marks">
        <div class="fnd-mark-box">
          <svg viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <line x1="40" y1="18" x2="40" y2="10"/>
            <circle cx="40" cy="7" r="3.2" fill="currentColor"/>
            <rect x="18" y="18" width="44" height="44" rx="10"/>
            <circle cx="32" cy="38" r="2.4" fill="currentColor"/>
            <circle cx="48" cy="38" r="2.4" fill="currentColor"/>
            <path d="M33 48 Q40 52 47 48" stroke-linecap="round"/>
          </svg>
          <strong>Software Agent</strong>
          <p>Square body + globe antenna. Never impersonates a person; pauses visibly on <a href="../components/ApprovalRequest.html">ApprovalRequest</a>.</p>
        </div>
        <div class="fnd-mark-box">
          <svg viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <circle cx="40" cy="40" r="24"/>
            <circle cx="40" cy="34" r="7"/>
            <path d="M25 56 C28 47 52 47 55 56" stroke-linecap="round"/>
          </svg>
          <strong>Human Supervisor</strong>
          <p>Circular avatar (<a href="../components/Avatar.html">Avatar</a>). Owns final consent for destructive or external actions.</p>
        </div>
      </div>
    </section>

    <section aria-labelledby="glyphs-h">
      <h2 id="glyphs-h">2. Optical-size status glyphs (${AGENT_ICONS.length} states)</h2>
      <p>Every <a href="../components/AgentIcon.html">AgentIcon</a> carries three hand-tuned optical tiers (<code>≤20px</code> compact, <code>24px</code> regular, <code>&gt;24px</code> large) with stroke compensation so outlines stay crisp at badge scale and hero scale alike.</p>
      <div class="fnd-lab" data-agent-size-lab>
        <div class="fnd-presets" role="group" aria-label="Optical glyph size">
          <button type="button" data-glyph-size="18" aria-pressed="false">18 px · compact</button>
          <button type="button" data-glyph-size="24" aria-pressed="false">24 px · regular</button>
          <button type="button" data-glyph-size="36" aria-pressed="true">36 px · large</button>
        </div>
        <div class="fnd-agent-grid">${iconCards}</div>
      </div>
    </section>

    <section aria-labelledby="pack-h">
      <h2 id="pack-h">3. Non-optimistic agent pack components</h2>
      <p>Approval and run controls use Cieo's <code>asyncAction</code> state machine: pressing Approve transitions to <code>pending</code> until the host confirms execution, surfacing <code>uncertain</code> rather than false success on timeout. Inspect <a href="../components/AgentStatus.html">AgentStatus</a>, <a href="../components/AgentActivity.html">AgentActivity</a>, <a href="../components/AgentLanes.html">AgentLanes</a>, <a href="../components/ApprovalRequest.html">ApprovalRequest</a>, <a href="../components/RunControls.html">RunControls</a>, <a href="../components/StreamingMessage.html">StreamingMessage</a>, and <a href="../components/ToolCallDisclosure.html">ToolCallDisclosure</a>.</p>
    </section>`,
  });
}

function buildFoundationsCss() {
  return `/* Generated by scripts/build-foundations.mjs */
.fnd-callout {
  margin-block-start: var(--cieo-space-8);
  padding: var(--cieo-space-6);
  background: var(--cieo-color-sunken);
  border: var(--cieo-border-width) solid var(--cieo-color-border);
  border-radius: var(--cieo-radius-surface);
}
.fnd-lab {
  display: flex;
  flex-direction: column;
  gap: var(--cieo-space-4);
  padding: var(--cieo-space-6);
  margin-block: var(--cieo-space-4);
  background: var(--cieo-color-surface);
  border: var(--cieo-border-width) solid var(--cieo-color-border);
  border-radius: var(--cieo-radius-surface);
}
.fnd-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cieo-space-4);
  align-items: center;
}
.fnd-controls label {
  display: inline-flex;
  flex-direction: column;
  gap: var(--cieo-space-1);
  font-size: var(--cieo-text-caption);
  color: var(--cieo-color-muted);
}
.fnd-controls select {
  min-height: 2rem;
  padding: 0 var(--cieo-space-2);
  border: var(--cieo-border-width) solid var(--cieo-color-border-strong);
  border-radius: var(--cieo-radius-control);
  background: var(--cieo-color-canvas);
  color: var(--cieo-color-text);
  font: inherit;
}
.fnd-slider { min-width: 11rem; flex: 1 1 11rem; }
.fnd-presets {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 3px;
  background: var(--cieo-color-sunken);
  border: var(--cieo-border-width) solid var(--cieo-color-border-strong);
  border-radius: var(--cieo-radius-control);
}
.fnd-presets button {
  border: 0;
  background: transparent;
  color: var(--cieo-color-muted);
  font: inherit;
  font-size: var(--cieo-text-caption);
  padding: var(--cieo-space-1) var(--cieo-space-3);
  border-radius: var(--cieo-radius-small);
  cursor: pointer;
}
/* Selected is ink on paper, never a faint fill alone. */
.fnd-presets button[aria-pressed="true"] {
  background: var(--cieo-color-accent);
  color: var(--cieo-color-on-accent);
}
.fnd-plot {
  width: 100%;
  height: auto;
  background: var(--cieo-color-canvas);
  border: var(--cieo-border-width) solid var(--cieo-color-border);
  border-radius: var(--cieo-radius-surface);
}
.fnd-axis-target { stroke: var(--cieo-color-border-strong); stroke-dasharray: 4 4; }
.fnd-axis-base { stroke: var(--cieo-color-border); }
.fnd-curve-under { fill: none; stroke: var(--cieo-color-subtle); stroke-width: 1.75; stroke-dasharray: 5 4; }
.fnd-curve-main { fill: none; stroke: var(--cieo-color-accent); stroke-width: 2.6; }
.fnd-readout {
  margin: 0;
  font-family: var(--cieo-font-mono);
  font-size: var(--cieo-text-caption);
  color: var(--cieo-color-muted);
  font-variant-numeric: tabular-nums;
}
.fnd-tabs {
  position: relative;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  background: var(--cieo-color-sunken);
  border: var(--cieo-border-width) solid var(--cieo-color-border-strong);
  border-radius: var(--cieo-radius-control);
  align-self: flex-start;
}
.fnd-tab-pill {
  position: absolute;
  top: 4px;
  left: 0;
  height: calc(100% - 8px);
  background: var(--cieo-color-surface);
  border: var(--cieo-border-width) solid var(--cieo-color-text);
  border-radius: var(--cieo-radius-small);
  box-sizing: border-box;
  pointer-events: none;
}
.fnd-tabs button {
  position: relative;
  z-index: 1;
  border: 0;
  background: transparent;
  color: var(--cieo-color-text);
  font: inherit;
  font-size: var(--cieo-text-caption);
  padding: var(--cieo-space-1) var(--cieo-space-3);
  cursor: pointer;
}
.fnd-stage-card {
  padding: var(--cieo-space-6);
  background: var(--cieo-color-canvas);
  border: var(--cieo-border-width) solid var(--cieo-color-border);
  border-radius: var(--cieo-radius-surface);
}
.fnd-stage-card h3 { margin: 0 0 var(--cieo-space-2); }
.fnd-stage-card p { margin: 0; color: var(--cieo-color-muted); }
.fnd-swatches {
  display: grid;
  gap: var(--cieo-space-3);
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
}
.fnd-swatch {
  padding: var(--cieo-space-3);
  border: var(--cieo-border-width) solid var(--cieo-color-border);
  border-radius: var(--cieo-radius-surface);
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: var(--cieo-text-caption);
}
.fnd-swatch code { font-family: var(--cieo-font-mono); font-size: var(--cieo-text-caption); }
.fnd-specimen-display { margin: var(--cieo-space-1) 0 0; font-family: var(--cieo-font-display); font-size: var(--cieo-text-display); line-height: 1.1; }
.fnd-specimen-title { margin: var(--cieo-space-1) 0 0; font-size: var(--cieo-text-title); font-weight: var(--cieo-weight-strong); }
.fnd-specimen-mono { margin: var(--cieo-space-1) 0 0; font-family: var(--cieo-font-mono); font-size: var(--cieo-text-small); font-variant-numeric: tabular-nums; }
.fnd-shape-card {
  padding: var(--cieo-space-6);
  background: var(--cieo-color-canvas);
  border: var(--cieo-border-width) solid var(--cieo-color-border);
  border-radius: var(--cieo-radius-surface);
  display: flex;
  flex-direction: column;
  gap: var(--cieo-space-3);
}
.fnd-shape-actions { display: flex; gap: var(--cieo-space-3); align-items: center; }
.fnd-compare-marks {
  display: grid;
  gap: var(--cieo-space-6);
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}
.fnd-mark-box {
  display: flex;
  flex-direction: column;
  gap: var(--cieo-space-2);
  padding: var(--cieo-space-4);
  background: var(--cieo-color-canvas);
  border: var(--cieo-border-width) solid var(--cieo-color-border);
  border-radius: var(--cieo-radius-surface);
}
.fnd-mark-box p { margin: 0; font-size: var(--cieo-text-small); color: var(--cieo-color-muted); }
.fnd-agent-grid {
  display: grid;
  gap: var(--cieo-space-3);
  grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr));
}
.fnd-agent-glyph {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--cieo-space-3);
  background: var(--cieo-color-canvas);
  border: var(--cieo-border-width) solid var(--cieo-color-border);
  border-radius: var(--cieo-radius-surface);
  text-align: center;
  font-size: var(--cieo-text-caption);
}
.fnd-agent-glyph span { color: var(--cieo-color-muted); font-size: var(--cieo-text-caption); }
@media (pointer: coarse) {
  .fnd-controls select, .fnd-presets button, .fnd-tabs button, .fnd-shape-actions button, .fnd-lab button { min-height: var(--cieo-touch-target); }
  .fnd-controls select { min-width: var(--cieo-touch-target); }
}
`;
}

function buildFoundationsJs() {
  return `// Generated by scripts/build-foundations.mjs — interactive labs for Physics, Choreography, OKLCH Color, Shape, and Agents
import { rovingTabs } from '../roving-tabs.js';
import { LAG, S, Track, now, resp, run, settleTime } from '../../dist/core/spring.js';
import { projectToDetent, rubberBand } from '../../dist/live/index.js';
import { auditTheme, createTheme, themeToCssVariables } from '../../design/index.js';
import { AGENT_ICONS, AGENT_ICON_VIEWBOX, agentIconGlyph, agentIconOutline, agentIconStrokeWidth, roundIconUnit } from '../../dist/agent/icons.js';

// 1. Physics Lab
const physicsLab = document.querySelector('[data-physics-lab]');
if (physicsLab) {
  const wInput = physicsLab.querySelector('[data-w-input]');
  const zInput = physicsLab.querySelector('[data-z-input]');
  const wOut = physicsLab.querySelector('[data-w-out]');
  const zOut = physicsLab.querySelector('[data-z-out]');
  const curveCieo = physicsLab.querySelector('[data-curve-cieo]');
  const curveBounce = physicsLab.querySelector('[data-curve-bounce]');
  const readout = physicsLab.querySelector('[data-physics-readout]');
  const presetBtns = [...physicsLab.querySelectorAll('[data-preset]')];

  const underdampedStep = (dt, w, z) => {
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * dt) * (Math.cos(wd * dt) + ((z * w) / wd) * Math.sin(wd * dt));
  };

  const renderCurves = () => {
    const w = Number(wInput.value);
    const z = Number(zInput.value);
    wOut.textContent = String(w);
    zOut.textContent = z.toFixed(2);
    const duration = 0.75;
    const steps = 90;
    const pMain = [];
    const pUnder = [];
    let peakMain = 0;
    let peakUnder = 0;
    for (let i = 0; i <= steps; i += 1) {
      const t = (i / steps) * duration;
      const yMain = 1 - resp(t, 1, 0, { w, z });
      const yUnder = underdampedStep(t, w, 0.45);
      peakMain = Math.max(peakMain, yMain);
      peakUnder = Math.max(peakUnder, yUnder);
      const x = 36 + (i / steps) * 540;
      const pyMain = 168 - yMain * 132;
      const pyUnder = 168 - yUnder * 132;
      pMain.push(\`\${i === 0 ? 'M' : 'L'}\${x.toFixed(1)} \${pyMain.toFixed(1)}\`);
      pUnder.push(\`\${i === 0 ? 'M' : 'L'}\${x.toFixed(1)} \${pyUnder.toFixed(1)}\`);
    }
    curveCieo.setAttribute('d', pMain.join(' '));
    curveBounce.setAttribute('d', pUnder.join(' '));
    const settleMs = Math.round(settleTime({ w, z }) * 1000);
    const overMain = Math.max(0, (peakMain - 1) * 100).toFixed(1);
    const overUnder = Math.max(0, (peakUnder - 1) * 100).toFixed(1);
    readout.textContent = \`ω = \${w} rad/s · zeta = \${z.toFixed(2)} · 99.9% settle = \${settleMs} ms · Cieo overshoot = \${overMain}% (bouncy zeta = 0.45 overshoots by \${overUnder}%)\`;
  };

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      wInput.value = btn.dataset.w;
      zInput.value = '1';
      presetBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderCurves();
    });
  });
  wInput.addEventListener('input', () => {
    presetBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    renderCurves();
  });
  zInput.addEventListener('input', renderCurves);
  renderCurves();
}

const detentLab = document.querySelector('[data-detent-lab]');
if (detentLab) {
  const posIn = detentLab.querySelector('[data-pos-input]');
  const velIn = detentLab.querySelector('[data-vel-input]');
  const rbIn = detentLab.querySelector('[data-rb-input]');
  const posOut = detentLab.querySelector('[data-pos-out]');
  const velOut = detentLab.querySelector('[data-vel-out]');
  const rbOut = detentLab.querySelector('[data-rb-in]');
  const readout = detentLab.querySelector('[data-detent-readout]');
  const detents = [0, 0.5, 0.9];
  const update = () => {
    const pos = Number(posIn.value);
    const vel = Number(velIn.value);
    const raw = Number(rbIn.value);
    posOut.textContent = pos.toFixed(2);
    velOut.textContent = vel.toFixed(1);
    rbOut.textContent = String(raw);
    const snapped = projectToDetent(pos, vel, detents, 0.35);
    const banded = rubberBand(raw, 200, 0.55);
    readout.textContent = \`Detents [0, 0.5, 0.9] → snapped detent: \${snapped.toFixed(2)} · rubberBand(\${raw}px, 200px) → \${banded.toFixed(1)} px\`;
  };
  posIn.addEventListener('input', update);
  velIn.addEventListener('input', update);
  rbIn.addEventListener('input', update);
  update();
}

// 2. Choreography Lab
const choreoLab = document.querySelector('[data-choreo-demo]');
if (choreoLab) {
  const btns = [...choreoLab.querySelectorAll('[data-step]')];
  const pill = choreoLab.querySelector('[data-choreo-pill]');
  const panel = choreoLab.querySelector('[data-choreo-panel]');
  const titleEl = choreoLab.querySelector('[data-choreo-title]');
  const bodyEl = choreoLab.querySelector('[data-choreo-body]');
  const COPY = [
    ['Presence & Arrival', 'Overlays enter on base (ω = 22) and exit faster on snap (ω = 34). Staggered items arrive from ARRIVE = 0.45 opacity with total stagger bounded to ≤ 300 ms.'],
    ['MotionFrame Height & Content Swap', 'ResizeObserver tracks natural content height on a critically damped spring while outgoing and incoming views swap without layout jump.'],
    ['SharedAxis Directional Step', 'Stepping forward (+1) or backward (-1) slides incoming content 14 px along the navigation axis so spatial order stays legible.'],
    ['MorphSurface Container Transform', '5-channel SpringRect (x, y, width, height, radius) morphs a compact trigger smoothly into an expanded card and reverses mid-flight.'],
  ];
  const edgeA = new Track(0, S.base);
  const edgeB = new Track(0, S.base);
  const slideX = new Track(0, S.base);
  const slideO = new Track(1, S.base);
  let cur = 0;

  const placePill = (i, instant) => {
    const b = btns[i];
    if (!b) return;
    const na = b.offsetLeft;
    const nb = b.offsetLeft + b.offsetWidth;
    if (instant) {
      edgeA.jump(na);
      edgeB.jump(nb);
      pill.style.transform = \`translateX(\${na}px)\`;
      pill.style.width = \`\${nb - na}px\`;
      return;
    }
    const t = now();
    if (na >= edgeA.target) {
      edgeB.set(nb, S.base, t);
      edgeA.set(na, S.base, t + LAG);
    } else {
      edgeA.set(na, S.base, t);
      edgeB.set(nb, S.base, t + LAG);
    }
    const dir = i >= cur ? 1 : -1;
    cur = i;
    titleEl.textContent = COPY[i][0];
    bodyEl.textContent = COPY[i][1];
    slideX.jump(dir * 16);
    slideX.set(0, S.base, t);
    slideO.jump(0.45);
    slideO.set(1, S.base, t);
    run({
      kind: 'feedback',
      step: (ts) => {
        const a = edgeA.at(ts);
        const bPos = edgeB.at(ts);
        pill.style.transform = \`translateX(\${a.toFixed(2)}px)\`;
        pill.style.width = \`\${Math.max(0, bPos - a).toFixed(2)}px\`;
        panel.style.transform = \`translateX(\${slideX.at(ts).toFixed(2)}px)\`;
        panel.style.opacity = slideO.at(ts).toFixed(3);
        return edgeA.prune(ts) + edgeB.prune(ts) + slideX.prune(ts) + slideO.prune(ts) > 0;
      },
    });
  };

  rovingTabs(btns, (idx) => {
    panel.setAttribute('aria-labelledby', \`choreo-tab-\${idx}\`);
    placePill(idx, false);
  });
  placePill(0, true);
}

// 3. OKLCH Color & Contrast Lab
const colorLab = document.querySelector('[data-color-lab]');
if (colorLab) {
  const brandSel = colorLab.querySelector('[data-color-brand]');
  const groundSel = colorLab.querySelector('[data-color-ground]');
  const schemeSel = colorLab.querySelector('[data-color-scheme]');
  const contrastSel = colorLab.querySelector('[data-color-contrast]');
  const swatchesEl = colorLab.querySelector('[data-color-swatches]');
  const rowsEl = colorLab.querySelector('[data-contrast-rows]');

  const ROLES = ['canvas', 'surface', 'sunken', 'text', 'muted', 'accent', 'success', 'warning', 'danger'];
  const updateColor = () => {
    const theme = createTheme({
      brand: brandSel.value,
      ground: groundSel.value,
      scheme: schemeSel.value,
      contrast: contrastSel.value,
    });
    const audit = auditTheme(theme);
    const vars = themeToCssVariables(theme);
    swatchesEl.innerHTML = ROLES.map((r) => {
      const val = vars[\`--cieo-color-\${r}\`] || '';
      const fg = r === 'text' || r === 'accent' || r === 'danger' ? vars['--cieo-color-canvas'] : vars['--cieo-color-text'];
      return \`<div class="fnd-swatch" style="background:\${val};color:\${fg}"><strong>\${r}</strong><code>\${val}</code></div>\`;
    }).join('');
    rowsEl.innerHTML = audit.map((row) => \`<tr><td>\${row.pair || (row.fg + ' on ' + row.bg)}</td><td>\${row.ratio.toFixed(2)}:1</td><td>\${row.required}:1</td><td>\${row.pass ? 'PASS' : 'FAIL'}</td></tr>\`).join('');
  };
  [brandSel, groundSel, schemeSel, contrastSel].forEach((el) => el.addEventListener('change', updateColor));
  updateColor();
}

// 4. Typography & Shape Lab
const shapeLab = document.querySelector('[data-shape-lab]');
if (shapeLab) {
  const stage = shapeLab.querySelector('[data-shape-stage]');
  const rBtns = [...shapeLab.querySelectorAll('[data-shape-radius]')];
  const dBtns = [...shapeLab.querySelectorAll('[data-shape-density]')];
  let curRadius = 'pill';
  let curDensity = 'comfortable';
  const syncShape = () => {
    const vars = themeToCssVariables(createTheme({ brand: 'instrument', ground: 'paper', radius: curRadius, density: curDensity }));
    for (const [k, v] of Object.entries(vars)) stage.style.setProperty(k, v);
  };
  rBtns.forEach((btn) => btn.addEventListener('click', () => {
    curRadius = btn.dataset.shapeRadius;
    rBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    syncShape();
  }));
  dBtns.forEach((btn) => btn.addEventListener('click', () => {
    curDensity = btn.dataset.shapeDensity;
    dBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    syncShape();
  }));
  syncShape();
}

// 5. Agent Optical-Size Lab
const agentLab = document.querySelector('[data-agent-size-lab]');
if (agentLab) {
  const sizeBtns = [...agentLab.querySelectorAll('[data-glyph-size]')];
  const renderTree = (nodes) => nodes.map(([tag, attrs, children]) => {
    const a = Object.entries(attrs).map(([k, v]) => \`\${k}="\${v}"\`).join(' ');
    return children && children.length ? \`<\${tag} \${a}>\${renderTree(children)}</\${tag}>\` : \`<\${tag} \${a}/>\`;
  }).join('');
  sizeBtns.forEach((btn) => btn.addEventListener('click', () => {
    const sz = Number(btn.dataset.glyphSize);
    sizeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const sw = agentIconStrokeWidth(sz);
    const outAttrs = Object.entries(agentIconOutline(sw)).map(([k, v]) => \`\${k}="\${v}"\`).join(' ');
    for (const icon of AGENT_ICONS) {
      const slot = agentLab.querySelector(\`[data-icon-slot="\${icon.id}"]\`);
      if (!slot) continue;
      slot.innerHTML = \`<svg viewBox="\${AGENT_ICON_VIEWBOX}" width="\${sz}" height="\${sz}" fill="none" stroke="currentColor" stroke-width="\${roundIconUnit(sw)}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect \${outAttrs}/>\${renderTree(agentIconGlyph(icon, sz))}</svg>\`;
    }
  }));
}
`;
}

export function foundationPages() {
  return {
    'site/foundations/index.html': overviewPage(),
    'site/foundations/physics.html': physicsPage(),
    'site/foundations/choreography.html': choreographyPage(),
    'site/foundations/color.html': colorPage(),
    'site/foundations/typography.html': typographyPage(),
    'site/foundations/agents.html': agentsPage(),
    'site/foundations/foundations.css': buildFoundationsCss(),
    'site/foundations/foundations.js': buildFoundationsJs(),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outputs = foundationPages();
  if (check) {
    let stale = 0;
    for (const [rel, content] of Object.entries(outputs)) {
      const p = join(root, rel);
      const cur = existsSync(p) ? readFileSync(p, 'utf8') : null;
      if (cur !== content) {
        console.error(`stale: ${rel}`);
        stale += 1;
      }
    }
    if (stale) process.exit(1);
    console.log('foundations pages verified');
  } else {
    mkdirSync(outDir, { recursive: true });
    for (const [rel, content] of Object.entries(outputs)) {
      writeFileSync(join(root, rel), content);
    }
    console.log(`foundations written: ${FOUNDATION_CHAPTERS.length} chapters`);
  }
}
