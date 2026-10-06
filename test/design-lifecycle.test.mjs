import test from 'node:test';
import assert from 'node:assert/strict';
import { createTheme, applyTheme, watchSystemPreferences } from '../design/index.js';

function element() {
  const values = new Map(), attributes = new Map();
  return {
    style: { getPropertyValue: (key) => values.get(key)?.[0] ?? '', getPropertyPriority: (key) => values.get(key)?.[1] ?? '', setProperty: (key, value, priority = '') => values.set(key, [value, priority]), removeProperty: (key) => values.delete(key) },
    getAttribute: (key) => attributes.get(key) ?? null,
    setAttribute: (key, value) => attributes.set(key, value), removeAttribute: (key) => attributes.delete(key),
  };
}
test('scoped controllers update independently without global theme state', () => {
  const a = element(), b = element();
  const first = applyTheme(a, createTheme()), second = applyTheme(b, createTheme({ brand: 'iris' }));
  const saved = b.style.getPropertyValue('--cieo-color-accent');
  first.update(createTheme({ brand: 'rose' }));
  assert.equal(b.style.getPropertyValue('--cieo-color-accent'), saved);
  assert.equal(first.theme.options.brand, 'rose');
  assert.throws(() => applyTheme(a, createTheme()), /already/);
  first.destroy(); second.destroy();
  assert.equal(a.style.getPropertyValue('--cieo-color-accent'), '');
});
test('destroy restores prior inline values, priorities and attributes exactly', () => {
  const target = element();
  target.style.setProperty('--cieo-color-accent', '#595d17', 'important'); target.setAttribute('data-cieo-theme', 'before');
  const controller = applyTheme(target, createTheme());
  assert.equal(target.style.getPropertyPriority('--cieo-color-accent'), '');
  controller.destroy(); controller.destroy();
  assert.equal(target.style.getPropertyValue('--cieo-color-accent'), '#595d17');
  assert.equal(target.style.getPropertyPriority('--cieo-color-accent'), 'important');
  assert.equal(target.getAttribute('data-cieo-theme'), 'before');
  assert.throws(() => controller.update(createTheme()), /disposed/);
});
test('destroy preserves subsequent application edits and failed updates leave the old theme intact', () => {
  const target = element(), controller = applyTheme(target, createTheme());
  assert.throws(() => controller.update({}), TypeError);
  assert.equal(controller.theme.options.brand, 'studio');
  target.style.setProperty('--cieo-color-accent', '#123456'); target.setAttribute('data-cieo-theme', 'app-edited');
  controller.destroy();
  assert.equal(target.style.getPropertyValue('--cieo-color-accent'), '#123456');
  assert.equal(target.getAttribute('data-cieo-theme'), 'app-edited');
});
test('server imports and preference fallback need no browser globals', () => {
  assert.equal(typeof document, 'undefined');
  let seen;
  const stop = watchSystemPreferences((value) => { seen = value; }, {});
  assert.deepEqual(seen, { scheme: 'light', reduced: false, contrast: 'standard' }); stop(); stop();
});
test('preference observers respond to changes and detach every listener', () => {
  const queries = new Map(); let calls = 0, latest;
  const host = { matchMedia(query) {
    const listeners = new Set();
    const item = { matches: false, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn), fire: () => [...listeners].forEach((fn) => fn()), listeners };
    queries.set(query, item); return item;
  } };
  const stop = watchSystemPreferences((value) => { latest = value; calls += 1; }, host);
  const dark = queries.get('(prefers-color-scheme: dark)'); dark.matches = true; dark.fire();
  assert.equal(latest.scheme, 'dark'); assert.equal(calls, 2);
  stop(); stop();
  assert.ok([...queries.values()].every((query) => query.listeners.size === 0)); dark.fire(); assert.equal(calls, 2);
});
