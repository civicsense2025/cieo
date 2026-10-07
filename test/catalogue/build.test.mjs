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
test('build-workbench.mjs inlines every recipe in order, each tagged with its source file', () => {
  const html = build('build-workbench.mjs', path.join(temporary, 'workbench.html'));
  const blocks = JSON.parse(fs.readFileSync(path.join(root, 'atoms/web/blocks.json'), 'utf8'));
  assert.ok(blocks.length > 0);
  let end = 0;
  for (const block of blocks) {
    const source = fs.readFileSync(path.join(root, 'atoms/web', block), 'utf8').replace(/<\/script/gi, '<\\/script');
    const marker = `globalThis.__cieoRecipeFile=${JSON.stringify(block)};\n`;
    const at = html.indexOf(marker, end);
    assert.ok(at >= end, `missing recipe marker ${block}`);
    assert.equal(html.slice(at + marker.length, at + marker.length + source.length), source, block);
    end = at + marker.length + source.length;
  }
});
test('build-workbench.mjs escapes a closing script tag inside inlined recipe code', () => {
  const sandbox = fs.mkdtempSync(path.join(temporary, 'sandbox '));
  fs.mkdirSync(path.join(sandbox, 'scripts'));
  fs.copyFileSync(path.join(root, 'scripts/build-workbench.mjs'), path.join(sandbox, 'scripts/build-workbench.mjs'));
  fs.cpSync(path.join(root, 'atoms/web'), path.join(sandbox, 'atoms/web'), { recursive: true });
  const first = JSON.parse(fs.readFileSync(path.join(sandbox, 'atoms/web/blocks.json'), 'utf8'))[0];
  fs.appendFileSync(path.join(sandbox, 'atoms/web', first), '\nconst __probe = "</script><b>x</b>";\n');
  const target = path.join(sandbox, 'out.html');
  const result = spawnSync(process.execPath, [path.join(sandbox, 'scripts/build-workbench.mjs'), target], { cwd: sandbox, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const html = fs.readFileSync(target, 'utf8');
  assert.ok(html.includes('const __probe = "<\\/script><b>x</b>";'));
  assert.ok(!html.includes('"</script><b>x</b>"'));
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.ok(script.includes('__probe'));
});
