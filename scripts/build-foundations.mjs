#!/usr/bin/env node
// Builds the Foundations pages (site/foundations/*.html). foundations.css and foundations.js are hand-written
// next to them. Every chapter is written for a designer or product person: what it means for the person
// using the app first, then a live demo, then one paragraph on how to use it with the real code.
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
  { slug: 'index.html', title: 'Overview', summary: 'Five promises that hold on every screen, on the web and on iPhone.' },
  { slug: 'physics.html', title: 'Springs that settle', summary: 'Buttons, sheets and menus glide to a stop. Nothing wobbles, jumps or gets stuck halfway.' },
  { slug: 'choreography.html', title: 'Motion between screens', summary: 'When something changes, motion leads your eye from the old view to the new one.' },
  { slug: 'color.html', title: 'Color that stays readable', summary: 'Text stays easy to read in every brand, in light and dark, and in high contrast. Checked in 168 combinations of brand, light/dark and contrast.' },
  { slug: 'typography.html', title: 'Type and shape', summary: 'One clean sans typeface, five corner styles and three spacing densities.' },
  { slug: 'agents.html', title: 'Agents you can trust', summary: 'AI helpers look different from people, and never say something worked before it did.' },
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

const crumbs = (name) => `<p class="doc-crumbs"><a href="./">Foundations</a><span aria-hidden="true">/</span><span>${name}</span></p>`;

function overviewPage() {
  const cards = FOUNDATION_CHAPTERS.slice(1).map((c, i) => `<li><a href="./${c.slug}"><span class="index-count">0${i + 1}</span><span class="index-name">${esc(c.title)}</span><span class="index-note">${esc(c.summary)}</span></a></li>`).join('');

  return shell({
    slug: 'index.html',
    title: 'Foundations',
    description: 'Five promises behind every Cieo screen: motion that settles, smooth changes between views, readable color, calm type and shape, and agents you can trust.',
    body: `<header class="doc-head">
      <p class="doc-crumbs"><a href="../">Home</a><span aria-hidden="true">/</span><span>Foundations</span></p>
      <h1>Foundations</h1>
      <p>Five ideas, each one you can try.</p>
    </header>
    <section aria-label="Chapters">
      <ul class="index-list">${cards}</ul>
    </section>
`,
  });
}

