import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const NEXT_CONFIGS = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
const VITE_CONFIGS = ['vite.config.js', 'vite.config.mjs', 'vite.config.ts'];
const REACT_BUCKETS = ['dependencies', 'devDependencies', 'peerDependencies'];
const LOCKFILES = [
  ['pnpm', ['pnpm-lock.yaml']],
  ['yarn', ['yarn.lock']],
  ['bun', ['bun.lockb', 'bun.lock']],
];

function hasFile(root, name) {
  return existsSync(join(root, name));
}

function hasDirectory(root, name) {
  const stats = statSync(join(root, name), { throwIfNoEntry: false });
  return stats !== undefined && stats.isDirectory();
}

export function readPackageJson(root) {
  let source;
  try {
    source = readFileSync(join(root, 'package.json'), 'utf8');
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(source);
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function hasReact(root) {
  const manifest = readPackageJson(root);
  if (manifest === null) return false;
  return REACT_BUCKETS.some((bucket) => {
    const dependencies = manifest[bucket];
    return dependencies !== null && typeof dependencies === 'object' && Object.hasOwn(dependencies, 'react');
  });
}

export function detectTarget(root) {
  if (NEXT_CONFIGS.some((name) => hasFile(root, name)) && hasDirectory(root, 'app')) return 'next';
  if (VITE_CONFIGS.some((name) => hasFile(root, name)) && hasReact(root)) return 'vite';
  return null;
}

export function detectPackageManager(root) {
  for (const [manager, lockfiles] of LOCKFILES) {
    if (lockfiles.some((lockfile) => hasFile(root, lockfile))) return manager;
  }
  return 'npm';
}
