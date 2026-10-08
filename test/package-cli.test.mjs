import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('packed offline installation exposes a working token CLI with no development dependencies', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const folder = mkdtempSync(join(tmpdir(), 'component-cli-'));
  const run = (args, cwd = root, input) => execFileSync('npm', args, {
    cwd, input, encoding: 'utf8', timeout: 60000,
    env: { ...process.env, npm_config_cache: join(folder, 'cache') },
  });
  try {
    run(['pack', '--ignore-scripts', '--pack-destination', folder]);
    const archives = readdirSync(folder).filter(file => file.endsWith('.tgz'));
    assert.equal(archives.length, 1);
    const consumer = join(folder, 'consumer'); mkdirSync(consumer);
    writeFileSync(join(consumer, 'package.json'), '{"private":true}');
    run(['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--omit=dev', '--legacy-peer-deps', join(folder, archives[0])], consumer);
    const binary = join(consumer, 'node_modules', '.bin', 'cieo-theme');
    const config = execFileSync(binary, ['config'], { encoding: 'utf8' });
    const json = execFileSync(binary, ['json', '-'], { encoding: 'utf8', input: config });
    assert.equal(JSON.parse(json).version, 1);
    const swift = execFileSync(binary, ['swift', '-'], { encoding: 'utf8', input: config });
    execFileSync('swiftc', ['-typecheck', '-'], { encoding: 'utf8', input: swift, timeout: 30000 });
    assert.throws(() => execFileSync(binary, ['unknown'], { encoding: 'utf8', stdio: 'pipe' }));
    const dependencies = JSON.parse(readFileSync(join(consumer, 'node_modules/cieo/package.json'), 'utf8'));
    assert.equal(dependencies.bin['cieo-theme'], 'scripts/export-theme.mjs');
  } finally { rmSync(folder, { recursive: true, force: true }); }
});
