// The component taxonomy: every component has one layer (primitive, atom, molecule, organism) and one pack
// (core, or a use-case pack). Primitives are the foundation; packs hold use cases. Dependencies only point down.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const LAYERS = ['primitive', 'atom', 'molecule', 'organism'];
const PACKS = ['core', 'auth', 'messaging', 'audio', 'agent', 'social', 'editorial', 'tools'];
const dirs = readdirSync('src/primitives', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
const manifest = Object.fromEntries(dirs.map((d) => [d, JSON.parse(readFileSync(`src/primitives/${d}/manifest.json`, 'utf8'))]));
const imports = (d) => {
  const found = new Set();
  for (const f of readdirSync(`src/primitives/${d}`).filter((n) => n.endsWith('.tsx'))) {
    for (const m of readFileSync(`src/primitives/${d}/${f}`, 'utf8').matchAll(/from '\.\.\/([A-Za-z]+)\/[A-Za-z]+\.js'/g)) if (m[1] !== d && manifest[m[1]]) found.add(m[1]);
  }
  return [...found];
};

test('every component declares a known layer and a known pack', () => {
  for (const d of dirs) {
    assert.ok(LAYERS.includes(manifest[d].layer), `${d}: layer ${manifest[d].layer}`);
    assert.ok(PACKS.includes(manifest[d].packId), `${d}: pack ${manifest[d].packId}`);
  }
});

test('layout, text and icon building blocks are primitives, and only generic ones are', () => {
  for (const d of ['Stack', 'HStack', 'VStack', 'Grid', 'Center', 'Divider', 'Overlay', 'Text', 'Heading', 'Icon', 'AspectRatio']) assert.equal(manifest[d].layer, 'primitive', d);
  for (const d of dirs.filter((n) => manifest[n].layer === 'primitive')) assert.equal(manifest[d].packId, 'core', `${d}: a primitive belongs to no use case`);
});

test('use cases live in their pack, not in core', () => {
  for (const d of dirs.filter((n) => n.startsWith('Auth'))) assert.equal(manifest[d].packId, 'auth', d);
  for (const d of dirs.filter((n) => n.startsWith('Chat'))) assert.equal(manifest[d].packId, 'messaging', d);
  for (const d of dirs.filter((n) => n.startsWith('Agent'))) assert.equal(manifest[d].packId, 'agent', d);
  for (const d of ['AudioPlayer', 'AudioWaveform', 'VoiceRecorder']) assert.equal(manifest[d].packId, 'audio', d);
  for (const d of ['ClipRange', 'CompareCurtain', 'DropZone', 'PaletteSwatches', 'PreviewStage', 'Toast']) assert.equal(manifest[d].packId, 'tools', d);
});

test('a component only builds on the same layer or lower, except a part of its own group', () => {
  const rank = Object.fromEntries(LAYERS.map((l, i) => [l, i]));
  const upward = [];
  for (const d of dirs) for (const i of imports(d)) {
    const part = i.startsWith(d) || d.startsWith(i); // Tab and TabList, Dropdown menu and its items
    if (rank[manifest[i].layer] > rank[manifest[d].layer] && !part) upward.push(`${d} (${manifest[d].layer}) imports ${i} (${manifest[i].layer})`);
  }
  assert.deepEqual(upward, []);
});

test('core never depends on a use-case pack, and a pack only on core or itself', () => {
  const crossing = [];
  for (const d of dirs) for (const i of imports(d)) {
    const to = manifest[i].packId, from = manifest[d].packId;
    if (to !== 'core' && to !== from) crossing.push(`${d} (${from}) imports ${i} (${to})`);
  }
  assert.deepEqual(crossing, []);
});

test('the catalog index lists every layer and every pack that has components', () => {
  const html = readFileSync('site/components/index.html', 'utf8');
  for (const id of ['primitives', 'atoms', 'molecules', 'organisms']) assert.ok(html.includes(`id="${id}"`), id);
  for (const p of new Set(dirs.map((d) => manifest[d].packId).filter((p) => p !== 'core'))) assert.ok(html.includes(`id="pack-${p}"`), p);
  for (const d of dirs) assert.ok(html.includes(`href="./${d}.html"`), `${d} is listed`);
});

test('each component page names the layer and pack its manifest declares', () => {
  for (const d of dirs) {
    const m = manifest[d];
    const label = m.layer[0].toUpperCase() + m.layer.slice(1) + (m.packId === 'core' ? '' : ` · ${m.packId[0].toUpperCase()}${m.packId.slice(1)} pack`);
    assert.ok(readFileSync(`site/components/${d}.html`, 'utf8').includes(`<span data-level>${label}</span>`), d);
  }
});
