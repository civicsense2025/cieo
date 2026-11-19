// Shared header, footer and head for every site page, so the docs and the pages around them read as one site.
import { posix } from 'node:path';
import { siteConfig } from './site-config.mjs';

/** The mark is the spring's own step response, y = 1 - e^(-wt)(1 + wt): it rises and settles without overshoot. */
export function springCurve(w = 9, width = 30, height = 16, steps = 24) {
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps, y = 1 - Math.exp(-w * t) * (1 + w * t);
    points.push(`${(t * width).toFixed(2)} ${(height - 1 - y * (height - 3)).toFixed(2)}`);
  }
  return `M${points.join(' L')}`;
}

export const NAV = Object.freeze([
  ['Foundations', 'foundations/'],
  ['Studio', '../docs/studio/'],
  ['Library', 'components/'],
  ['Recipes', 'recipes/'],
  ['Composites', 'composites/'],
  ['Pricing', 'pricing.html'],
  ['Contact', 'contact.html'],
]);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function resolveNavHref(up, href) {
  if (href.startsWith('../')) return up === './' ? href : posix.normalize(`${up}${href}`);
  return `${up}${href}`;
}

/** `up` is the relative path from the page to /site/, such as './' on the home page and '../' in the library. */
export function siteHeader(up, current = '', skipTo = 'main') {
  const links = NAV.map(([label, href]) => `<a href="${resolveNavHref(up, href)}"${current === label ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const searchBtn = `<button type="button" class="site-search-btn" data-search-open aria-label="Search library, recipes, composites, and foundations" aria-keyshortcuts="Meta+K Control+K"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2 17 17"/></svg><kbd aria-hidden="true">⌘K</kbd></button>`;
  const menuBtn = `<button type="button" class="site-menu-btn" data-site-menu aria-expanded="false" aria-controls="site-nav" aria-label="Menu"><svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false"><path d="M3 7h14M3 13h14"/></svg></button>`;
  return `<a class="site-skip" href="#${skipTo}">Skip to content</a><header class="site-header"><a class="site-mark" href="${up}" aria-label="${siteConfig.name} home"><svg viewBox="0 0 30 16" width="30" height="16" aria-hidden="true" focusable="false"><path d="M0 15 H30" class="site-mark-base"/><path d="${springCurve()}" class="site-mark-curve"/></svg><span>${siteConfig.name}</span></a><nav class="site-nav" id="site-nav" aria-label="Site">${links}</nav>${searchBtn}${menuBtn}</header>`;
}

export function siteFooter(up) {
  const links = NAV.map(([label, href]) => `<a href="${resolveNavHref(up, href)}">${label}</a>`).join('');
  return `<footer class="site-footer"><div class="site-wrap site-footer-grid"><p>${siteConfig.name} is spring motion and interface parts for the web and SwiftUI. MIT licensed.</p><nav aria-label="Footer">${links}<a href="${esc(siteConfig.repo)}">Source</a></nav></div></footer><script type="module" src="${up}search.js" data-site-up="${up}"></script>`;
}

/** Stylesheets in cascade order: the site theme, the library's component styles, then the site and docs rules. */
export function siteStyles(up, withDocs = false, withControls = false) {
  const root = up === './' ? '../' : `${up}../`;
  return [`${up}theme.css`, `${root}tokens/tokens.css`, `${root}design/primitives.css`, ...(withControls ? [`${root}dist/controls/controls.css`] : []), ...(withDocs ? [`${up}doc.css`] : []), `${up}site.css`]
    .map((href) => `<link rel="stylesheet" href="${href}">`).join('');
}

/** Swaps the skip link, header, footer and search script of a hand-written page for the shared ones, so it cannot drift from the rest of the site. */
export function stampChrome(html, up, current) {
  return html
    .replace(/<a class="site-skip"[\s\S]*?<\/header>/, () => siteHeader(up, current))
    .replace(/<footer class="site-footer">[\s\S]*?<\/footer>(?:\s*<script type="module" src="[^"]*search\.js"[^>]*><\/script>)?/, () => siteFooter(up))
    .replace(/(<link rel="stylesheet" href=")(?:\.\.\/)+site\/theme\.css(">)/, `$1${up}theme.css$2`);
}

/** Pages outside site/ (the Studio) mark where the shared chrome goes with <!-- site-header --> and <!-- site-footer --> pairs. */
export function stampMarked(html, up, current, skipTo) {
  const swap = (name, markup) => (text) => text.replace(new RegExp(`(<!-- ${name} -->)[\\s\\S]*?(<!-- /${name} -->)`), (_, a, b) => `${a}\n${markup}\n${b}`);
  return swap('site-footer', siteFooter(up))(swap('site-header', siteHeader(up, current, skipTo))(html));
}
