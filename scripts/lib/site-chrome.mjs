// Shared header, footer and head for every site page, so the docs and the pages around them read as one site.
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
  if (href.startsWith('../')) return up === './' ? href : `${up}${href}`;
  return `${up}${href}`;
}

/** `up` is the relative path from the page to /site/, such as './' on the home page and '../' in the library. */
export function siteHeader(up, current = '') {
  const links = NAV.map(([label, href]) => `<a href="${resolveNavHref(up, href)}"${current === label ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const searchBtn = `<button type="button" class="site-search-btn" data-search-open aria-label="Search library, recipes, and foundations" aria-keyshortcuts="Meta+K Control+K"><span>Search</span><kbd aria-hidden="true">⌘K</kbd></button>`;
  return `<a class="site-skip" href="#main">Skip to content</a><header class="site-header"><a class="site-mark" href="${up}" aria-label="${siteConfig.name} home"><svg viewBox="0 0 30 16" width="30" height="16" aria-hidden="true" focusable="false"><path d="M0 15 H30" class="site-mark-base"/><path d="${springCurve()}" class="site-mark-curve"/></svg><span>${siteConfig.name}</span></a><nav class="site-nav" aria-label="Site">${links}</nav>${searchBtn}</header>`;
}

export function siteFooter(up) {
  const links = NAV.map(([label, href]) => `<a href="${resolveNavHref(up, href)}">${label}</a>`).join('');
  return `<footer class="site-footer"><div class="site-wrap site-footer-grid"><p>${siteConfig.name} is spring motion and interface parts for the web and SwiftUI. MIT licensed.</p><nav aria-label="Footer">${links}<a href="${esc(siteConfig.repo)}">Source</a></nav></div></footer><script type="module" src="${up}search.js" data-site-up="${up}"></script>`;
}

/** Stylesheets in cascade order: the site theme, the library's component styles, then the site and docs rules. */
export function siteStyles(up, withDocs = false) {
  const root = up === './' ? '../' : `${up}../`;
  return [`${root}site/theme.css`, `${root}tokens/tokens.css`, `${root}design/primitives.css`, ...(withDocs ? [`${up}doc.css`] : []), `${up}site.css`]
    .map((href) => `<link rel="stylesheet" href="${href}">`).join('');
}
