// Every library part is shown as a real, styled thing in context, never as a lone word. A part whose preview is a single bare element fails here.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
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

// A copy-paste snippet that imports a symbol the subpath does not export is worse than no snippet.
// Validate every documented import against package.json exports and the built module's real exports.
test('every React snippet imports only real exports from real public subpaths', async () => {
  const pkg = JSON.parse(readFileSync(`${root}/package.json`, 'utf8'));
  const exports = pkg.exports ?? {};
  const componentDirs = readdirSync(`${root}/site/components`).filter((f) => f.endsWith('.html'));
  const broken = [];
  for (const file of componentDirs) {
    const html = readFileSync(`${root}/site/components/${file}`, 'utf8');
    const code = html.match(/<!--code-->([\s\S]*?)<!--\/code-->/)?.[1];
    if (!code) continue;
    const text = code.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    for (const m of text.matchAll(/import\s*\{([^}]+)\}\s*from\s*'cieo\/([^']+)'/g)) {
      const symbols = m[1].split(',').map((s) => s.trim()).filter(Boolean);
      const subpath = `./${m[2]}`;
      if (!exports[subpath]) { broken.push(`${file}: no export '${subpath}'`); continue; }
      const resolved = exports[subpath]?.import ?? exports[subpath]?.default ?? exports[subpath];
      const rel = String(Array.isArray(resolved) ? resolved[0] : resolved).replace(/^\.\//, '');
      if (!existsSync(`${root}/${rel}`)) { broken.push(`${file}: missing module ${rel}`); continue; }
      const mod = await import(pathToFileURL(`${root}/${rel}`).href);
      for (const s of symbols) if (!(s in mod)) broken.push(`${file}: '${s}' not exported by ${subpath}`);
    }
  }
  assert.deepEqual(broken, [], `broken snippet imports:\n${broken.join('\n')}`);
});

