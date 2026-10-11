import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('dashboard renders content with scripts disabled', () => {
  const html = readFileSync('site/composites/dashboard.html', 'utf8');
  for (const s of ['$48,210', '#1041', 'Amara Okafor', 'Drift Goods', 'Settings saved.']) {
    assert.ok(html.includes(s), `static markup missing: ${s}`);
  }
});

test('dashboard uses only shipped parts with linked built-from', () => {
  const html = readFileSync('site/composites/dashboard.html', 'utf8');
  const names = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names;
  const parts = [...html.matchAll(/data-parts="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
  assert.ok(parts.length > 10, 'data-parts list missing');
  for (const p of parts) assert.ok(names.includes(p), `unshipped part: ${p}`);
  assert.strictEqual([...html.matchAll(/data-built-from[\s\S]*?<\/section>/g)].length, 1, 'built-from section missing');
  for (const p of parts) assert.ok(html.includes(`../components/${p}.html`), `built-from missing link: ${p}`);
  for (const bad of ['astryx', 'tailwind', 'bootstrap', 'stylex']) {
    assert.ok(!html.toLowerCase().includes(bad), `foreign marker: ${bad}`);
  }
});

test('dashboard JS wires panels plus settings without frameworks', () => {
  const js = readFileSync('site/composites/dashboard.js', 'utf8');
  for (const s of ['data-panel', 'data-nav', 'cieo-dashboard-settings', 'localStorage']) {
    assert.ok(js.includes(s), `JS missing hook: ${s}`);
  }
});
