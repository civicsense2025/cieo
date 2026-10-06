import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createTheme, toNative } from '../design/index.js';

const available = (command) => spawnSync(command, [command === 'kotlinc' ? '-version' : '--version'], { encoding: 'utf8' }).status === 0;
function fixture(target, extension, compile) {
  const folder = mkdtempSync(join(tmpdir(), 'cieo-native-'));
  try {
    const source = join(folder, `Tokens.${extension}`);
    writeFileSync(source, toNative(createTheme({ brand: 'iris', scheme: 'dark' }), target));
    compile(folder, source);
  } finally { rmSync(folder, { recursive: true, force: true }); }
}
const run = (command, args) => { const result = spawnSync(command, args, { encoding: 'utf8', timeout: 60000 }); assert.equal(result.status, 0, result.stderr); };
test('generated Swift constants type-check', { skip: !available('swiftc') }, () => fixture('swift', 'swift', (_, source) => run('swiftc', ['-typecheck', source])));
test('generated C header compiles when included twice', { skip: !available('cc') }, () => fixture('c', 'h', (folder) => {
  const source = join(folder, 'main.c');
  writeFileSync(source, '#include "Tokens.h"\n#include "Tokens.h"\nint main(void) { return CIEO_DESIGN_TOKENS_SPACE_2 != 8.0; }\n');
  const binary = join(folder, 'check'); run('cc', ['-std=c11', '-Wall', '-Wextra', '-Werror', source, '-o', binary]); run(binary, []);
}));
test('generated Python constants execute', { skip: !available('python3') }, () => fixture('python', 'py', (_, source) => run('python3', [source])));
test('generated Rust constants compile', { skip: !available('rustc') }, () => fixture('rust', 'rs', (folder, source) => run('rustc', ['--crate-type', 'lib', '--edition', '2021', source, '-o', join(folder, 'libtokens.rlib')])));
test('generated Kotlin constants compile', { skip: !available('kotlinc') }, () => fixture('kotlin', 'kt', (folder, source) => run('kotlinc', [source, '-d', join(folder, 'tokens.jar')])));
test('generated Dart constants analyze', { skip: !available('dart') }, () => fixture('dart', 'dart', (_, source) => run('dart', ['analyze', source])));
