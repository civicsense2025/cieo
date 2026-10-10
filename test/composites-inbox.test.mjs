import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('inbox renders thread flow with scripts disabled', () => {
  const html = readFileSync('site/composites/inbox.html', 'utf8');
  for (const s of [
    'Kiln schedule for October',
    'Invoice 1042 is ready',
    'Garden rota swap',
    'Book club: next pick',
    'Lease renewal paperwork',
    'Courtyard potluck list',
    'Unread',
    'Oct 10',
    'Search mail',
    'Reply to',
    'Write a reply',
    'Archive',
    'Delete',
    'Undo',
    'No matching threads',
    'No threads left',
    'Keyboard shortcuts',
    'Enter',
  ]) {
    assert.ok(html.includes(s), `static markup missing: ${s}`);
  }
  assert.ok(html.includes('<time'), 'timestamp element missing');
  assert.ok(html.includes('data-thread-panel="kiln-schedule"'), 'reading pane panel missing');
  assert.ok(html.includes('./chat.html'), 'sibling flow link missing');
});

test('inbox uses shipped parts with linked built-from', () => {
  const html = readFileSync('site/composites/inbox.html', 'utf8');
  const names = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names;
  const parts = [...html.matchAll(/data-parts="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
  assert.ok(parts.length > 8, 'data-parts missing');
  for (const p of parts) assert.ok(names.includes(p), `unshipped part: ${p}`);
  assert.ok(!parts.includes('Button'), 'native buttons only: Button primitive must not ship');
  assert.ok(html.includes('<section data-built-from>'), 'built-from section missing');
  for (const p of new Set(parts)) assert.ok(html.includes(`../components/${p}.html`), `built-from missing link: ${p}`);
});

test('inbox JS hooks flow locally with keyboard paths', () => {
  const html = readFileSync('site/composites/inbox.html', 'utf8');
  const js = readFileSync('site/composites/inbox.js', 'utf8');
  assert.ok(html.includes('<script src="./inbox.js"'), 'script reference missing');
  for (const s of ['data-search', 'data-thread', 'data-reply', 'data-send', 'data-archive', 'data-delete', 'data-undo', 'data-status']) {
    assert.ok(js.includes(s), `JS missing flow hook: ${s}`);
    assert.ok(html.includes(s.replace('data-', 'data-').split('=')[0]), `HTML missing hook: ${s}`);
  }
  for (const s of ['ArrowDown', 'ArrowUp', 'Enter', 'hidden', 'textContent']) {
    assert.ok(js.includes(s), `JS missing interaction hook: ${s}`);
  }
  for (const bad of ['fetch(', 'XMLHttpRequest']) {
    assert.ok(!js.includes(bad) && !html.includes(bad), `network marker: ${bad}`);
  }
  for (const bad of ['astryx', 'tailwind', 'bootstrap', 'stylex']) {
    assert.ok(!html.toLowerCase().includes(bad) && !js.toLowerCase().includes(bad), `foreign marker: ${bad}`);
  }
});
