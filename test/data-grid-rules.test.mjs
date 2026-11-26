// Rule editing for filter builders: new rules, property changes, the value input each rule takes, and where focus lands after a removal.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyView, filterRows, OPERATORS_BY_TYPE, PROPERTY_TYPES, newFilterRule, changeRuleProperty, takesValue, valueInputFor, focusIndexAfterRemove,
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
const row = (id, values) => ({ id, values });

// A value each property type can be filtered by. The filled row holds it, the empty row holds nothing.
const SAMPLE = { text: 'Apple', link: 'https://a.example', relation: 'r1', number: 1, select: 'Low', status: 'Idea', date: '2026-01-01', checkbox: true };

test('a new rule starts on the first property with its first operator and no value', () => {
  assert.deepStrictEqual(newFilterRule(props), { property: 'n', operator: 'eq' });
  assert.deepStrictEqual(newFilterRule([P.t]), { property: 't', operator: 'contains' });
  assert.equal(newFilterRule([]), undefined);
});

test('a new checkbox rule starts unset, so it hides no rows until Checked or Unchecked is picked', () => {
  const rows = [row('a', { c: true }), row('b', { c: false }), row('c', {})];
  const fresh = newFilterRule([P.c]);
  assert.deepStrictEqual(fresh, { property: 'c', operator: 'unset' });
  assert.deepStrictEqual(ids(filterRows(rows, props, [fresh])), ['a', 'b', 'c']);
  assert.deepStrictEqual(ids(filterRows(rows, props, [{ ...fresh, operator: 'checked' }])), ['a']);
  assert.deepStrictEqual(ids(filterRows(rows, props, [{ ...fresh, operator: 'unchecked' }])), ['b', 'c']);
});

test('only the operators that compare nothing take no typed value, and unset is one of them', () => {
  const offered = new Set(Object.values(OPERATORS_BY_TYPE).flat());
  const valueless = [...offered].filter((op) => !takesValue(op)).sort();
  assert.deepStrictEqual(valueless, ['checked', 'isEmpty', 'isNotEmpty', 'unchecked']);
  assert.equal(takesValue('unset'), false);
});

test('a property change keeps the value only when the type stays the same', () => {
  const rule = { property: 't', operator: 'contains', value: 'pie' };
  assert.deepStrictEqual(changeRuleProperty(rule, props, 'note'), { property: 'note', operator: 'contains', value: 'pie' });
  // Link offers the same operator, so it is kept; the value was typed for the old type, so it goes.
  assert.deepStrictEqual(changeRuleProperty(rule, props, 'l'), { property: 'l', operator: 'contains' });
  // Number does not offer contains, so the rule starts on the number type's first operator.
  assert.deepStrictEqual(changeRuleProperty(rule, props, 'n'), { property: 'n', operator: 'eq' });
  // A checkbox offers neither operator, so the rule starts unset.
  assert.deepStrictEqual(changeRuleProperty(rule, props, 'c'), { property: 'c', operator: 'unset' });
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
  assert.equal(valueInputFor(of('checkbox'), 'unset'), 'none');
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

test('for every property type, a new rule leaves the filtered and sorted rows unchanged until a value or an operator is picked', () => {
  for (const type of PROPERTY_TYPES) {
    const def = { id: 'x', name: 'X', type, options: ['Low', 'High'] };
    const rows = [row('filled', { x: SAMPLE[type] }), row('empty', {})];
    const sorts = [{ property: 'x', direction: 'asc' }];
    const shown = (rule) => ids(applyView(rows, [def], { filters: [rule], sorts }));
    const unfiltered = ids(applyView(rows, [def], { sorts }));
    const fresh = newFilterRule([def]);
    assert.deepStrictEqual(shown(fresh), unfiltered, `${type}: a new rule hides rows`);
    const valueless = OPERATORS_BY_TYPE[type].find((op) => !takesValue(op));
    if (valueless) assert.notDeepStrictEqual(shown({ ...fresh, operator: valueless }), unfiltered, `${type}: ${valueless} does not filter`);
    const valued = OPERATORS_BY_TYPE[type].find((op) => takesValue(op));
    if (valued) assert.notDeepStrictEqual(shown({ ...fresh, operator: valued, value: String(SAMPLE[type]) }), unfiltered, `${type}: a typed value does not filter`);
  }
});
