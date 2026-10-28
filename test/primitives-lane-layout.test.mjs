// test/primitives-lane-layout.test.mjs — Lane layout: Section, Center, AspectRatio,
// FormLayout, Grid, GridSpan, Layout, LayoutHeader, LayoutContent, LayoutFooter,
// LayoutPanel, HStack, VStack, StackItem, ScrollableArea, AppShell.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const LANE = [
  { name: 'Section', id: 'core.section', props: 2, tsx: [/<section/, /aria-label=\{label\}/, /cieo-section/], css: [/--cieo-space-4/, /cieo-section/] },
  { name: 'Center', id: 'core.center', props: 1, tsx: [/maxWidth\s*=\s*'60rem'/, /style=\{\{ maxWidth \}\}/, /cieo-center/], css: [/margin-inline:\s*auto/, /--cieo-space-4/] },
  { name: 'AspectRatio', id: 'core.aspect-ratio', props: 1, tsx: [/aspectRatio:\s*ratio/, /cieo-aspect-ratio/], css: [/position:\s*relative/, /position:\s*absolute/] },
  { name: 'FormLayout', id: 'core.form-layout', props: 1, tsx: [/data-columns=\{columns\}/, /columns\s*=\s*1/, /cieo-form-layout/], css: [/data-columns='2'/, /--cieo-space-4/] },
  { name: 'Grid', id: 'core.grid', props: 2, tsx: [/data-columns=\{columns\}/, /data-gap=\{gap\}/, /cieo-grid/], css: [/repeat\(12/, /data-gap='sm'/] },
  { name: 'GridSpan', id: 'core.grid-span', props: 1, tsx: [/data-span=\{span\}/, /cieo-grid-span/], css: [/grid-column:\s*span 12/, /data-span='1'/] },
  { name: 'Layout', id: 'core.layout', props: 0, tsx: [/cieo-layout/], css: [/100dvh/, /auto\/1fr\/auto|1fr/] },
  { name: 'LayoutHeader', id: 'core.layout-header', props: 1, tsx: [/<header/, /aria-label=\{label\}/, /cieo-layout-header/], css: null },
  { name: 'LayoutContent', id: 'core.layout-content', props: 1, tsx: [/<main/, /aria-label=\{label\}/, /cieo-layout-content/], css: null },
  { name: 'LayoutFooter', id: 'core.layout-footer', props: 1, tsx: [/<footer/, /aria-label=\{label\}/, /cieo-layout-footer/], css: null },
  { name: 'LayoutPanel', id: 'core.layout-panel', props: 2, tsx: [/<aside/, /aria-label=\{label\}/, /data-side=\{side\}/, /cieo-layout-panel/], css: [/border-inline-start/, /border-inline-end/] },
  { name: 'HStack', id: 'core.h-stack', props: 1, tsx: [/data-gap=\{gap\}/, /gap\s*=\s*'md'/, /cieo-h-stack/], css: [/display:\s*flex/, /flex-direction:\s*row/] },
  { name: 'VStack', id: 'core.v-stack', props: 1, tsx: [/Stack as VStack/, /VStackProps/, /Stack\.js/], css: null },
  { name: 'StackItem', id: 'core.stack-item', props: 1, tsx: [/data-grow/, /grow/, /cieo-stack-item/], css: [/data-grow='true'/, /flex:\s*1 1 auto/] },
  { name: 'ScrollableArea', id: 'core.scrollable-area', props: 2, tsx: [/data-orientation=\{orientation\}/, /maxHeight/, /cieo-scrollable-area/], css: [/overflow-y:\s*auto/, /overflow-x:\s*auto/] },
  { name: 'AppShell', id: 'core.app-shell', props: 0, tsx: [/cieo-app-shell/, /cieo-app-shell-nav/, /cieo-app-shell-main/], css: [/auto 1fr/, /--cieo-space-4/] },
];

for (const entry of LANE) {
  test(`${entry.name} tsx renders landmark, props, and class marker`, () => {
    const src = readFileSync(`src/primitives/${entry.name}/${entry.name}.tsx`, 'utf8');
    assert.match(src, /'use client';/);
    for (const marker of entry.tsx) assert.match(src, marker);
  });

  test(`${entry.name} manifest declares id and mirrors props`, () => {
    const m = JSON.parse(readFileSync(`src/primitives/${entry.name}/manifest.json`, 'utf8'));
    assert.equal(m.id, entry.id);
    assert.equal(m.packId, 'core');
    assert.equal(m.status, 'experimental');
    const customization = m.properties.filter((p) => ['className', 'slotProps', 'slots'].includes(p.id));
    assert.equal(m.properties.length - customization.length, entry.props);
    for (const property of customization) assert.equal(property.type.kind, property.id === 'className' ? 'string' : 'record');
  });

  test(`${entry.name} doc page exists with h1 and prop rows`, () => {
    const html = readFileSync(`site/components/${entry.name}.html`, 'utf8');
    assert.match(html, new RegExp(`<h1>${entry.name}</h1>`));
    const tbody = html.match(/<tbody>([\s\S]*?)<\/tbody>/);
    assert.ok(tbody, 'page has props tbody');
    assert.equal((tbody[1].match(/<tr>/g) || []).length, entry.props);
  });

  if (entry.css) {
    test(`${entry.name} CSS uses tokens and own selectors`, () => {
      const css = readFileSync(`design/styles/primitives/${entry.name.toLowerCase()}.css`, 'utf8');
      assert.match(css, /@layer cieo\.components/);
      assert.match(css, /:where\(\.cieo\)/);
      for (const marker of entry.css) assert.match(css, marker);
    });
  }
}

test('lane layout manifest ids are unique', () => {
  const ids = LANE.map((e) => JSON.parse(readFileSync(`src/primitives/${e.name}/manifest.json`, 'utf8')).id);
  assert.equal(new Set(ids).size, ids.length);
});
