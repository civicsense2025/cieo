import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'cieo catalogue '));
process.on('exit', () => fs.rmSync(temporary, { recursive: true, force: true }));
function build(script, target) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', script), target], { cwd: temporary, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return fs.readFileSync(target, 'utf8');
}
test('both established mosaic routes produce identical standalone pages', () => {
  const library = build('build-library.mjs', path.join(temporary, 'library.html'));
  const catalogue = build('build-catalogue.mjs', path.join(temporary, 'catalogue.html'));
  assert.equal(library, catalogue);
  assert.match(library, /^<!doctype html>/i);
  assert.ok(!library.includes('<!-- CATALOGUE_SCRIPTS -->'));
});
test('the standalone script remains syntactically valid and keeps the original $$ helper', () => {
  const html = build('build-library.mjs', path.join(temporary, 'script.html'));
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.doesNotThrow(() => new Function(script));
  assert.ok(script.includes('const $$') || script.includes('$$ ='));
  assert.ok(script.includes('class Track'));
  assert.ok(!html.includes('<script src='));
});
for (const script of ['build-library.mjs', 'build-catalogue.mjs', 'build-collection.mjs']) {
  test(`${script} includes every declared source block in order`, () => {
    const html = build(script, path.join(temporary, script + '.html'));
    const blocks = JSON.parse(fs.readFileSync(path.join(root, 'atoms/web/blocks.json'), 'utf8'));
    let end = 0;
    for (const block of blocks) {
      let source = fs.readFileSync(path.join(root, 'atoms/web', block), 'utf8');
      if (script === 'build-collection.mjs') source = source.replace(/<\/script/gi, '<\\/script');
      const current = html.indexOf(source, end);
      assert.ok(current >= end, block);
      if (script === 'build-collection.mjs') {
        assert.ok(html.slice(end, current).includes(`window.CIEO_SOURCE_HINT=${JSON.stringify(block)};`), block);
      }
      end = current + source.length;
    }
  });
}
