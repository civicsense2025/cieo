import test from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../docs/studio/state.js';
import { createTheme, serializeTheme } from '../design/index.js';

function fixture() {
  const data = new Map(), messages = [];
  globalThis.localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
  globalThis.location = { href: 'https://example.test/studio/', hash: '' };
  const system = { scheme: 'light', reduced: false, contrast: 'standard' };
  const state = createState(() => system, (message) => messages.push(message));
  return { data, state, system, messages };
}
test('studio persistence is opt-in and removal leaves unrelated keys intact', () => {
  const { data, state } = fixture();
  data.set('unrelated', 'keep');
  state.update({ brand: 'iris' }); assert.equal(data.size, 1);
  state.setRemember(true); assert.ok(data.has('cieo-studio-v1'));
  state.setRemember(false); assert.equal(data.size, 1); assert.equal(data.get('unrelated'), 'keep');
});
test('a failed update or import keeps the previous valid configuration', () => {
  const { state } = fixture();
  state.update({ brand: 'iris' });
  assert.throws(() => state.update({ accent: 'url(evil)' }));
  assert.equal(state.theme().options.brand, 'iris');
  assert.throws(() => state.import('{"version":999}'));
  assert.equal(state.theme().options.brand, 'iris');
});
test('shared links carry versioned configuration in a fragment', () => {
  const { state } = fixture();
  state.update({ brand: 'rose', radius: 'round', rtl: true });
  const url = new URL(state.link());
  assert.equal(url.search, '');
  const content = JSON.parse(decodeURIComponent(url.hash.slice(7)));
  assert.equal(content.theme.version, 1); assert.equal(content.view.rtl, true);
  assert.equal(content.theme.options.brand, 'rose');
});
test('unsafe saved presentation settings are rejected without corrupting the default theme', () => {
  fixture();
  globalThis.location.hash = '#theme=' + encodeURIComponent(JSON.stringify({ theme: { version: 1, options: { brand: 'iris' } }, view: { motion: 'full' } }));
  const state = createState(() => ({ scheme: 'light', contrast: 'standard' }), () => {});
  assert.equal(state.theme().options.brand, 'studio');
});
test('system preference changes keep an incompatible custom override at its last valid appearance', () => {
  const { state, system, messages } = fixture();
  const custom = createTheme({ overrides: { 'color-text': '#10141a' } });
  state.import(serializeTheme(custom));
  state.update({ scheme: 'system' }); state.theme();
  system.scheme = 'dark';
  assert.equal(state.theme().options.scheme, 'light');
  assert.equal(state.value.scheme, 'light');
  assert.ok(messages.at(-1).includes('last valid appearance'));
});
