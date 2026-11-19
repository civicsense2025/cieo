// Every library part is shown as a real, styled thing in context, never as a lone word. A part whose preview is a single bare element fails here.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createPreviewRenderer } from '../scripts/lib/render-preview.mjs';
import { scanPrimitives } from '../scripts/lib/primitives.mjs';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const ready = existsSync(`${root}/dist/primitives`);
const elements = (html) => (html.match(/<[a-z][^>]*>/g) ?? []).length;

test('every component renders a preview with more than one element', { skip: !ready && 'dist is not built' }, async () => {
  const entries = scanPrimitives(root);
  const render = createPreviewRenderer(root, entries);
  const thin = [];
  const failed = [];
  for (const { dir } of entries) {
    const out = await render(dir);
    if (out.error) failed.push(`${dir}: ${out.error}`);
    else if (elements(out.html) < 2) thin.push(dir);
  }
  assert.deepEqual(failed, [], `previews that could not render:\n${failed.join('\n')}`);
  assert.deepEqual(thin, [], `previews that are a single bare element (show the part in context): ${thin.join(', ')}`);
});

test('a part shown inside its parent marks itself as the subject', { skip: !ready && 'dist is not built' }, async () => {
  const render = createPreviewRenderer(root, scanPrimitives(root));
  for (const dir of ['TableRow', 'SideNavItem', 'CommandPaletteItem', 'Badge', 'Kbd']) {
    const out = await render(dir);
    assert.match(out.html, /data-focus/, `${dir}: the documented part should carry data-focus so it reads as the subject`);
  }
});

test('contexts only reference components that exist', () => {
  const entries = scanPrimitives(root);
  const names = new Set(entries.flatMap((e) => e.values));
  const data = JSON.parse(readFileSync(`${root}/scripts/data/preview-props.json`));
  for (const [dir, spec] of Object.entries(data)) {
    if (spec.inContext) assert.ok(names.has(spec.inContext), `${dir}: unknown parent ${spec.inContext}`);
  }
});

