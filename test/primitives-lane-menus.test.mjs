// test/primitives-lane-menus.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const COMPONENTS = [
  { name: 'ToggleButton', id: 'core.toggle-button', level: 'atom', css: 'toggle-button.css', props: ['label', 'pressed', 'value', 'onPressedChange'], markers: ['aria-pressed={isPressed}', 'ToggleButtonGroupContext', 'cieo-toggle-button'] },
  { name: 'ToggleButtonGroup', id: 'core.toggle-button-group', level: 'molecule', css: 'toggle-button-group.css', props: ['label', 'value', 'defaultValue', 'onValueChange'], markers: ['role="group"', 'ToggleButtonGroupContext.Provider', 'cieo-toggle-button-group'] },
  { name: 'DropdownMenu', id: 'core.dropdown-menu', level: 'molecule', css: 'dropdown-menu.css', props: ['label', 'open', 'defaultOpen', 'onOpenChange'], markers: ['role="menu"', 'onOpenChange?.(true)', 'defaultOpen = false'] },
  { name: 'DropdownMenuItem', id: 'core.dropdown-menu-item', level: 'atom', css: 'dropdown-menu-item.css', props: ['label', 'disabled', 'onSelect'], markers: ['role="menuitem"', 'onSelect?.()', 'disabled = false'] },
  { name: 'DropdownMenuGroup', id: 'core.dropdown-menu-group', level: 'atom', css: 'dropdown-menu-group.css', props: ['label'], markers: ['role="group"', 'cieo-dropdown-menu-group'] },
  { name: 'DropdownMenuCheckboxItem', id: 'core.dropdown-menu-checkbox-item', level: 'atom', css: 'dropdown-menu-checkbox-item.css', props: ['label', 'checked', 'onCheckedChange'], markers: ['role="menuitemcheckbox"', 'aria-checked={checked}', 'onCheckedChange'] },
  { name: 'DropdownMenuRadioGroup', id: 'core.dropdown-menu-radio-group', level: 'atom', css: null, props: ['label', 'value', 'defaultValue', 'onValueChange'], markers: ['role="group"', 'DropdownMenuRadioGroupContext.Provider'] },
  { name: 'DropdownMenuRadioItem', id: 'core.dropdown-menu-radio-item', level: 'atom', css: 'dropdown-menu-radio-item.css', props: ['label', 'value'], markers: ['role="menuitemradio"', 'DropdownMenuRadioGroupContext', 'group?.value === value'] },
  { name: 'DropdownMenuDivider', id: 'core.dropdown-menu-divider', level: 'atom', css: 'dropdown-menu-divider.css', props: [], markers: ['role="separator"', 'cieo-dropdown-menu-divider'] },
  { name: 'DropdownMenuSubMenu', id: 'core.dropdown-menu-submenu', level: 'molecule', css: 'dropdown-menu-submenu.css', props: ['label', 'motion', 'entering', 'exiting'], markers: ['role="menu"', 'focus-within', 'cieo-dropdown-menu-submenu-panel'] },
  { name: 'MoreMenu', id: 'core.more-menu', level: 'molecule', css: null, props: ['label'], markers: ['IconButton', 'DropdownMenu', "label = 'More actions'"] },
  { name: 'SegmentedControl', id: 'core.segmented-control', level: 'molecule', css: 'segmented-control.css', props: ['label', 'value', 'defaultValue', 'onValueChange'], markers: ['role="group"', 'SegmentedControlContext.Provider', 'cieo-segmented-control'] },
  { name: 'SegmentedControlItem', id: 'core.segmented-control-item', level: 'atom', css: 'segmented-control-item.css', props: ['value'], markers: ['aria-pressed={picked}', 'SegmentedControlContext'] },
  { name: 'Tab', id: 'core.tab', level: 'atom', css: 'tab.css', props: ['value'], markers: ['role="tab"', 'TabContext', 'tabs === null'] },
  { name: 'TabList', id: 'core.tab-list', level: 'molecule', css: 'tab-list.css', props: ['label', 'value', 'defaultValue', 'onValueChange', 'motion'], markers: ['role="tablist"', 'export const TabContext', 'cieo-tab-list'] },
  { name: 'TabMenu', id: 'core.tab-menu', level: 'molecule', css: 'tab-menu.css', props: ['label', 'value', 'defaultValue', 'onValueChange'], markers: ['role="tablist"', 'data-variant="menu"', 'TabContext.Provider'] },
];

for (const c of COMPONENTS) {
  test(`${c.name} tsx carries client marker, semantics, and class`, () => {
    const src = readFileSync(`src/primitives/${c.name}/${c.name}.tsx`, 'utf8');
    assert.match(src, /'use client';/);
    for (const m of c.markers) assert.ok(src.includes(m), `missing marker: ${m}`);
  });

  test(`${c.name} manifest id, envelope, and mirrored properties`, () => {
    const m = JSON.parse(readFileSync(`src/primitives/${c.name}/manifest.json`, 'utf8'));
    assert.equal(m.id, c.id);
    assert.equal(m.$schema, '../../../schemas/component.schema.json');
    assert.equal(m.packId, 'core');
    assert.equal(m.status, 'experimental');
    assert.equal(m.owner, 'library-maintainer');
    assert.deepEqual(m.properties.map((p) => p.id), c.props);
  });

  test(`${c.name} CSS uses tokens or is honestly style-free`, () => {
    const m = JSON.parse(readFileSync(`src/primitives/${c.name}/manifest.json`, 'utf8'));
    if (c.css === null) {
      assert.deepEqual(m.styleParts, []);
      assert.ok(!existsSync(`design/styles/primitives/${c.name.toLowerCase()}.css`));
    } else {
      const css = readFileSync(`design/styles/primitives/${c.css}`, 'utf8');
      assert.match(css, /var\(--cieo/);
    }
  });

  test(`${c.name} doc page has h1, level, and one prop row per manifest property`, () => {
    const html = readFileSync(`site/components/${c.name}.html`, 'utf8');
    assert.ok(html.includes(`<h1>${c.name}</h1>`), 'missing h1');
    assert.ok(html.includes(`<span data-level>${c.level}</span>`), 'missing level');
    assert.ok(html.includes('data-do') && html.includes('data-dont'), 'missing do/dont');
    const tbody = html.match(/<tbody>([\s\S]*)<\/tbody>/);
    assert.ok(tbody, 'missing tbody');
    const rows = (tbody[1].match(/<tr>/g) || []).length;
    assert.equal(rows, c.props.length, `expected ${c.props.length} prop rows, found ${rows}`);
  });
}

test('lane-menus manifest ids are unique across the lane', () => {
  const ids = COMPONENTS.map((c) => JSON.parse(readFileSync(`src/primitives/${c.name}/manifest.json`, 'utf8')).id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 16);
});
