import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Motion wave-1 table family audit: these 16 dirs are static and must not
// take motion props or own animated behavior (contract: src/primitives/motion.ts).
const DIRS = [
  'Table',
  'TableHeader',
  'TableBody',
  'TableRow',
  'TableCell',
  'TableHeaderCell',
  'TableFooter',
  'TableSelectionToolbar',
  'MetadataList',
  'MetadataListItem',
  'TreeList',
  'ResizeHandle',
  'Collapsible',
  'CollapsibleGroup',
  'List',
  'ListItem',
];

// Dir -> owned stylesheet. ListItem shares list.css.
const CSS = {
  Table: 'table.css',
  TableHeader: 'table-header.css',
  TableBody: 'table-body.css',
  TableRow: 'table-row.css',
  TableCell: 'table-cell.css',
  TableHeaderCell: 'table-header-cell.css',
  TableFooter: 'table-footer.css',
  TableSelectionToolbar: 'table-selection-toolbar.css',
  MetadataList: 'metadata-list.css',
  MetadataListItem: 'metadata-list-item.css',
  TreeList: 'tree-list.css',
  ResizeHandle: 'resize-handle.css',
  Collapsible: 'collapsible.css',
  CollapsibleGroup: 'collapsible-group.css',
  List: 'list.css',
  ListItem: 'list.css',
};

test('table family tsx takes no motion props or data-motion guards', () => {
  for (const dir of DIRS) {
    const src = readFileSync(`src/primitives/${dir}/${dir}.tsx`, 'utf8');
    assert.doesNotMatch(src, /MotionProps/, `${dir}.tsx must not reference MotionProps`);
    assert.doesNotMatch(src, /motionAttrs/, `${dir}.tsx must not call motionAttrs`);
    assert.doesNotMatch(src, /data-motion/, `${dir}.tsx must not set data-motion`);
    assert.doesNotMatch(src, /data-entering/, `${dir}.tsx must not set data-entering`);
    assert.doesNotMatch(src, /data-exiting/, `${dir}.tsx must not set data-exiting`);
  }
});

test('table family css owns no animated behavior', () => {
  for (const dir of DIRS) {
    const css = readFileSync(`design/styles/primitives/${CSS[dir]}`, 'utf8');
    assert.doesNotMatch(css, /data-motion/, `${CSS[dir]} must not carry data-motion guards`);
    assert.doesNotMatch(css, /data-entering/, `${CSS[dir]} must not carry data-entering rules`);
    assert.doesNotMatch(css, /@keyframes/, `${CSS[dir]} must not define keyframes`);
    assert.doesNotMatch(css, /animation/, `${CSS[dir]} must not animate`);
    assert.doesNotMatch(css, /transition/, `${CSS[dir]} must not transition`);
  }
});

test('Table, Collapsible, List tsx contain no MotionProps', () => {
  for (const name of ['Table', 'Collapsible', 'List']) {
    const src = readFileSync(`src/primitives/${name}/${name}.tsx`, 'utf8');
    assert.doesNotMatch(src, /MotionProps/, `${name}.tsx must not take MotionProps`);
    assert.doesNotMatch(src, /\bmotion\b/, `${name}.tsx must not take a motion prop`);
  }
});
