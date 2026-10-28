// test/primitives-lane-form.test.mjs — Lane form (TDD: written before sources; RED then GREEN).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const COMPONENTS = [
  { name: 'CheckboxInput', id: 'core.checkbox-input', markers: ['Checkbox as CheckboxInput', 'controls/Toggles.js', 'CheckboxInputProps'] },
  { name: 'CheckboxList', id: 'core.checkbox-list', markers: ['role="group"', 'aria-label={label}', 'cieo-p-checkbox-list'] },
  { name: 'CheckboxListItem', id: 'core.checkbox-list-item', markers: ['Checkbox as CheckboxListItem', 'controls/Toggles.js'] },
  { name: 'RadioList', id: 'core.radio-list', markers: ['role="radiogroup"', 'aria-label={label}', 'cieo-p-radio-list'] },
  { name: 'RadioListItem', id: 'core.radio-list-item', markers: ['Radio as RadioListItem', 'controls/Toggles.js'] },
  { name: 'FileInput', id: 'core.file-input', markers: ['type="file"', 'cieo-input', 'accept', 'multiple'] },
  { name: 'NumberInput', id: 'core.number-input', markers: ['type="number"', 'cieo-input', 'defaultValue'] },
  { name: 'Calendar', id: 'core.calendar', markers: ['role="group"', 'aria-pressed', 'cieo-p-calendar', 'onSelect'] },
  { name: 'DateInput', id: 'core.date-input', markers: ['type="date"', 'cieo-input'] },
  { name: 'DateRangeInput', id: 'core.date-range-input', markers: ['type="date"', 'role="group"'] },
  { name: 'DateTimeInput', id: 'core.date-time-input', markers: ['type="datetime-local"', 'cieo-input'] },
  { name: 'TimeInput', id: 'core.time-input', markers: ['type="time"', 'cieo-input'] },
  { name: 'InputGroup', id: 'core.input-group', markers: ['cieo-p-input-group', '{children}'] },
  { name: 'InputGroupText', id: 'core.input-group-text', markers: ['cieo-p-input-group-text', '<span'] },
  { name: 'FieldStatus', id: 'core.field-status', markers: ['role="alert"', 'tone', 'cieo-p-field-status'] },
  { name: 'PowerSearch', id: 'core.power-search', markers: ['SearchField as PowerSearch', 'controls/SearchField.js'] },
];

for (const c of COMPONENTS) {
  test(`${c.name} tsx carries its contract markers`, () => {
    const src = readFileSync(`src/primitives/${c.name}/${c.name}.tsx`, 'utf8');
    assert.match(src, /'use client'/);
    for (const m of c.markers) assert.ok(src.includes(m), `missing marker: ${m}`);
  });

  test(`${c.name} manifest declares id ${c.id} with the lane envelope`, () => {
    const m = JSON.parse(readFileSync(`src/primitives/${c.name}/manifest.json`, 'utf8'));
    assert.equal(m.id, c.id);
    assert.equal(m.name, c.name);
    assert.equal(m.$schema, '../../../schemas/component.schema.json');
    assert.equal(m.schemaVersion, '1.0.0');
    assert.equal(m.packId, 'core');
    assert.equal(m.status, 'experimental');
    assert.equal(m.owner, 'library-maintainer');
    assert.ok(m.platforms.find((p) => p.id === 'web.react' && p.implementation === 'implemented'));
  });

  test(`${c.name} doc page exists with heading and property rows`, () => {
    const path = `site/components/${c.name}.html`;
    assert.ok(existsSync(path), `missing ${path}`);
    const html = readFileSync(path, 'utf8');
    assert.ok(html.includes(`<h1>${c.name}</h1>`), 'missing h1');
    assert.ok(html.includes('<table data-props>'), 'missing props table');
    const m = JSON.parse(readFileSync(`src/primitives/${c.name}/manifest.json`, 'utf8'));
    const tbody = html.split('<tbody>')[1]?.split('</tbody>')[0] ?? '';
    const rows = (tbody.match(/<tr(?:\s[^>]*)?>/g) ?? []).length;
    if (m.properties.length > 0) assert.ok(rows >= m.properties.length, `expected >=${m.properties.length} prop rows, got ${rows}`);
  });
}

test('lane form manifest ids are unique', () => {
  const ids = COMPONENTS.map((c) => JSON.parse(readFileSync(`src/primitives/${c.name}/manifest.json`, 'utf8')).id);
  assert.equal(new Set(ids).size, COMPONENTS.length);
});

test('lane form CSS files exist and use tokens only', () => {
  for (const f of ['checkbox-list', 'radio-list', 'calendar', 'input-group', 'field-status']) {
    const css = readFileSync(`design/styles/primitives/${f}.css`, 'utf8');
    assert.match(css, /var\(--cieo-/);
  }
});

test('lane form backfill pages exist with headings', () => {
  for (const n of ['Field', 'Slider', 'Stack', 'Divider', 'Breadcrumbs', 'BreadcrumbItem']) {
    const path = `site/components/${n}.html`;
    assert.ok(existsSync(path), `missing backfill ${path}`);
    assert.ok(readFileSync(path, 'utf8').includes(`<h1>${n}</h1>`));
  }
});
