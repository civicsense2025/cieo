import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function scan(content) {
  const root = mkdtempSync(join(tmpdir(), 'component-brand-'));
  try {
    for (const folder of ['atoms', 'docs', 'scripts']) mkdirSync(join(root, folder));
    for (const file of ['check-brand.sh', 'check-brand.py']) {
      try { copyFileSync(new URL(`../scripts/${file}`, import.meta.url), join(root, 'scripts', file)); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    writeFileSync(join(root, 'README.md'), content);
    return spawnSync('bash', [join(root, 'scripts/check-brand.sh')], { encoding: 'utf8' });
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test('brand gate allows exact infrastructure references and native motion syntax', () => {
  const result = scan('.github/workflows/design-system.yml\nhttps://github.com/civicsense2025/cieo\nnpm install github:civicsense2025/cieo#v0.1.0\n.linear(duration: 1) linear-gradient(red, blue)\n');
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('allowed references cannot conceal branding or personal paths on the same line', () => {
  for (const content of ['.github/workflows/design-system.yml meridian', 'https://github.com/civicsense2025/cieo claude', '.linear(duration: 1) velo', '/Users/tanho/private', '/private/tmp/private', 'github.com/principle']) {
    const result = scan(content);
    assert.equal(result.status, 1, content);
    assert.match(result.stdout, /found brand words/);
  }
});
