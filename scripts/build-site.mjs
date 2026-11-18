#!/usr/bin/env node
// Builds the Cieo site pages: home, pricing and contact. Numbers come from the repository (manifests, presets,
// package version), so the pages cannot drift from what the library ships.
// Usage: node scripts/build-site.mjs [--check]
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brands, radii, densities, grounds } from '../design/index.js';
import { siteConfig } from './lib/site-config.mjs';
import { siteFooter, siteHeader, siteStyles } from './lib/site-chrome.mjs';

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
    recipes: JSON.parse(readFileSync(`${repo}/atoms/web/index.json`, 'utf8')).length,
    brands: Object.keys(brands).length, corners: Object.keys(radii).length, densities: Object.keys(densities).length, grounds: Object.keys(grounds).length,
    version: JSON.parse(readFileSync(`${repo}/package.json`, 'utf8')).version,
  };
}

const LAYER_ROWS = [['primitive', 'Primitives', 'Layout, text, icon and overlay'], ['atom', 'Atoms', 'One control or indicator'], ['molecule', 'Molecules', 'A small group that does one job'], ['organism', 'Organisms', 'A whole section or surface']];
const PACK_ROWS = [['auth', 'Auth', 'Sign in, sign up, reset and MFA'], ['messaging', 'Messaging', 'Chat and conversations'], ['audio', 'Audio', 'Players, rooms and recording'], ['agent', 'Agents', 'Activity, approvals and tool calls'], ['social', 'Social', 'Comments, polls and reactions'], ['editorial', 'Editorial', 'Rolls, figures, quotes and steps'], ['tools', 'Tools', 'Import, compare, preview and trim']];

function page({ title, description, current, body, scripts = [], bodyClass = '' }) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="color-scheme" content="light dark">${siteStyles('./')}</head>
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
    scripts: ['./home.js'],
    body: `<section class="site-wrap site-hero">
  <p class="site-label">Spring motion · Interface parts</p>
  <h1 class="site-display">Motion that settles.</h1>
  <p class="site-lead">Cieo is critically damped spring motion for the web and SwiftUI, and a library of ${f.components} interface parts that move the same way: no overshoot, no bounce, nothing left to tune.</p>
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
<section class="site-wrap site-section">
  <div class="site-section-head"><p class="site-label">Three ideas</p><h2 class="site-title">Less to tune, more to trust.</h2></div>
  <div class="ideas">
    <div><h3>One spring, no tuning</h3><p>Every motion is a closed-form critically damped spring set by one number, its natural frequency. It cannot overshoot, so there is no bounce to tune away.</p></div>
    <div><h3>The same on web and Apple</h3><p>DOM and React on the web, SwiftUI on Apple platforms. The same presets, so a screen feels the same wherever it runs.</p></div>
    <div><h3>Themed by tokens</h3><p>${f.brands} brands, ${f.corners} corner profiles, ${f.densities} densities and ${f.grounds} grounds. Every combination of color is audited for contrast before it ships.</p></div>
  </div>
</section>
<section class="site-wrap site-section" id="library">
  <div class="site-section-head"><p class="site-label">The library</p><h2 class="site-title">Foundations first, then use cases.</h2><p class="site-prose">Primitives are the foundation. Atoms, molecules and organisms build on them. Packs gather the parts that only make sense for one kind of product, so you never see sign-in cards while building a docs site.</p></div>
  <div class="index-split">
    <div><h3 class="site-label">By layer</h3><ul class="index-list">${LAYER_ROWS.map(([id, name, note]) => `<li><a href="./components/#${id}s"><span class="index-count">${String(f.layers[id] ?? 0).padStart(2, '0')}</span><span class="index-name">${name}</span><span class="index-note">${note}</span></a></li>`).join('')}</ul></div>
    <div><h3 class="site-label">By use case</h3><ul class="index-list">${PACK_ROWS.map(([id, name, note]) => `<li><a href="./components/#pack-${id}"><span class="index-count">${String(f.packs[id] ?? 0).padStart(2, '0')}</span><span class="index-name">${name}</span><span class="index-note">${note}</span></a></li>`).join('')}</ul></div>
  </div>
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
  return { 'site/index.html': home(f), 'site/pricing.html': pricing(f), 'site/contact.html': contact() };
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
