// test/primitives-lane-command.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const cases = [
  { name: 'CommandPalette', id: 'core.command-palette' },
  { name: 'CommandPaletteInput', id: 'core.command-palette-input' },
  { name: 'CommandPaletteList', id: 'core.command-palette-list' },
  { name: 'CommandPaletteItem', id: 'core.command-palette-item' },
  { name: 'CommandPaletteGroup', id: 'core.command-palette-group' },
  { name: 'CommandPaletteEmpty', id: 'core.command-palette-empty' },
  { name: 'CommandPaletteFooter', id: 'core.command-palette-footer' },
  { name: 'Popover', id: 'core.popover' },
  { name: 'HoverCard', id: 'core.hover-card' },
  { name: 'Selector', id: 'core.selector' },
  { name: 'SelectorOption', id: 'core.selector-option' },
  { name: 'MultiSelector', id: 'core.multi-selector' },
  { name: 'ComplexSelector', id: 'core.complex-selector' },
  { name: 'Typeahead', id: 'core.typeahead' },
  { name: 'TypeaheadItem', id: 'core.typeahead-item' },
  { name: 'Tokenizer', id: 'core.tokenizer' },
  { name: 'OverflowList', id: 'core.overflow-list' },
];

const tsxMarkers = {
  CommandPalette: [/role="dialog"/, /aria-label=\{label\}/],
  CommandPaletteInput: [/<input/, /cieo-vh/],
  CommandPaletteList: [/role="listbox"/],
  CommandPaletteItem: [/role="option"/, /aria-selected/],
  CommandPaletteGroup: [/role="group"/],
  CommandPaletteEmpty: [/No results/],
  CommandPaletteFooter: [/cieo-p-command-palette-footer/],
  Popover: [/defaultOpen/, /onOpenChange/],
  HoverCard: [/aria-describedby/, /content/],
  Selector: [/Select as Selector/, /SelectorProps/],
  SelectorOption: [/<option/, /value=\{value\}/],
  MultiSelector: [/<select/, /multiple/, /cieo-input/],
  ComplexSelector: [/<optgroup/, /sections/],
  Typeahead: [/role="combobox"/, /aria-expanded/],
  TypeaheadItem: [/role="option"/, /onSelect/],
  Tokenizer: [/Remove \$\{v\}/, /onAdd/],
  OverflowList: [/max\s*=\s*4/, /slice\(0, max\)/],
};

for (const { name, id } of cases) {
  test(`${name} tsx owns structure and semantics`, () => {
    const src = readFileSync(`src/primitives/${name}/${name}.tsx`, 'utf8');
    assert.match(src, /'use client'/);
    for (const re of tsxMarkers[name]) assert.match(src, re);
  });

  test(`${name} manifest envelope and id`, () => {
    const m = JSON.parse(readFileSync(`src/primitives/${name}/manifest.json`, 'utf8'));
    assert.equal(m.id, id);
    assert.equal(m.$schema, '../../../schemas/component.schema.json');
    assert.equal(m.schemaVersion, '1.0.0');
    assert.equal(m.packId, 'core');
    assert.equal(m.status, 'experimental');
    assert.equal(m.owner, 'library-maintainer');
    assert.ok(m.platforms.find((p) => p.id === 'web.react' && p.implementation === 'implemented'));
  });

  test(`${name} doc page exists with h1 and prop rows`, () => {
    const path = `site/components/${name}.html`;
    assert.ok(existsSync(path), `missing ${path}`);
    const html = readFileSync(path, 'utf8');
    assert.match(html, new RegExp(`<h1>${name}</h1>`));
    assert.match(html, /data-props/);
    assert.match(html, /<tr><td>/);
  });
}

test('CommandPalette shell is a controlled dialog host filters', () => {
  const src = readFileSync('src/primitives/CommandPalette/CommandPalette.tsx', 'utf8');
  assert.match(src, /onQueryChange/);
  assert.match(src, /query/);
});

test('Popover owns fixed viewport positioning and exposes surface tokens', () => {
  const source = readFileSync('src/primitives/Popover/Popover.tsx', 'utf8');
  assert.match(source, /usePopoverPosition/);
  assert.match(source, /createPortal/);
  const css = readFileSync('design/styles/primitives/popover.css', 'utf8');
  assert.match(css, /--cieo-popover-border/);
});

test('HoverCard CSS reveals on hover and focus with reduced-motion guard', () => {
  const css = readFileSync('design/styles/primitives/hover-card.css', 'utf8');
  assert.match(css, /:hover/);
  assert.match(css, /focus-within/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-inline-size:\s*20rem/);
});

test('Selector re-exports the Select control without new CSS', () => {
  const src = readFileSync('src/primitives/Selector/Selector.tsx', 'utf8');
  assert.match(src, /from '\.\.\/\.\.\/controls\/Select\.js'/);
  assert.ok(!existsSync('design/styles/primitives/selector.css'), 'Selector reuses select styling');
  const m = JSON.parse(readFileSync('src/primitives/Selector/manifest.json', 'utf8'));
  assert.equal(m.extensions.wraps, 'src/controls/Select.tsx');
  assert.ok(m.properties.find((p) => p.id === 'label' && p.required === true));
  assert.ok(m.properties.find((p) => p.id === 'options' && p.required === true));
});

test('Tokenizer chips carry labeled remove buttons and Enter adds', () => {
  const src = readFileSync('src/primitives/Tokenizer/Tokenizer.tsx', 'utf8');
  assert.match(src, /aria-label=\{`Remove \$\{v\}`\}/);
  assert.match(src, /onRemove\?: \(index: number\)/);
  assert.match(src, /Enter/);
});

test('lane command manifest ids are unique', () => {
  const ids = cases.map(({ name }) => JSON.parse(readFileSync(`src/primitives/${name}/manifest.json`, 'utf8')).id);
  assert.equal(new Set(ids).size, ids.length);
});
