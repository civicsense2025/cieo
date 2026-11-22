// Static contract checks for the recipe preview module. Runtime behavior is
// proven in a real browser (see scratch Playwright harness); these guards keep
// the public shape and the single-loop / reduced-motion / cleanup guarantees.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const url = new URL('../site/recipe-preview.js', import.meta.url);
const source = readFileSync(url, 'utf8');

test('exports the named async mount function', async () => {
  const mod = await import(url.href);
  assert.equal(typeof mod.mountFeaturedRecipes, 'function');
  assert.equal(mod.mountFeaturedRecipes.constructor.name, 'AsyncFunction');
});

test('self-boots from the homepage data attribute', () => {
  assert.match(source, /querySelector\('\[data-recipe-preview\]'\)/);
  assert.match(source, /JSON\.parse\(host\.dataset\.recipePreview/);
  assert.match(source, /mountFeaturedRecipes\(host, specs\)/);
});

test('keeps one driven loop with viewport, visibility and reduced-motion guards', () => {
  assert.match(source, /clock\.t \+= dt \* clock\.scale/);
  assert.match(source, /Math\.min\(0\.05/);
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /visibilitychange/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /tile\.render\(0\)/);
  assert.match(source, /destroy\(\)/);
});

test('never writes untrusted strings through innerHTML', () => {
  assert.match(source, /title\.textContent =/);
  assert.match(source, /cat\.textContent =/);
  assert.match(source, /stage\.innerHTML = typeof atom\.html/);
});
