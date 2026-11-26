// Rule editing for filter builders: new rules, property changes, the value input each rule takes, and where focus lands after a removal.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterRows, OPERATORS_BY_TYPE, newFilterRule, changeRuleProperty, takesValue, valueInputFor, focusIndexAfterRemove,
} from '../dist/data-grid/index.js';

const P = {
  n: { id: 'n', name: 'Pages', type: 'number' },
  t: { id: 't', name: 'Title', type: 'text' },
  note: { id: 'note', name: 'Notes', type: 'text' },
  s: { id: 's', name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
  st: { id: 'st', name: 'Stage', type: 'status', options: ['Idea', 'Doing', 'Done'] },
  d: { id: 'd', name: 'Due', type: 'date' },
  c: { id: 'c', name: 'Done', type: 'checkbox' },
  l: { id: 'l', name: 'Link', type: 'link' },
  r: { id: 'r', name: 'Related', type: 'relation' },
};
const props = Object.values(P);
const ids = (rows) => rows.map((r) => r.id);

test('a new rule starts on the first property with its first operator and no value', () => {
  assert.deepStrictEqual(newFilterRule(props), { property: 'n', operator: 'eq' });
  assert.deepStrictEqual(newFilterRule([P.t]), { property: 't', operator: 'contains' });
  assert.equal(newFilterRule([]), undefined);
});

test('only the operators that compare nothing take no typed value', () => {
  const offered = new Set(Object.values(OPERATORS_BY_TYPE).flat());
  const valueless = [...offered].filter((op) => !takesValue(op)).sort();
  assert.deepStrictEqual(valueless, ['checked', 'isEmpty', 'isNotEmpty', 'unchecked']);
});

test('a property change keeps the value only when the type stays the same', () => {
  const rule = { property: 't', operator: 'contains', value: 'pie' };
  assert.deepStrictEqual(changeRuleProperty(rule, props, 'note'), { property: 'note', operator: 'contains', value: 'pie' });
  // Link offers the same operator, so it is kept; the value was typed for the old type, so it goes.
  assert.deepStrictEqual(changeRuleProperty(rule, props, 'l'), { property: 'l', operator: 'contains' });
  // Number does not offer contains, so the rule takes the number type's first operator.
  assert.deepStrictEqual(changeRuleProperty(rule, props, 'n'), { property: 'n', operator: 'eq' });
});

test('the value input follows the property type, and operators that compare nothing take none', () => {
  const of = (type) => ({ id: 'x', name: 'X', type });
  assert.equal(valueInputFor(of('text'), 'contains'), 'text');
  assert.equal(valueInputFor(of('link'), 'is'), 'text');
  assert.equal(valueInputFor(of('relation'), 'isNot'), 'text');
  assert.equal(valueInputFor(of('number'), 'gte'), 'number');
  assert.equal(valueInputFor(of('date'), 'before'), 'date');
  assert.equal(valueInputFor(of('select'), 'is'), 'choice');
  assert.equal(valueInputFor(of('status'), 'isNot'), 'choice');
  assert.equal(valueInputFor(of('checkbox'), 'checked'), 'none');
  assert.equal(valueInputFor(of('text'), 'isEmpty'), 'none');
  assert.equal(valueInputFor(of('date'), 'isNotEmpty'), 'none');
  assert.equal(valueInputFor(undefined, 'is'), 'none');
});

test('removing a row moves focus to the row that takes its place, or to the add control', () => {
  assert.equal(focusIndexAfterRemove(0, 2), 0);
  assert.equal(focusIndexAfterRemove(1, 3), 1);
  assert.equal(focusIndexAfterRemove(2, 2), 1);
  assert.equal(focusIndexAfterRemove(0, 0), null);
});

test('a rule that was just added hides no rows, whatever its type', () => {
  const rows = [
    { id: 'a', values: { n: 1, t: 'Apple', s: 'Low', st: 'Idea', d: '2026-01-01', l: 'https://a.example', r: 'x' } },
    { id: 'b', values: { n: 2, t: 'Banana', s: 'High', st: 'Done', d: '2026-02-01' } },
    { id: 'c', values: {} },
  ];
  for (const def of props.filter((p) => p.type !== 'checkbox')) {
    assert.deepStrictEqual(ids(filterRows(rows, props, [newFilterRule([def])])), ['a', 'b', 'c'], def.type);
  }
});

test('a new checkbox rule needs no value, so it filters at once', () => {
  const rows = [{ id: 'a', values: { c: true } }, { id: 'b', values: { c: false } }];
  assert.deepStrictEqual(ids(filterRows(rows, props, [newFilterRule([P.c])])), ['a']);
});
