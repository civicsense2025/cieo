import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('Breadcrumbs renders labelled nav with list', () => {
  const src = readFileSync('src/primitives/Breadcrumbs/Breadcrumbs.tsx', 'utf8');
  assert.match(src, /<nav/); assert.match(src, /aria-label=\{label\}/); assert.match(src, /<ol>/);
});
test('Breadcrumbs manifest has label default', () => {
  const m = JSON.parse(readFileSync('src/primitives/Breadcrumbs/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.breadcrumbs');
  assert.equal(m.properties.find((p) => p.id === 'label').default, 'Breadcrumb');
});
test('BreadcrumbItem marks current page', () => {
  const src = readFileSync('src/primitives/BreadcrumbItem/BreadcrumbItem.tsx', 'utf8');
  assert.match(src, /aria-current/); assert.match(src, /cieo-p-crumb/);
});
test('BreadcrumbItem manifest declares current', () => {
  const m = JSON.parse(readFileSync('src/primitives/BreadcrumbItem/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.breadcrumb-item');
  assert.ok(m.properties.find((p) => p.id === 'current'));
});
test('Breadcrumbs CSS separates crumbs with tokens', () => {
  const css = readFileSync('design/styles/primitives/breadcrumbs.css', 'utf8');
  assert.match(css, /content:\s*'\/'/); assert.match(css, /--cieo-color-muted/);
});
