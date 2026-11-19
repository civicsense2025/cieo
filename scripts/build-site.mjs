#!/usr/bin/env node
// Builds the Cieo site pages: home, pricing and contact. Numbers come from the repository (manifests, presets,
// package version), so the pages cannot drift from what the library ships.
// Usage: node scripts/build-site.mjs [--check]
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brands, radii, densities, grounds } from '../design/index.js';
import { recipeCount } from './lib/recipe-count.mjs';
import { siteConfig } from './lib/site-config.mjs';
import { siteFooter, siteHeader, siteStyles, stampChrome, stampMarked } from './lib/site-chrome.mjs';
import { tileHtml } from './lib/tiles.mjs';
import { builtFromSection, compositeHead, indexCards } from './lib/composites.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Counts straight from the manifests, in the order the library page lists them. */
export function facts(repo = root) {
  const dirs = readdirSync(`${repo}/src/primitives`, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  const layers = {}, packs = {};
  for (const d of dirs) {
    const m = JSON.parse(readFileSync(`${repo}/src/primitives/${d}/manifest.json`, 'utf8'));
    layers[m.layer] = (layers[m.layer] ?? 0) + 1;
    if (m.packId !== 'core') packs[m.packId] = (packs[m.packId] ?? 0) + 1;
  }
  return {
    components: dirs.length, layers, packs,
    recipes: recipeCount(repo),
    brands: Object.keys(brands).length, corners: Object.keys(radii).length, densities: Object.keys(densities).length, grounds: Object.keys(grounds).length,
    version: JSON.parse(readFileSync(`${repo}/package.json`, 'utf8')).version,
  };
}

const HOME_PARTS = ['Button', 'Switch', 'Slider', 'SegmentedControl', 'Calendar', 'CommandPalette', 'Table', 'Card'];

function page({ title, description, current, body, scripts = [], bodyClass = '', controls = false }) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="color-scheme" content="light dark">${siteStyles('./', false, controls)}</head>
<body class="cieo cieo-site${bodyClass}">
${siteHeader('./', current)}
<main id="main">
${body}
</main>
${siteFooter('./')}
${scripts.map((s) => `<script type="module" src="${s}"></script>`).join('')}
</body>
</html>
`;
}

function home(f) {
  return page({
    title: 'Cieo: motion that settles',
    description: `Critically damped spring motion for the web and SwiftUI, and ${f.components} interface parts that move the same way.`,
    current: '',
    scripts: ['./home.js', './tile-fit.js'],
    controls: true,
    body: `<section class="site-wrap site-hero">
  <h1 class="site-display">Motion that settles.</h1>
  <p class="site-lead">Spring motion and ${f.components} interface parts. No overshoot, nothing to tune.</p>
  <div class="site-actions"><a class="site-btn" href="./components/">Browse the library</a><a class="site-btn" data-variant="ring" href="#install">Install</a></div>
</section>
<section class="site-wrap" aria-labelledby="instrument-h">
  <h2 id="instrument-h" class="site-sr">Watch both springs settle</h2>
  <div class="instrument" data-instrument role="group" aria-label="Two springs chasing one target">
    <div class="lane" data-lane="settle"><div class="lane-head"><b>Cieo · critically damped</b><output>0.0% · v 0.00/s · overshoot 0.0%</output></div><div class="track"><div class="track-ticks"></div><span class="target"></span><span class="marker"></span></div></div>
    <div class="lane" data-lane="bounce"><div class="lane-head"><b>Typical bouncy spring</b><output>0.0% · v 0.00/s · overshoot 0.0%</output></div><div class="track"><div class="track-ticks"></div><span class="target"></span><span class="marker"></span></div></div>
    <div class="instrument-controls"><div class="segments" role="group" aria-label="Move the target"><button type="button" data-target="0" aria-pressed="false">Left</button><button type="button" data-target="0.5" aria-pressed="false">Middle</button><button type="button" data-target="1" aria-pressed="true">Right</button></div><p class="instrument-note">Same natural frequency, different damping. Cieo settles in <span data-settle>0.42 s</span>. Click a track to set the target.</p></div>
    <p class="site-sr" data-live aria-live="polite"></p>
  </div>
</section>
<section class="site-wrap" style="padding-block-start: var(--cieo-space-16)" aria-label="The library in numbers">
  <div class="facts">
    <div><span class="fact-number">${f.components}</span><span class="site-label">Components</span></div>
    <div><span class="fact-number">${f.recipes}</span><span class="site-label">Motion recipes</span></div>
    <div><span class="fact-number">${f.brands}</span><span class="site-label">Brands</span></div>
    <div><span class="fact-number">AA</span><span class="site-label">Contrast audited</span></div>
  </div>
</section>
<section class="site-wrap site-section" id="library" aria-label="The library, live">
  <ul class="tiles">${HOME_PARTS.map((dir) => tileHtml(root, { dir, name: dir }, './components/')).join('')}</ul>
  <p class="site-actions"><a class="site-btn" href="./components/">All ${f.components} parts</a></p>
</section>
<section class="site-wrap site-section" id="install">
  <div class="site-section-head"><p class="site-label">Install</p><h2 class="site-title">Two lines to the first part.</h2></div>
  <pre class="codeblock"><code>npm install github:civicsense2025/cieo#v${f.version}
import { Badge } from 'cieo/Badge';</code></pre>
</section>`,
  });
}

function pricing(f) {
  const { amount, url } = siteConfig.support;
  const action = url
    ? `<a class="site-btn" href="${esc(url)}">Support Cieo · ${esc(amount)}</a>`
    : `<span class="site-btn" aria-disabled="true" role="link">Support link coming soon</span>`;
  return page({
    title: 'Pricing · Cieo',
    description: 'Cieo is free and open source under the MIT license. A one-time suggested payment funds the work.',
    current: 'Pricing',
    body: `<section class="site-wrap site-hero">
  <p class="site-label">Pricing</p>
  <h1 class="site-display">Free and open source.</h1>
  <p class="site-lead">Cieo is MIT licensed. Use it in personal and commercial work with no fee, no license key and no account.</p>
</section>
<section class="site-wrap">
  <p id="thanks" class="site-thanks" role="status" tabindex="-1">Thank you. Your support keeps Cieo maintained, and a receipt is on its way to your email.</p>
  <div class="price-panel">
    <div>
      <p class="site-label">The library</p>
      <p class="price-figure">$0</p>
      <ul class="price-list">
        <li>All ${f.components} components, in every layer and pack</li>
        <li>${f.recipes} motion recipes, and the spring core for the web and SwiftUI</li>
        <li>${f.brands} brands, ${f.corners} corner profiles and ${f.densities} densities, with every color combination audited</li>
        <li>Theme tokens exported for Swift, Kotlin, Rust, Dart, Python and C</li>
      </ul>
    </div>
    <div>
      <p class="site-label">Fund the work</p>
      <p class="price-figure">${esc(amount)}</p>
      <p class="site-prose">One time, and only if Cieo saves you time. It is a suggestion, not a license: skipping it changes nothing about what you can use or ship.</p>
      <div class="site-actions" style="margin-block-start: var(--cieo-space-6)">${action}</div>
    </div>
  </div>
</section>
<section class="site-wrap site-section">
  <div class="site-section-head"><p class="site-label">Questions</p><h2 class="site-title">The short answers.</h2></div>
  <div class="ideas">
    <div><h3>Can I use it commercially?</h3><p>Yes. The MIT license covers commercial use, and there is nothing to buy first.</p></div>
    <div><h3>Does paying unlock anything?</h3><p>No. Everything is already in the library. The payment only helps keep it maintained.</p></div>
    <div><h3>Something else?</h3><p><a href="./contact.html">Write to us.</a> We read every message.</p></div>
  </div>
</section>`,
  });
}

function contact() {
  const topics = [['question', 'A question'], ['bug', 'Something is broken'], ['idea', 'An idea'], ['other', 'Something else']];
  return page({
    title: 'Contact · Cieo',
    description: 'Write to the people behind Cieo: questions, bugs and ideas.',
    current: 'Contact',
    scripts: ['./contact.js'],
    body: `<section class="site-wrap site-hero">
  <p class="site-label">Contact</p>
  <h1 class="site-display">Write to us.</h1>
  <p class="site-lead">Questions, bugs and ideas all land in one inbox. We read every message.</p>
</section>
<section class="site-wrap">
  <form class="form" method="post" action="${esc(siteConfig.contactEndpoint)}" data-contact novalidate>
    <label>Your name<input name="name" autocomplete="name" required maxlength="100"></label>
    <label>Email<input name="email" type="email" autocomplete="email" required maxlength="200"><span class="hint">So we can reply. We use it for nothing else.</span></label>
    <label>About<select name="topic">${topics.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>
    <label>Message<textarea name="message" required minlength="10" maxlength="5000"></textarea></label>
    <label class="form-trap" aria-hidden="true">Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label>
    <input type="hidden" name="t" value="">
    <div class="site-actions"><button class="site-btn" type="submit">Send message</button></div>
    <p class="form-status" role="status" aria-live="polite" data-status></p>
  </form>
</section>`,
  });
}

export function pages(repo = root) {
  const f = facts(repo);
  const out = { 'site/index.html': home(f), 'site/pricing.html': pricing(f), 'site/contact.html': contact() };
  // Composite screens are hand-written; their chrome (skip link, header, footer, search), their stylesheet and the
  // live "Built from" grid (read from the screen's own markup and the library's previews) are owned here.
  for (const name of readdirSync(`${repo}/site/composites`).filter((n) => n.endsWith('.html'))) {
    const rel = `site/composites/${name}`, slug = name.slice(0, -5);
    let html = stampChrome(readFileSync(`${repo}/${rel}`, 'utf8'), '../', 'Composites');
    const js = existsSync(`${repo}/site/composites/${slug}.js`) ? readFileSync(`${repo}/site/composites/${slug}.js`, 'utf8') : '';
    html = html.replace(/(?:<link rel="stylesheet" href="\.\.\/\.\.\/dist\/controls\/controls\.css">)?<link rel="stylesheet" href="\.\.\/composites\/composites\.css"><script>[^<]*<\/script>\n?/, '').replace('</head>', () => `${compositeHead('../', /cieo-ctl/.test(html + js))}\n</head>`);
    if (slug === 'index') html = html.replace(/<!--comp-cards-->[\s\S]*?<!--\/comp-cards-->/, () => `<!--comp-cards-->\n${indexCards(repo)}\n<!--/comp-cards-->`);
    else html = html.replace(/<section\b[^>]*data-built-from[^>]*>[\s\S]*?<\/section>/, () => builtFromSection(repo, slug));
    out[rel] = html;
  }
  // The Studio lives under docs/; its chrome points back into site/.
  const studio = 'docs/studio/index.html';
  out[studio] = stampMarked(readFileSync(`${repo}/${studio}`, 'utf8'), '../../site/', 'Studio', 'preview');
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let stale = 0;
  for (const [rel, html] of Object.entries(pages())) {
    const path = `${root}/${rel}`, current = existsSync(path) ? readFileSync(path, 'utf8') : null;
    if (current === html) continue;
    if (check) { console.error(`stale: ${rel}`); stale += 1; } else writeFileSync(path, html);
  }
  if (stale) { console.error('site check failed: run node scripts/build-site.mjs'); process.exit(1); }
  console.log(`site pages ${check ? 'verified' : 'written'}`);
}
