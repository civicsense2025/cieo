import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('settings renders flow with scripts disabled', () => {
  const html = readFileSync('site/composites/settings.html', 'utf8');
  for (const s of [
    'Account settings',
    'Profile',
    'Preferences',
    'Display name',
    'Email address',
    'Theme',
    'Notifications',
    'Motion',
    'Density',
    'Search settings',
    'Save settings',
    'Discard changes',
    'Settings saved.',
    'No matching settings'
  ]) {
    assert.ok(html.includes(s), `static markup missing: ${s}`);
  }
});

test('settings uses only shipped parts with linked built-from targets on disk', () => {
  const html = readFileSync('site/composites/settings.html', 'utf8');
  const names = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names;
  const parts = [...html.matchAll(/data-parts="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
  assert.ok(parts.length > 8, 'data-parts list missing');
  for (const p of parts) assert.ok(names.includes(p), `unshipped part: ${p}`);
  assert.ok(!parts.includes('Button'), 'Button is not a shipped primitive');
  assert.strictEqual([...html.matchAll(/data-built-from[\s\S]*?<\/section>/g)].length, 1, 'built-from section missing');
  for (const p of parts) {
    assert.ok(html.includes(`../components/${p}.html`), `built-from missing link: ${p}`);
    assert.ok(existsSync(`site/components/${p}.html`), `built-from target missing on disk: ${p}`);
  }
  for (const bad of ['astryx', 'tailwind', 'bootstrap', 'stylex']) {
    assert.ok(!html.toLowerCase().includes(bad), `foreign marker: ${bad}`);
  }
});

test('settings JS persists under cieo-settings without network calls', () => {
  const js = readFileSync('site/composites/settings.js', 'utf8');
  for (const s of [
    'cieo-settings',
    'localStorage',
    'data-settings-form',
    'data-setting',
    'data-settings-search',
    'data-discard',
    'data-save'
  ]) {
    assert.ok(js.includes(s), `JS missing hook: ${s}`);
  }
  assert.ok(!js.includes('fetch('), 'JS must not use fetch');
  assert.ok(!js.includes('XMLHttpRequest'), 'JS must not use XMLHttpRequest');
  for (const bad of ['astryx', 'tailwind', 'bootstrap', 'stylex']) {
    assert.ok(!js.toLowerCase().includes(bad), `foreign marker in JS: ${bad}`);
  }
});
