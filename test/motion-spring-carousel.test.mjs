import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('paging rides the scroll spring', () => {
  const src = readFileSync('src/primitives/Carousel/Carousel.tsx', 'utf8');
  assert.match(src, /scrollTo\(track, track\.scrollLeft \+ direction \* track\.clientWidth\)/);
});

test('motion=false falls back to native paging', () => {
  const src = readFileSync('src/primitives/Carousel/Carousel.tsx', 'utf8');
  assert.match(src, /motion === false \? track\.scrollBy/);
});
