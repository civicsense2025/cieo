// test/motion-stage-b.test.mjs — Motion Wave-1 Stage-B family audit + Carousel/Spinner contract.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const DIRS = [
  'ChatMessage', 'ChatMessageBubble', 'ChatMessageList', 'ChatMessageMetadata',
  'ChatSystemMessage', 'ChatComposer', 'ChatComposerInput', 'ChatLayout',
  'Card', 'ClickableCard', 'SelectableCard', 'Carousel', 'Spinner', 'ProgressBar',
];
// ProgressBar ships no own CSS: paint comes from shared .cieo-progress (see manifest extensions.sharedStyle).
const NO_OWN_CSS = new Set(['ProgressBar']);
const MOTION_PAIR = ['Carousel', 'Spinner'];
const STATIC_ONLY = DIRS.filter((d) => !MOTION_PAIR.includes(d));

const kebab = (name) => name.replace(/[A-Z]/g, (ch, i) => (i === 0 ? '' : '-') + ch.toLowerCase());
const tsx = (name) => readFileSync(`src/primitives/${name}/${name}.tsx`, 'utf8');
const manifest = (name) => JSON.parse(readFileSync(`src/primitives/${name}/manifest.json`, 'utf8'));

for (const name of DIRS) {
  test(`${name} family files exist (tsx + manifest + README + page)`, () => {
    tsx(name);
    manifest(name);
    readFileSync(`src/primitives/${name}/README.md`, 'utf8');
    readFileSync(`site/components/${name}.html`, 'utf8');
    if (!NO_OWN_CSS.has(name)) {
      const css = readFileSync(`design/styles/primitives/${kebab(name)}.css`, 'utf8');
      assert.match(css, /@layer cieo.components/);
    }
  });
}

for (const name of STATIC_ONLY) {
  test(`${name} audit-only: no motion API`, () => {
    const src = tsx(name);
    assert.ok(!src.includes('data-motion'), `${name} tsx must not set data-motion`);
    assert.ok(!src.includes('motion?:'), `${name} tsx must not declare a motion prop`);
    const m = manifest(name);
    assert.ok(!m.properties.some((p) => p.id === 'motion'), `${name} manifest must not declare motion`);
  });
}

for (const name of MOTION_PAIR) {
  test(`${name} tsx exposes motion opt-out`, () => {
    const src = tsx(name);
    assert.match(src, /motion\?: boolean/);
    assert.ok(
      src.includes(`data-motion={motion === false ? 'off' : undefined}`),
      `${name} root must set data-motion off only when motion === false`,
    );
  });

  test(`${name} manifest declares motion id`, () => {
    const m = manifest(name);
    const p = m.properties.find((p) => p.id === 'motion');
    assert.ok(p, `${name} manifest needs a motion property`);
    assert.equal(p.type.kind, 'boolean');
    assert.equal(p.required, false);
    assert.ok(m.platforms[0].properties.includes('motion'), `${name} platform must mirror motion`);
  });

  test(`${name} README documents motion`, () => {
    const md = readFileSync(`src/primitives/${name}/README.md`, 'utf8');
    assert.match(md, /[Mm]otion/);
    assert.ok(md.includes('data-motion'), `${name} README must name the data-motion contract`);
  });

  test(`${name} page has a motion row`, () => {
    const html = readFileSync(`site/components/${name}.html`, 'utf8');
    assert.ok(html.includes('<td>motion</td>'), `${name} page props table needs a motion row`);
  });
}

test('Spinner css is token-driven (no hardcoded 0.8s)', () => {
  const css = readFileSync('design/styles/primitives/spinner.css', 'utf8');
  assert.ok(!css.includes('0.8s'), 'spinner.css must not hardcode 0.8s');
  assert.ok(css.includes('var(--motion-duration-lazy'), 'spinner.css must use --motion-duration-lazy');
});
