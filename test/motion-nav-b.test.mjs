import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const FAMILY = [
  'SideNav',
  'SideNavItem',
  'SideNavHeading',
  'SideNavSection',
  'SideNavCollapseButton',
  'MobileNav',
  'MobileNavToggle',
  'NavIcon',
  'NavHeadingMenu',
  'Outline',
  'Stepper',
  'Step',
  'Pagination',
];

test('nav-b family audit: all 13 dirs present, motion opt-out on exactly Pagination', () => {
  const withMotion = [];
  for (const name of FAMILY) {
    const tsx = `src/primitives/${name}/${name}.tsx`;
    assert.ok(existsSync(tsx), `missing source: ${tsx}`);
    assert.ok(existsSync(`src/primitives/${name}/manifest.json`), `missing manifest: ${name}`);
    assert.ok(existsSync(`src/primitives/${name}/README.md`), `missing README: ${name}`);
    const src = readFileSync(tsx, 'utf8');
    if (/motion\?: boolean/.test(src)) withMotion.push(name);
  }
  assert.deepEqual(withMotion, ['Pagination'], 'exactly Pagination declares a motion opt-out prop');
});

test('Pagination motion contract: Digits conditional + manifest motion id', () => {
  const src = readFileSync('src/primitives/Pagination/Pagination.tsx', 'utf8');
  assert.match(src, /from '\.\.\/\.\.\/react\/index\.js'/, 'imports Digits from react index');
  assert.match(src, /Digits/, 'renders Digits for the current numeral');
  assert.match(src, /motion === false \? p :/, 'motion={false} renders a plain numeral');
  assert.match(src, /kind="feedback"/, 'Digits roll uses feedback kind');

  const manifest = JSON.parse(readFileSync('src/primitives/Pagination/manifest.json', 'utf8'));
  const ids = manifest.properties.map((p) => p.id);
  assert.ok(ids.includes('motion'), 'manifest lists motion property');
  const motionProp = manifest.properties.find((p) => p.id === 'motion');
  assert.equal(motionProp.type.kind, 'boolean', 'manifest motion is boolean');
  assert.ok(
    manifest.platforms.some((pl) => (pl.properties || []).includes('motion')),
    'platforms properties include motion',
  );

  const readme = readFileSync('src/primitives/Pagination/README.md', 'utf8');
  assert.match(readme, /motion=\{false\} renders a plain numeral/, 'README documents the Motion opt-out');

  const page = readFileSync('site/components/Pagination.html', 'utf8');
  assert.match(page, /motion/, 'Pagination.html documents the motion prop');
});