function physicsPage() {
  return shell({
    slug: 'physics.html',
    title: 'Springs that settle',
    description: 'Cieo motion glides to a stop instead of bouncing or jerking. Try the speed and bounce yourself, then see how a sheet snaps when you let go.',
    body: `<header class="doc-head">
      ${crumbs('Springs that settle')}
      <h1>Motion that glides to a stop.</h1>
      <p>When someone taps a button or drags a sheet, it should move like a real object: it speeds up, glides, and comes to rest. Cieo does this with springs, which are motion that eases to rest on its own instead of following a fixed animation clip. Nothing wobbles or gets cut short, the most a spring may overshoot is about 5%, and if the person changes their mind halfway the motion carries on smoothly from where it is.</p>
    </header>

    <section aria-labelledby="curve-h">
      <h2 id="curve-h">Try a spring</h2>
      <p>Press <strong>Move it</strong> to send the dot across. Pick how quickly it should arrive, and how much bounce it is allowed. Cieo keeps bounce small on purpose: at most about 5% past the target, usually none.</p>
      <div class="fnd-lab" data-spring-lab>
        <div class="fnd-controls">
          <div class="fnd-presets" role="group" aria-label="Spring speed presets">
            <button type="button" data-preset="snap" data-w="34" aria-pressed="false">Quick</button>
            <button type="button" data-preset="base" data-w="22" aria-pressed="true">Balanced</button>
            <button type="button" data-preset="soft" data-w="15" aria-pressed="false">Gentle</button>
            <button type="button" data-preset="lazy" data-w="9" aria-pressed="false">Slow</button>
          </div>
          <label class="fnd-slider">Speed
            <input type="range" min="6" max="45" step="1" value="22" data-w-input>
          </label>
          <label class="fnd-slider">Bounce: none to a little
            <input type="range" min="0" max="0.3" step="0.02" value="0" data-b-input>
          </label>
          <button type="button" class="cieo cieo-button" data-variant="primary" data-go>Move it</button>
        </div>
        <div class="fnd-track" aria-hidden="true"><span class="fnd-dot" data-dot></span></div>
        <svg class="fnd-plot" viewBox="0 0 600 200" role="img" aria-label="How far the dot has traveled over time: a smooth curve that rises and settles on its target" data-spring-svg>
          <line x1="36" y1="36" x2="576" y2="36" class="fnd-axis-target" />
          <line x1="36" y1="168" x2="576" y2="168" class="fnd-axis-base" />
          <path d="" class="fnd-curve-under" data-curve-bounce />
          <path d="" class="fnd-curve-main" data-curve-cieo />
        </svg>
        <p class="fnd-legend"><span class="fnd-key fnd-key-main" aria-hidden="true"></span>Cieo spring <span class="fnd-key fnd-key-under" aria-hidden="true"></span>A bouncy spring, which Cieo does not use</p>
        <p class="fnd-readout" data-spring-readout aria-live="polite">Settles in 418 ms. It never goes past its target.</p>
      </div>
      <p><strong>How to use it.</strong> You rarely write spring math yourself. Components already move on a spring, and you choose a feel by name: <code>snap</code> for small feedback like a press, <code>base</code> for most things, <code>soft</code> for big panels, <code>lazy</code> for slow reveals. To move your own element, hand a target number to <code>useSpring</code> and draw each frame it gives back.</p>
      <pre class="doc-code"><code>import { useSpring } from 'cieo/react';

useSpring(open ? 0 : 320, (y) => {
  sheet.current.style.transform = 'translateY(' + y + 'px)';
}, { preset: 'soft' });</code></pre>
    </section>

    <section aria-labelledby="gesture-h">
      <h2 id="gesture-h">Dragging, pulling past the edge, and letting go</h2>
      <p>A sheet follows your finger exactly while you drag. Pull it past its limit and it gets harder and harder to move, like stretching a rubber band. Let go and it snaps to the nearest resting place, and a quick flick carries it to the next one.</p>
      <div class="fnd-lab" data-detent-lab>
        <div class="fnd-controls">
          <label class="fnd-slider">Where you let go (<output data-pos-out>48</output>%)
            <input type="range" min="0" max="1" step="0.02" value="0.48" data-pos-input>
          </label>
          <label class="fnd-slider">How hard you flick (<output data-vel-out>0</output>)
            <input type="range" min="-2.5" max="2.5" step="0.1" value="0" data-vel-input>
          </label>
          <label class="fnd-slider">How far past the edge you pull (<output data-rb-in>80</output> px)
            <input type="range" min="0" max="240" step="10" value="80" data-rb-input>
          </label>
        </div>
        <div class="fnd-detent" aria-hidden="true">
          <span class="fnd-stop" style="inset-inline-start:0%"></span>
          <span class="fnd-stop" style="inset-inline-start:50%"></span>
          <span class="fnd-stop" style="inset-inline-start:90%"></span>
          <span class="fnd-marker fnd-marker-release" data-release></span>
          <span class="fnd-marker fnd-marker-snap" data-snap></span>
        </div>
        <div class="fnd-bars" aria-hidden="true">
          <div><span class="fnd-bar" data-pull-bar></span></div>
          <div><span class="fnd-bar fnd-bar-moved" data-moved-bar></span></div>
        </div>
        <p class="fnd-readout" data-detent-readout aria-live="polite">The sheet settles on the 50% stop. You pulled 80 px past the edge, but it only moved 49 px.</p>
      </div>
      <p><strong>How to use it.</strong> Two small helpers do the work during a drag. <code>rubberBand</code> turns how far past the edge the pointer went into how far the sheet moves, and <code>projectToDetent</code> picks the resting place from the release position and flick speed.</p>
      <pre class="doc-code"><code>import { rubberBand, projectToDetent } from 'cieo/live';

const shown = rubberBand(pulledPastEdge, sheetHeight, 0.55);
const restAt = projectToDetent(position, velocity, [0, 0.5, 0.9]);</code></pre>
    </section>`,
  });
}

