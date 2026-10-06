#!/usr/bin/env node
// Resolve paths through fileURLToPath so spaces and Windows drive letters work correctly.
import { rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
rmSync(resolve(root, 'dist'), { recursive: true, force: true });
execFileSync(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '-p', resolve(root, 'tsconfig.json')], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, [resolve(root, 'scripts/build-design.mjs')], { cwd: root, stdio: 'inherit' });
