import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('chat renders transcript with scripts disabled', () => {
  const html = readFileSync('site/composites/chat.html', 'utf8');
  for (const s of ['How do I theme the buttons?', "cieo/Button", 'Demo replies locally', 'Run details', 'Ask something']) {
    assert.ok(html.includes(s), `static markup missing: ${s}`);
  }
  assert.ok(html.includes('cieo-chat-message'), 'message class missing');
});

test('chat uses shipped parts, linked built-from, guarded sends', () => {
  const html = readFileSync('site/composites/chat.html', 'utf8');
  const names = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names;
  const parts = [...html.matchAll(/data-parts="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
  assert.ok(parts.length > 8, 'data-parts missing');
  for (const p of parts) assert.ok(names.includes(p), `unshipped part: ${p}`);
  assert.ok(html.includes('<section data-built-from>'));
  for (const p of parts) assert.ok(html.includes(`../components/${p}.html`), `built-from missing link: ${p}`);
  const js = readFileSync('site/composites/chat.js', 'utf8');
  for (const s of ['data-input', 'data-send', 'aria-disabled', 'scrollHeight', '400']) {
    assert.ok(js.includes(s), `JS missing send hook: ${s}`);
  }
  for (const bad of ['astryx', 'tailwind', 'bootstrap', 'stylex', 'fetch(', 'XMLHttpRequest']) {
    assert.ok(!html.toLowerCase().includes(bad) && !js.includes(bad), `foreign/network marker: ${bad}`);
  }
});
