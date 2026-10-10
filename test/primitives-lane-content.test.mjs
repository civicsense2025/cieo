// test/primitives-lane-content.test.mjs — Lane content: 19 atoms/molecules + doc pages.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const COMPS = [
  { name: 'Avatar', id: 'core.avatar', marker: /cieo-p-avatar-one/ },
  { name: 'AvatarGroupOverflow', id: 'core.avatar-group-overflow', marker: /cieo-p-avatar-group-overflow/ },
  { name: 'AvatarStatusDot', id: 'core.avatar-status-dot', marker: /data-status/ },
  { name: 'Icon', id: 'core.icon', marker: /cieo-p-icon/ },
  { name: 'Kbd', id: 'core.kbd', marker: /<kbd/ },
  { name: 'Code', id: 'core.code', marker: /<code/ },
  { name: 'CodeBlock', id: 'core.code-block', marker: /<pre/ },
  { name: 'Heading', id: 'core.heading', marker: /data-level/ },
  { name: 'Blockquote', id: 'core.blockquote', marker: /<blockquote/ },
  { name: 'Citation', id: 'core.citation', marker: /<cite/ },
  { name: 'Markdown', id: 'core.markdown', marker: /dangerouslySetInnerHTML/ },
  { name: 'Thumbnail', id: 'core.thumbnail', marker: /cieo-p-thumbnail/ },
  { name: 'Token', id: 'core.token', marker: /cieo-p-token/ },
  { name: 'StatusDot', id: 'core.status-dot', marker: /cieo-p-status-dot/ },
  { name: 'EmptyState', id: 'core.empty-state', marker: /cieo-p-empty-state/ },
  { name: 'Banner', id: 'core.banner', marker: /role="status"/ },
  { name: 'Timer', id: 'core.timer', marker: /padStart\(2,\s*'0'\)/ },
  { name: 'Timestamp', id: 'core.timestamp', marker: /dateTime=\{dateTime\}/ },
  { name: 'Skeleton', id: 'core.skeleton', marker: /Array\(lines\)/ },
];

for (const c of COMPS) {
  test(`${c.name} tsx renders marker, manifest id matches, page documents it`, () => {
    const src = readFileSync(`src/primitives/${c.name}/${c.name}.tsx`, 'utf8');
    assert.match(src, c.marker);
    assert.match(src, /'use client'/);
    const m = JSON.parse(readFileSync(`src/primitives/${c.name}/manifest.json`, 'utf8'));
    assert.equal(m.id, c.id);
    assert.equal(m.name, c.name);
    const page = `site/components/${c.name}.html`;
    assert.ok(existsSync(page), `missing ${page}`);
    const html = readFileSync(page, 'utf8');
    assert.match(html, new RegExp(`<h1>${c.name}<\\/h1>`));
    const tbody = html.slice(html.indexOf('<tbody>'), html.indexOf('</tbody>'));
    assert.ok((tbody.match(/<tr>/g) || []).length >= 1, `${c.name} page props table is empty`);
  });
}

test('all 19 lane-content manifests parse with unique ids', () => {
  const ids = new Set();
  for (const c of COMPS) {
    const m = JSON.parse(readFileSync(`src/primitives/${c.name}/manifest.json`, 'utf8'));
    assert.equal(m.$schema, '../../../schemas/component.schema.json');
    assert.equal(m.schemaVersion, '1.0.0');
    assert.equal(m.packId, 'core');
    assert.equal(m.status, 'experimental');
    assert.ok(!ids.has(m.id), `duplicate id ${m.id}`);
    ids.add(m.id);
  }
  assert.equal(ids.size, 19);
});

test('Markdown README warns the host sanitizes before passing html', () => {
  const md = readFileSync('src/primitives/Markdown/README.md', 'utf8');
  assert.match(md, /host sanitizes/i);
  assert.match(md, /never sanitizes/i);
});

test('Timer formats mm:ss with zero-padded PT duration', () => {
  const src = readFileSync('src/primitives/Timer/Timer.tsx', 'utf8');
  assert.match(src, /Math\.floor\(seconds\s*\/\s*60\)/);
  assert.match(src, /PT\$\{seconds\}S/);
  assert.match(src, /<time/);
});

test('Skeleton CSS pulses with a prefers-reduced-motion guard', () => {
  const css = readFileSync('design/styles/primitives/skeleton.css', 'utf8');
  assert.match(css, /@keyframes/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /animation:\s*none/);
});

test('Heading CSS scales per data-level with zero margin', () => {
  const css = readFileSync('design/styles/primitives/heading.css', 'utf8');
  assert.match(css, /margin:\s*0/);
  assert.match(css, /data-level/);
});

test('Banner manifest declares four tones defaulting to info', () => {
  const m = JSON.parse(readFileSync('src/primitives/Banner/manifest.json', 'utf8'));
  assert.deepEqual(m.properties.find((p) => p.id === 'tone').type.values, ['info', 'success', 'warning', 'danger']);
});
