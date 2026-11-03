import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readmeHtml } from '../scripts/lib/readme-html.mjs';

test('README guide keeps fenced code, escaped, and gives ### its own heading', () => {
  const html = readmeHtml('## Use\n### Setup\nIntro text.\n```html\n<b class="x">hi</b>\n```\n- one\n- two');
  assert.match(html, /<h4>Setup<\/h4>/);
  assert.match(html, /<pre><code>&lt;b class=&quot;x&quot;&gt;hi&lt;\/b&gt;<\/code><\/pre>/);
  assert.match(html, /<ul><li>one<\/li><li>two<\/li><\/ul>/);
  assert.doesNotMatch(html, /<b class/, 'README markup must never be injected');
});

test('an unterminated fence still renders as code, not prose', () => {
  assert.match(readmeHtml('## Use\n```\nlet a = 1'), /<pre><code>let a = 1<\/code><\/pre>/);
});

test('importing the layer classifier does not rewrite the catalogue index', async () => {
  const path = new URL('../atoms/web/index.json', import.meta.url);
  const before = readFileSync(path, 'utf8');
  const { layerOf } = await import('../scripts/catalogue/classify-layers.mjs');
  assert.equal(readFileSync(path, 'utf8'), before);
  assert.equal(layerOf({ category: 'Foundations' }, undefined), 'foundation');
  assert.equal(layerOf({ category: 'Forms' }, { html: '<button>a</button>' }), 'molecule');
});