function choreographyPage() {
  return shell({
    slug: 'choreography.html',
    title: 'Motion between screens',
    description: 'How Cieo moves content when a view changes, so people keep their place: panels that resize, steps that slide, cards that grow from their button.',
    body: `<header class="doc-head">
      ${crumbs('Motion between screens')}
      <h1>Change without losing your place.</h1>
      <p>When a screen changes, people lose their place if everything just snaps. Cieo moves the old view into the new one so the eye can follow: a panel grows to fit its new content, steps slide forward or back, a card opens out of the button that started it. Every one of these motions is short and can be interrupted.</p>
    </header>

    <section aria-labelledby="edges-h">
      <h2 id="edges-h">Try four kinds of change</h2>
      <p>Click a tab or use the left and right arrow keys. The highlight stretches toward the new tab, front edge first, and the panel slides in from the side you are moving toward.</p>
      <div class="fnd-lab" data-choreo-demo>
        <div class="fnd-tabs">
          <span class="fnd-tab-pill" data-choreo-pill aria-hidden="true"></span>
          <div class="fnd-tablist" role="tablist" aria-label="Kinds of change">
          <button type="button" role="tab" id="choreo-tab-0" aria-controls="choreo-panel" aria-selected="true" tabindex="0" data-step="0">Appear and leave</button>
          <button type="button" role="tab" id="choreo-tab-1" aria-controls="choreo-panel" aria-selected="false" tabindex="-1" data-step="1">Resize</button>
          <button type="button" role="tab" id="choreo-tab-2" aria-controls="choreo-panel" aria-selected="false" tabindex="-1" data-step="2">Slide between steps</button>
          <button type="button" role="tab" id="choreo-tab-3" aria-controls="choreo-panel" aria-selected="false" tabindex="-1" data-step="3">Grow from a button</button>
          </div>
        </div>
        <div class="fnd-stage-card" id="choreo-panel" role="tabpanel" aria-labelledby="choreo-tab-0" tabindex="0" data-choreo-panel>
          <h3 data-choreo-title>Appear and leave</h3>
          <p data-choreo-body>Menus and dialogs ease in quickly and leave even faster, so the screen never feels slow to get out of your way. Lists arrive one item after another, and the whole cascade never takes longer than a third of a second.</p>
        </div>
      </div>
      <p><strong>How to use it.</strong> Wrap content in the part that matches the change and Cieo does the motion. Give <code>MotionFrame</code> a key that changes with the step, and tell it which way you are going with <code>direction</code>: <code>1</code> for forward, <code>-1</code> for back.</p>
      <pre class="doc-code"><code>import { MotionFrame } from 'cieo/MotionFrame';

&lt;MotionFrame contentKey={step} direction={step &gt; previous ? 1 : -1}&gt;
  {steps[step]}
&lt;/MotionFrame&gt;</code></pre>
    </section>

    <section aria-labelledby="primitives-map-h">
      <h2 id="primitives-map-h">Which part to reach for</h2>
      <div class="doc-table-wrap">
        <table>
          <thead><tr><th>You want</th><th>On the web</th><th>On iPhone</th></tr></thead>
          <tbody>
            <tr><td>A panel that grows or shrinks smoothly when its content changes</td><td><a href="../components/MotionFrame.html"><code>MotionFrame</code></a></td><td><code>CieoMotionFrame</code></td></tr>
            <tr><td>A card that opens out of the button that started it</td><td><a href="../components/MorphSurface.html"><code>MorphSurface</code></a></td><td><code>CieoMorphSurface</code></td></tr>
            <tr><td>A list whose items arrive one after another</td><td><a href="../components/StaggerGroup.html"><code>StaggerGroup</code></a></td><td><code>Motion.stagger(i, count:)</code></td></tr>
            <tr><td>Content that slides forward or back through steps</td><td><code>useSharedAxis</code></td><td><code>.cieoSharedAxis(direction:)</code></td></tr>
            <tr><td>A highlight that stretches to the newly chosen tab</td><td><code>useEdges</code></td><td><code>EdgesTrack</code></td></tr>
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
    title: 'Color that stays readable',
    description: 'Pick any Cieo brand color, in light or dark or high contrast, and text stays easy to read. Try it and see the checks.',
    body: `<header class="doc-head">
      ${crumbs('Color that stays readable')}
      <h1>Any brand color, still easy to read.</h1>
      <p>A color that looks great in a logo can make small text hard to read, especially for people with low vision or in bright sunlight. Cieo builds every text, background, button and status color from your brand color so the contrast, meaning how clearly text stands out from what is behind it, stays high. It is checked in 168 combinations of brand, light/dark and contrast before each release.</p>
    </header>

    <section aria-labelledby="matrix-h">
      <h2 id="matrix-h">Change the look, watch the checks</h2>
      <div class="fnd-lab" data-color-lab>
        <div class="fnd-controls">
          <label>Brand <select data-color-brand>${brandOpts}</select></label>
          <label>Background <select data-color-ground>${groundOpts}</select></label>
          <label>Mode <select data-color-scheme><option value="light">Light</option><option value="dark">Dark</option></select></label>
          <label>Contrast <select data-color-contrast><option value="standard">Standard</option><option value="high">High</option></select></label>
        </div>
        <div class="fnd-color-stage" data-color-stage>
          <strong>Your weekly summary is ready</strong>
          <p>Three projects moved forward. One needs a decision from you by Friday.</p>
          <div class="fnd-shape-actions">
            <button type="button" class="cieo cieo-button" data-variant="primary">Review it</button>
            <span class="cieo cieo-badge" data-status="success">On track</span>
            <span class="cieo cieo-badge" data-status="warning">Needs a decision</span>
            <span class="cieo cieo-badge" data-status="danger">Late</span>
          </div>
        </div>
        <p class="fnd-readout" data-contrast-summary aria-live="polite"></p>
        <details class="fnd-details">
          <summary>See every color and its check</summary>
          <div class="fnd-swatches" data-color-swatches></div>
          <div class="doc-table-wrap">
            <table data-contrast-table>
              <thead><tr><th>Text and background</th><th>Contrast</th><th>Needs at least</th><th>Result</th></tr></thead>
              <tbody data-contrast-rows>
                <tr><td>Body text on page background</td><td>15.4 to 1</td><td>4.5 to 1</td><td>Pass</td></tr>
              </tbody>
            </table>
          </div>
        </details>
      </div>
      <p><strong>How to use it.</strong> Pick a brand, a background, and whether it is light or dark, then apply the theme to any part of the page. Behind the scenes the colors are built in OKLCH, a color model where equal steps look equally different to the eye, which is why one brand color can produce a full, readable set. If a combination would fail a check, <code>createTheme</code> refuses it and tells you which pair, so unreadable text cannot ship by accident.</p>
      <pre class="doc-code"><code>import { createTheme, applyTheme } from 'cieo/design';

applyTheme(document.body, createTheme({
  brand: 'lagoon', ground: 'paper', scheme: 'dark', contrast: 'high',
}));</code></pre>
    </section>`,
  });
}

function typographyPage() {
  const radiusLabels = { square: 'Square', crisp: 'Crisp', soft: 'Soft', round: 'Round', pill: 'Pill' };
  const densityLabels = { compact: 'Compact', comfortable: 'Comfortable', spacious: 'Spacious' };
  const radiusButtons = Object.keys(radii).map((r) => `<button type="button" data-shape-radius="${esc(r)}" aria-pressed="${r === 'pill' ? 'true' : 'false'}">${esc(radiusLabels[r] || r)}</button>`).join('');
  const densityButtons = Object.keys(densities).map((d) => `<button type="button" data-shape-density="${esc(d)}" aria-pressed="${d === 'comfortable' ? 'true' : 'false'}">${esc(densityLabels[d] || d)}</button>`).join('');

  return shell({
    slug: 'typography.html',
    title: 'Type and shape',
    description: 'One clean sans typeface for headings and body, five corner styles and three spacing densities, without ever shrinking a touch target.',
    body: `<header class="doc-head">
      ${crumbs('Type and shape')}
      <h1>One typeface, calm shapes.</h1>
      <p>Cieo uses a single clean sans typeface for headings, body text and buttons, so a screen reads in one voice. It is the font already on the person's device, so there is nothing to download and no text jumping around while a font loads. Corner style and spacing change the personality of an app without touching how easy it is to tap.</p>
    </header>

    <section aria-labelledby="type-h">
      <h2 id="type-h">The type, top to bottom</h2>
      <div class="fnd-lab fnd-type-stack">
        <div><span class="site-label">Headline</span><p class="fnd-specimen-display">Plans that settle into place.</p></div>
        <div><span class="site-label">Section title</span><p class="fnd-specimen-title">Every control takes its color and size from the theme.</p></div>
        <div><span class="site-label">Body text</span><p class="fnd-specimen-body">Body text is set for long reading: generous line height, and never too wide to follow from one line to the next.</p></div>
        <div><span class="site-label">Numbers and code</span><p class="fnd-specimen-mono">$1,240.50 &middot; 12:45 &middot; 0123456789</p></div>
      </div>
      <p><strong>How to use it.</strong> Use the size names (<code>--cieo-text-heading</code>, <code>--cieo-text-body</code>) instead of pixel values, and the weight names for emphasis. Headings use the same font as the rest of the page. If your brand needs a different feel, choose <code>font: 'humanist'</code> or <code>'mono'</code> in the theme and every heading and label follows.</p>
    </section>

    <section aria-labelledby="shape-h">
      <h2 id="shape-h">Corners and spacing</h2>
      <p>Try the five corner styles and three densities. Dense layouts fit more on screen, spacious ones are easier on thumbs. Buttons and fields never get smaller than a comfortable touch target in any of them.</p>
      <div class="fnd-lab" data-shape-lab>
        <div class="fnd-controls">
          <div class="fnd-presets" role="group" aria-label="Corner style">${radiusButtons}</div>
          <div class="fnd-presets" role="group" aria-label="Spacing density">${densityButtons}</div>
        </div>
        <div class="fnd-shape-preview" data-shape-stage>
          <div class="fnd-shape-card">
            <strong>Invite a teammate</strong>
            <p>They get an email with a link that works for seven days.</p>
            <div class="fnd-shape-actions">
              <button type="button" class="cieo cieo-button" data-variant="primary">Send invite</button>
              <span class="cieo cieo-badge" data-status="success">Synced</span>
            </div>
          </div>
        </div>
      </div>
      <p><strong>How to use it.</strong> Corners and density are two options on the theme. Everything that uses the theme updates together, so you never restyle buttons one by one.</p>
      <pre class="doc-code"><code>import { createTheme } from 'cieo/design';

createTheme({ radius: 'soft', density: 'compact' });</code></pre>
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
    title: 'Agents you can trust',
    description: 'AI helpers look different from people, ask before anything final, and never claim success before it is confirmed. Try the approval demo.',
    body: `<header class="doc-head">
      ${crumbs('Agents you can trust')}
      <h1>Know who did what, and what is sure.</h1>
      <p>When software acts on your behalf, you need two answers at a glance: was that a person or an automated helper, and did it really happen? Cieo gives helpers, called agents, a square shape with a small antenna, and keeps people round. Agents also never say something worked until the system behind them confirms it.</p>
    </header>

    <section aria-labelledby="silhouette-h">
      <h2 id="silhouette-h">Square for agents, round for people</h2>
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
          <strong>Software agent</strong>
          <p>A square body with an antenna. It never pretends to be a person, and it stops to ask before anything final (<a href="../components/ApprovalRequest.html">ApprovalRequest</a>).</p>
        </div>
        <div class="fnd-mark-box">
          <svg viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <circle cx="40" cy="40" r="24"/>
            <circle cx="40" cy="34" r="7"/>
            <path d="M25 56 C28 47 52 47 55 56" stroke-linecap="round"/>
          </svg>
          <strong>Person</strong>
          <p>A round avatar (<a href="../components/Avatar.html">Avatar</a>). A person gives the final yes for anything destructive or sent outside.</p>
        </div>
      </div>
    </section>

    <section aria-labelledby="approval-h">
      <h2 id="approval-h">An approval that tells the truth</h2>
      <p>Press <strong>Approve</strong>. The button says it is waiting until the system confirms. Turn on <strong>The server does not answer</strong> and you will see Cieo admit it is not sure, instead of showing a success it cannot prove.</p>
      <div class="fnd-lab" data-approval-lab>
        <div class="fnd-approval">
          <span class="cieo-badge" data-approval-badge data-status="info">Waiting for you</span>
          <p data-approval-text>Agent wants to send the invoice to 42 customers.</p>
          <div class="fnd-shape-actions">
            <button type="button" class="cieo cieo-button" data-variant="primary" data-approve>Approve</button>
            <button type="button" class="cieo cieo-button" data-reset hidden>Try again</button>
          </div>
        </div>
        <label class="fnd-check"><input type="checkbox" data-offline> The server does not answer</label>
        <p class="fnd-readout" data-approval-status aria-live="polite">Nothing has been sent.</p>
      </div>
      <p><strong>How to use it.</strong> Use <a href="../components/ApprovalRequest.html">ApprovalRequest</a> and <a href="../components/RunControls.html">RunControls</a> with an async action. The action moves from idle to pending, then to done, failed or uncertain, and the screen only shows success once your code reports it. Also see <a href="../components/AgentStatus.html">AgentStatus</a>, <a href="../components/AgentActivity.html">AgentActivity</a>, <a href="../components/AgentLanes.html">AgentLanes</a>, <a href="../components/StreamingMessage.html">StreamingMessage</a> and <a href="../components/ToolCallDisclosure.html">ToolCallDisclosure</a>.</p>
    </section>

    <section aria-labelledby="glyphs-h">
      <h2 id="glyphs-h">${AGENT_ICONS.length} status icons that stay crisp at any size</h2>
      <p>Each icon is redrawn for small, regular and large sizes, with the line weight adjusted so it looks equally sharp in a tiny badge and on a hero card. Pick a size to see it.</p>
      <div class="fnd-lab" data-agent-size-lab>
        <div class="fnd-presets" role="group" aria-label="Icon size">
          <button type="button" data-glyph-size="18" aria-pressed="false">Small, 18 px</button>
          <button type="button" data-glyph-size="24" aria-pressed="false">Regular, 24 px</button>
          <button type="button" data-glyph-size="36" aria-pressed="true">Large, 36 px</button>
        </div>
        <div class="fnd-agent-grid">${iconCards}</div>
      </div>
      <p><strong>How to use it.</strong> Render <code>AgentIcon</code> with the icon name and a size, and it picks the right drawing for you: <code>&lt;AgentIcon icon="waiting" size={24} /&gt;</code>.</p>
    </section>`,
  });
}

export function foundationPages() {
  return {
    'site/foundations/index.html': overviewPage(),
    'site/foundations/physics.html': physicsPage(),
    'site/foundations/choreography.html': choreographyPage(),
    'site/foundations/color.html': colorPage(),
    'site/foundations/typography.html': typographyPage(),
    'site/foundations/agents.html': agentsPage(),
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
