import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('storefront renders product with scripts disabled', () => {
  const html = readFileSync('site/composites/storefront.html', 'utf8');
  for (const s of ['Drift Wool Runner', '$148.00', '4.8 (312 reviews)', 'Specifications', 'Your bag is empty.']) {
    assert.ok(html.includes(s), `static markup missing: ${s}`);
  }
});

test('storefront uses shipped parts, linked built-from, documented pricing', () => {
  const html = readFileSync('site/composites/storefront.html', 'utf8');
  const names = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names;
  const parts = [...html.matchAll(/data-parts="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
  assert.ok(parts.length > 10, 'data-parts missing');
  for (const p of parts) assert.ok(names.includes(p), `unshipped part: ${p}`);
  assert.ok(html.includes('<section data-built-from>'));
  for (const p of parts) assert.ok(html.includes(`../components/${p}.html`), `built-from missing link: ${p}`);
  const js = readFileSync('site/composites/storefront.js', 'utf8');
  for (const s of ['data-qty', 'data-line-total', '148', 'data-delivery', 'data-order-total', 'DG-']) {
    assert.ok(js.includes(s), `JS missing pricing hook: ${s}`);
  }
  for (const bad of ['astryx', 'tailwind', 'bootstrap', 'stylex']) {
    assert.ok(!html.toLowerCase().includes(bad), `foreign marker: ${bad}`);
  }
});
