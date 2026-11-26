import test from 'node:test';
import assert from 'node:assert/strict';
import { startsAsFormula, neutralizeFormula, restoreFormula } from '../dist/data-grid/index.js';

test('text a spreadsheet could read as a formula or a DDE command is flagged', () => {
  for (const text of ['=1+1', '+1', '@SUM(A1)', '\tx', '\rx', '-x', '-', "-2+3+cmd|' /C calc'!A0", ' =x', '  +1', '\n=x']) {
    assert.equal(startsAsFormula(text), true, JSON.stringify(text));
  }
});

test('plain words, numbers and symbols inside text are not flagged', () => {
  for (const text of ['Apple', ' Apple', '5', '-5', '-.5', '-5 ', 'a=b', 'x+1', '007', '', "'hello", "'-5"]) {
    assert.equal(startsAsFormula(text), false, JSON.stringify(text));
  }
});

test('neutralizing adds one apostrophe to flagged text and leaves every other text alone', () => {
  assert.equal(neutralizeFormula('=1+1'), "'=1+1");
  assert.equal(neutralizeFormula('-abc'), "'-abc");
  assert.equal(neutralizeFormula("-2+3+cmd|' /C calc'!A0"), "'-2+3+cmd|' /C calc'!A0");
  assert.equal(neutralizeFormula('-5'), '-5');
  assert.equal(neutralizeFormula('Apple'), 'Apple');
  assert.equal(neutralizeFormula("'hello"), "'hello");
  assert.equal(neutralizeFormula("'=x"), "''=x", 'an apostrophe in front of a formula never hides it');
});

test('restoring removes exactly the apostrophe that neutralizing added', () => {
  assert.equal(restoreFormula("'=1+1"), '=1+1');
  assert.equal(restoreFormula("''=x"), "'=x");
  assert.equal(restoreFormula("'hello"), "'hello");
  assert.equal(restoreFormula("'-5"), "'-5");
  assert.equal(restoreFormula('=1'), '=1');
});

test('restoring inverts neutralizing for every text, including apostrophes in front of formulas', () => {
  const prefixes = ['', "'", "''", " '"];
  const heads = ['', "'", "''", ' ', "' ", '=', '+', '-', '@', '\t', '\r', '5', 'a', '-5', '.5', '-.5', '-x', ' =x', "'=x"];
  const tails = ['', 'x', "'", '"', ','];
  for (const prefix of prefixes) {
    for (const head of heads) {
      for (const tail of tails) {
        const text = prefix + head + tail;
        assert.equal(restoreFormula(neutralizeFormula(text)), text, JSON.stringify(text));
      }
    }
  }
});
