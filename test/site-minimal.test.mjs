// The site stays quiet: little text, real parts shown working, and every part page's own controls are live.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const words = (html) => html.replace(/<(script|style|svg)[\s\S]*?<\/\1>|<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

test('the home page shows live parts instead of explaining them', () => {
  const home = read('site/index.html');
  assert.ok((home.match(/class="tile"/g) ?? []).length >= 8, 'a strip of live parts');
  assert.doesNotMatch(home, /Three ideas|Foundations first|index-list/);
  assert.ok(words(home) < 260, `home has ${words(home)} words`);
});

test('Foundations and Recipes open with a line, not a paragraph', () => {
  assert.doesNotMatch(read('site/foundations/index.html'), /five promises|Pick a chapter|Prefer to poke/);
  assert.doesNotMatch(read('site/recipes/index.html'), /lazy chunks|closed form|specimens/);
});

test('part pages fill their prop controls and show other states live', () => {
  const page = read('site/components/Button.html');
  assert.match(page, /data-knobs="\[\{/, 'knobs are populated from the manifest');
  assert.match(page, /class="doc-state"/, 'other states are drawn under the preview');
  const withKnobs = ['Badge', 'Button', 'Switch', 'Avatar'].filter((n) => /data-knobs="\[\{/.test(read(`site/components/${n}.html`)));
  assert.ok(withKnobs.length >= 3, `knobs on ${withKnobs}`);
});
