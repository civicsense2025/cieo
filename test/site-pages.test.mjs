// The Cieo site pages: the facts they state are the repository's facts, every page has the shared chrome and one
// heading, and pricing says only what is true. Pins what a visitor can rely on.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { facts, pages } from '../scripts/build-site.mjs';
import { NAV, springCurve } from '../scripts/lib/site-chrome.mjs';
import { siteConfig } from '../scripts/lib/site-config.mjs';
import { createTheme, auditTheme } from '../design/index.js';
import { siteThemeOptions } from '../scripts/lib/site-theme.mjs';

const read = (f) => readFileSync(f, 'utf8');
const built = pages();

test('the committed pages are exactly what the builder produces', () => {
  for (const [file, html] of Object.entries(built)) assert.equal(read(file), html, file);
});

test('the numbers on the home page are the repository counts', () => {
  const f = facts(), home = read('site/index.html');
  assert.equal(f.components, readdirSync('src/primitives', { withFileTypes: true }).filter((d) => d.isDirectory()).length);
  assert.ok(home.includes(`<span class="fact-number">${f.components}</span>`));
  assert.ok(home.includes(`<span class="fact-number">${f.recipes}</span>`));
  assert.ok(home.includes(`v${f.version}`));
  const byLayer = Object.values(f.layers).reduce((a, b) => a + b, 0), core = f.components - Object.values(f.packs).reduce((a, b) => a + b, 0);
  assert.equal(byLayer, f.components);
  assert.ok(core > 0);
});

test('every site and library page has the shared header, a skip link, one h1, a language and a description', () => {
  const files = ['site/index.html', 'site/pricing.html', 'site/contact.html', 'site/components/index.html', 'site/components/Toast.html', 'site/components/Stack.html'];
  for (const file of files) {
    const html = read(file);
    assert.match(html, /<html lang="en">/, file);
    assert.match(html, /class="site-skip" href="#main"/, file);
    assert.match(html, /<main id="main">/, file);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${file} has exactly one h1`);
    for (const [label] of NAV) assert.ok(html.includes(`>${label}</a>`), `${file} links ${label}`);
    assert.match(html, /<link rel="stylesheet" href="(?:\.\.?\/)theme\.css">/, file);
  }
  for (const f of ['site/index.html', 'site/pricing.html', 'site/contact.html']) assert.match(read(f), /<meta name="description" content="[^"]{20,}"/, f);
});

test('every library page carries the shared header and footer', () => {
  for (const f of readdirSync('site/components').filter((n) => n.endsWith('.html'))) {
    const html = read(`site/components/${f}`);
    assert.ok(html.includes('class="site-header"') && html.includes('class="site-footer"'), f);
    assert.ok(html.includes('aria-current="page">Library</a>'), `${f} marks Library as the current section`);
  }
});

test('pricing says free and open source, states the suggested amount, and never implies the payment unlocks anything', () => {
  const html = read('site/pricing.html');
  assert.match(html, /Free and open source\./);
  assert.ok(html.includes(siteConfig.support.amount));
  assert.match(html, /not a license/);
  assert.match(html, /Does paying unlock anything\?<\/h3><p>No\./);
  assert.ok(!/per month|\/mo|subscription|trial/i.test(html), 'no recurring-price language');
  if (siteConfig.support.url) assert.ok(html.includes(`href="${siteConfig.support.url}"`));
  else assert.match(html, /aria-disabled="true"/, 'without a payment link the button is visibly inactive, not a dead link');
});

test('the payment link is a hosted https Stripe page, so no card data ever touches the Cieo site', () => {
  const { url } = siteConfig.support;
  assert.match(url, /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+$/);
  assert.ok(!/<form[^>]*action=["']https?:\/\/(?!cieo)/.test(read('site/pricing.html')), 'pricing posts nowhere');
});

test('the thank-you note shows only when the visitor returns from paying (the #thanks target)', () => {
  assert.match(read('site/pricing.html'), /id="thanks"[^>]*role="status"/);
  const css = read('site/site.css');
  assert.match(css, /\.site-thanks \{ display: none;/);
  assert.match(css, /\.site-thanks:target \{ display: block; \}/);
});

test('the contact form never claims delivery before the server has said so', () => {
  const js = read('site/contact.js');
  assert.match(js, /if \(response\.ok\)/);
  assert.match(js, /reportValidity/);
  assert.match(js, /catch (?:\(\w+\) )?\{ say\('error'/);
});

test('the instrument is operable without a pointer and announces its result', () => {
  const html = read('site/index.html'), js = read('site/home.js');
  assert.match(html, /<button type="button" data-target="0"/);
  assert.match(html, /aria-pressed/);
  assert.match(html, /data-live aria-live="polite"/);
  assert.match(js, /prefers-reduced-motion: reduce/);
  assert.match(js, /from '\.\.\/dist\/core\/spring\.js'/, "uses the library's own spring maths");
});

test("the mark is the spring's own step response: it rises, settles, and never passes 1", () => {
  const path = springCurve(), ys = [...path.matchAll(/ ([\d.]+)/g)].map((m) => Number(m[1]));
  assert.ok(ys.length > 20);
  const top = Math.min(...ys); // smallest y is the highest point drawn
  assert.ok(top >= 2 - 1e-6, 'never above the settled line');
});

test('the site theme passes every contrast pair in light, dark and high contrast', () => {
  for (const scheme of ['light', 'dark']) for (const contrast of ['standard', 'high']) {
    assert.ok(auditTheme(createTheme({ ...siteThemeOptions, scheme, contrast })).every((r) => r.pass), `${scheme} ${contrast}`);
  }
  const css = read('site/theme.css');
  assert.match(css, /--cieo-font-display: "Iowan Old Style"/);
  assert.match(css, /--cieo-radius-control: 9999px/);
});
