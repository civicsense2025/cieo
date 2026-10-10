// test/primitives-lane-table.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const COMPS = [
  { name: 'Table', id: 'core.table', dir: 'Table', css: 'table',
    tsx: ["'use client'", '<table', 'aria-label={label}', 'cieo-table'],
    cssMarkers: ['cieo-table', 'border-collapse', '--cieo-color-border'] },
  { name: 'TableHeader', id: 'core.table-header', dir: 'TableHeader', css: 'table-header',
    tsx: ["'use client'", '<thead', 'cieo-table-header'],
    cssMarkers: ['cieo-table-header', '--cieo-color-border-strong'] },
  { name: 'TableBody', id: 'core.table-body', dir: 'TableBody', css: 'table-body',
    tsx: ["'use client'", '<tbody', 'cieo-table-body'],
    cssMarkers: ['cieo-table-body', '--cieo-color-border'] },
  { name: 'TableRow', id: 'core.table-row', dir: 'TableRow', css: 'table-row',
    tsx: ["'use client'", '<tr', 'data-selected', 'cieo-table-row'],
    cssMarkers: ['cieo-table-row', '--cieo-color-selection'] },
  { name: 'TableCell', id: 'core.table-cell', dir: 'TableCell', css: 'table-cell',
    tsx: ["'use client'", '<td', 'cieo-table-cell'],
    cssMarkers: ['cieo-table-cell', '--cieo-space-'] },
  { name: 'TableHeaderCell', id: 'core.table-header-cell', dir: 'TableHeaderCell', css: 'table-header-cell',
    tsx: ["'use client'", '<th', 'scope', 'aria-sort', 'onSort', 'cieo-table-header-cell'],
    cssMarkers: ['cieo-table-header-cell', '--cieo-'] },
  { name: 'TableFooter', id: 'core.table-footer', dir: 'TableFooter', css: 'table-footer',
    tsx: ["'use client'", '<tfoot', 'cieo-table-footer'],
    cssMarkers: ['cieo-table-footer', '--cieo-color-border-strong'] },
  { name: 'TableSelectionToolbar', id: 'core.table-selection-toolbar', dir: 'TableSelectionToolbar', css: 'table-selection-toolbar',
    tsx: ["'use client'", 'selectedCount', 'selected', 'cieo-table-selection-toolbar'],
    cssMarkers: ['cieo-table-selection-toolbar', '--cieo-'] },
  { name: 'MetadataList', id: 'core.metadata-list', dir: 'MetadataList', css: 'metadata-list',
    tsx: ["'use client'", '<dl', 'cieo-metadata-list'],
    cssMarkers: ['cieo-metadata-list', 'grid'] },
  { name: 'MetadataListItem', id: 'core.metadata-list-item', dir: 'MetadataListItem', css: 'metadata-list-item',
    tsx: ["'use client'", '<dt', '<dd', 'term', 'cieo-metadata-list-item'],
    cssMarkers: ['cieo-metadata-list-item', '--cieo-color-muted'] },
  { name: 'TreeList', id: 'core.tree-list', dir: 'TreeList', css: 'tree-list',
    tsx: ["'use client'", '<ul', 'data-depth', 'cieo-tree-list'],
    cssMarkers: ['cieo-tree-list', "data-depth='6'"] },
  { name: 'ResizeHandle', id: 'core.resize-handle', dir: 'ResizeHandle', css: 'resize-handle', noSlot: true,
    tsx: ["'use client'", 'role="separator"', 'aria-orientation', 'cieo-p-resize', '...rest'],
    cssMarkers: ['cieo-p-resize', 'col-resize'] },
  { name: 'Collapsible', id: 'core.collapsible', dir: 'Collapsible', css: 'collapsible',
    tsx: ["'use client'", 'aria-expanded', 'useState', 'defaultOpen', 'onOpenChange', 'cieo-collapsible'],
    cssMarkers: ['cieo-collapsible', '--cieo-'] },
  { name: 'CollapsibleGroup', id: 'core.collapsible-group', dir: 'CollapsibleGroup', css: 'collapsible-group',
    tsx: ["'use client'", 'role="group"', 'aria-label={label}', 'cieo-collapsible-group'],
    cssMarkers: ['cieo-collapsible-group', '--cieo-'] },
];

for (const c of COMPS) {
  test(`${c.name} tsx uses native semantics and tokens class`, () => {
    const src = readFileSync(`src/primitives/${c.dir}/${c.name}.tsx`, 'utf8');
    for (const m of c.tsx) assert.ok(src.includes(m), `missing marker ${m}`);
  });

  test(`${c.name} manifest envelope and id`, () => {
    const m = JSON.parse(readFileSync(`src/primitives/${c.dir}/manifest.json`, 'utf8'));
    assert.equal(m.id, c.id);
    assert.equal(m.$schema, '../../../schemas/component.schema.json');
    assert.equal(m.schemaVersion, '1.0.0');
    assert.equal(m.packId, 'core');
    assert.equal(m.status, 'experimental');
    assert.equal(m.owner, 'library-maintainer');
    assert.ok((m.platforms ?? []).some((p) => p.id === 'web.react' && p.implementation === 'implemented'));
    assert.ok(c.noSlot || m.slots?.find((s) => s.id === 'default'), 'missing default slot');
  });

  test(`${c.name} css uses tokens only`, () => {
    const css = readFileSync(`design/styles/primitives/${c.css}.css`, 'utf8');
    for (const m of c.cssMarkers) assert.ok(css.includes(m), `missing css marker ${m}`);
    assert.ok(!css.includes('transition') && !css.includes('animation'), 'no motion allowed');
  });

  test(`${c.name} doc page exists with h1 and prop rows`, () => {
    const p = `site/components/${c.name}.html`;
    assert.ok(existsSync(p), `missing ${p}`);
    const html = readFileSync(p, 'utf8');
    assert.ok(html.includes(`<h1>${c.name}</h1>`), 'missing h1');
    assert.ok(html.includes('data-props'), 'missing props table');
    assert.ok(html.includes('<td>'), 'missing prop rows');
    assert.ok(html.includes('data-do') && html.includes('data-dont'), 'missing do/dont');
  });
}

test('lane-table manifest ids are unique', () => {
  const ids = COMPS.map((c) => JSON.parse(readFileSync(`src/primitives/${c.dir}/manifest.json`, 'utf8')).id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 14);
});
