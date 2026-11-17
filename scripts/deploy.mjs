#!/usr/bin/env node
// Publishes the static site: refuses unless this is a clean checkout at exactly origin/main, then builds and deploys.
// A stale or feature-branch deploy would roll live work back, so the guard runs before anything is built.
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

/** Why a deploy must not proceed, or null. Pure so a test can pin every refusal. */
export function deployBlocker({ branch, dirty, head, originMain }) {
  if (dirty) return 'The working tree has uncommitted changes. Deploy from a clean checkout.';
  if (branch !== 'main') return `On '${branch}', not main. Merge the pull request, then deploy from main.`;
  if (!originMain) return 'origin/main is unknown. Run git fetch first.';
  if (head !== originMain) return 'main is not at origin/main. Pull, or push your work through a pull request first.';
  return null;
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  git('fetch', '--quiet', 'origin', 'main');
  const blocker = deployBlocker({ branch: git('rev-parse', '--abbrev-ref', 'HEAD'), dirty: git('status', '--porcelain', '--untracked-files=no') !== '', head: git('rev-parse', 'HEAD'), originMain: git('rev-parse', 'origin/main') });
  if (blocker) { console.error(blocker); process.exit(1); }
  for (const [cmd, args] of [['node', ['scripts/build-deploy.mjs']], ['npx', ['--yes', 'wrangler@4.160.0', 'deploy']]]) {
    const r = spawnSync(cmd, args, { stdio: 'inherit' });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }
}
