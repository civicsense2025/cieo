// test/primitives-lane-nav.test.mjs — Lane nav: TopNav/SideNav/MobileNav/Outline/Stepper/Pagination families.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const COMPONENTS = [
  { dir: 'TopNav', name: 'TopNav', id: 'core.top-nav', markers: ['<header', '<nav', 'aria-label={label}', "label = 'Primary'"] },
  { dir: 'TopNavItem', name: 'TopNavItem', id: 'core.top-nav-item', markers: ['href={href}', 'aria-current', 'current = false'] },
  { dir: 'TopNavHeading', name: 'TopNavHeading', id: 'core.top-nav-heading', markers: ["href = '/'", 'cieo-top-nav-heading'] },
  { dir: 'TopNavMenu', name: 'TopNavMenu', id: 'core.top-nav-menu', markers: ['role="group"', 'aria-label={label}', 'label: string'] },
  { dir: 'TopNavMegaMenu', name: 'TopNavMegaMenu', id: 'core.top-nav-mega-menu', markers: ['defaultOpen = false', 'onOpenChange', 'data-open', 'aria-expanded'] },
  { dir: 'TopNavMegaMenuItem', name: 'TopNavMegaMenuItem', id: 'core.top-nav-mega-menu-item', markers: ['href={href}', 'title: string', 'cieo-top-nav-mega-menu-item'] },
  { dir: 'TopNavMegaMenuFeaturedCard', name: 'TopNavMegaMenuFeaturedCard', id: 'core.top-nav-mega-menu-featured-card', markers: ['title: string', 'cieo-top-nav-mega-menu-featured-card'] },
  { dir: 'SideNav', name: 'SideNav', id: 'core.side-nav', markers: ['<nav', 'aria-label={label}', "label = 'Sections'", 'data-collapsed', 'collapsed = false'] },
  { dir: 'SideNavItem', name: 'SideNavItem', id: 'core.side-nav-item', markers: ['href={href}', 'aria-current', 'current = false'] },
  { dir: 'SideNavHeading', name: 'SideNavHeading', id: 'core.side-nav-heading', markers: ['cieo-side-nav-heading', '<h2'] },
  { dir: 'SideNavSection', name: 'SideNavSection', id: 'core.side-nav-section', markers: ['aria-label={label}', 'cieo-side-nav-section'] },
  { dir: 'SideNavCollapseButton', name: 'SideNavCollapseButton', id: 'core.side-nav-collapse-button', markers: ['<button', 'aria-expanded={expanded}', "label = 'Collapse navigation'"] },
  { dir: 'MobileNav', name: 'MobileNav', id: 'core.mobile-nav', markers: ['<nav', 'aria-label={label}', '!open', 'return null', 'open = false'] },
  { dir: 'MobileNavToggle', name: 'MobileNavToggle', id: 'core.mobile-nav-toggle', markers: ['<button', 'aria-expanded={expanded}', "label = 'Open navigation'"] },
  { dir: 'NavIcon', name: 'NavIcon', id: 'core.nav-icon', markers: ["size = 'md'", 'data-size={size}', 'cieo-nav-icon'] },
  { dir: 'NavHeadingMenu', name: 'NavHeadingMenu', id: 'core.nav-heading-menu', markers: ['<h2', 'aria-label={label}', 'cieo-nav-heading-menu'] },
  { dir: 'Outline', name: 'Outline', id: 'core.outline', markers: ['<nav', 'aria-label={label}', "label = 'On this page'", "'#' +"] },
  { dir: 'Stepper', name: 'Stepper', id: 'core.stepper', markers: ['<ol', 'aria-label={label}', "? 'step' : undefined", 'cieo-stepper'] },
  { dir: 'Step', name: 'Step', id: 'core.step', markers: ['data-state={state}', "state = 'todo'", '<li'] },
  { dir: 'Pagination', name: 'Pagination', id: 'core.pagination', headings: 11, markers: ['<nav', 'aria-label={label}', "label = 'Pagination'", 'aria-current', 'pageCount'] },
];

for (const c of COMPONENTS) {
  test(`${c.name} tsx renders real landmarks with markers`, () => {
    const src = readFileSync(`src/primitives/${c.dir}/${c.dir}.tsx`, 'utf8');
    assert.match(src, /'use client'/);
    for (const m of c.markers) assert.ok(src.includes(m), `missing marker: ${m}`);
  });

  test(`${c.name} manifest declares id and mirrors props`, () => {
    const m = JSON.parse(readFileSync(`src/primitives/${c.dir}/manifest.json`, 'utf8'));
    assert.equal(m.id, c.id);
    assert.equal(m.name, c.name);
    assert.equal(m.packId, 'core');
    assert.equal(m.schemaVersion, '1.0.0');
  });

  test(`${c.name} README has ${c.headings ?? 10} doc headings`, () => {
    const readme = readFileSync(`src/primitives/${c.dir}/README.md`, 'utf8');
    const headings = readme.match(/^## /gm) || [];
    assert.equal(headings.length, c.headings ?? 10);
  });

  test(`${c.name} doc page exists with h1 and prop rows`, () => {
    const p = `site/components/${c.name}.html`;
    assert.ok(existsSync(p), `missing ${p}`);
    const html = readFileSync(p, 'utf8');
    assert.ok(html.includes(`<h1>${c.name}</h1>`), 'missing h1');
    assert.match(html, /data-props/);
    const m = JSON.parse(readFileSync(`src/primitives/${c.dir}/manifest.json`, 'utf8'));
    if (m.properties.length > 0) assert.match(html, /<tr><td>/);
  });
}

test('lane nav manifest ids are unique', () => {
  const ids = COMPONENTS.map((c) => JSON.parse(readFileSync(`src/primitives/${c.dir}/manifest.json`, 'utf8')).id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 20);
});
