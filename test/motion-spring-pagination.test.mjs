import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('current page rolls on change', () => {
  const src = readFileSync('src/primitives/Pagination/Pagination.tsx', 'utf8');
  assert.match(src, /<Digits value=\{page\} kind="feedback" \/>/);
  assert.match(src, /key="current-page"/);
});

test('motion=false renders a plain numeral', () => {
  const src = readFileSync('src/primitives/Pagination/Pagination.tsx', 'utf8');
  assert.match(src, /motion === false \? p : <Digits/);
});
