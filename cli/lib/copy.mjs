import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { packageRoot } from './paths.mjs';
import { loadRegistry, plan, resolveId } from './registry.mjs';
import { assertNoPackageTerritoryImports, rewriteImports } from './rewrite.mjs';

function readIfExists(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function registryContent(rel) {
  const path = join(packageRoot(), 'registry', rel);
  let source;
  try {
    source = readFileSync(path, 'utf8');
  } catch (error) {
    throw new Error(`Cannot read registry file ${rel}: ${error.message} — the cieo package looks incomplete; reinstall it.`);
  }
  const content = rewriteImports(source, rel);
  assertNoPackageTerritoryImports(content, rel);
  return content;
}

/* Temp file + rename: a failed copy must never leave a half-written component
   where the original on disk was. */
function writeFileAtomic(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.cieo-tmp`;
  writeFileSync(temporary, content);
  try {
    renameSync(temporary, path);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
}

function formatDiff(rel, current, next) {
  const before = current.split('\n');
  const after = next.split('\n');
  const lcs = Array.from({ length: before.length + 1 }, () => new Uint32Array(after.length + 1));
  for (let i = before.length - 1; i >= 0; i -= 1) {
    for (let j = after.length - 1; j >= 0; j -= 1) {
      lcs[i][j] = before[i] === after[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const lines = [`--- ${rel} (yours)`, `+++ ${rel} (registry)`];
  let i = 0;
  let j = 0;
  while (i < before.length && j < after.length) {
    if (before[i] === after[j]) {
      lines.push(`  ${before[i]}`);
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      lines.push(`- ${before[i]}`);
      i += 1;
    } else {
      lines.push(`+ ${after[j]}`);
      j += 1;
    }
  }
  while (i < before.length) {
    lines.push(`- ${before[i]}`);
    i += 1;
  }
  while (j < after.length) {
    lines.push(`+ ${after[j]}`);
    j += 1;
  }
  return `${lines.join('\n')}\n`;
}

async function chooseAction(prompt, rel, current, next) {
  let options = ['overwrite', 'skip', 'diff'];
  for (;;) {
    const answer = await prompt.choose(`Overwrite ${rel}?`, [...options], { default: options.indexOf('skip') });
    const choice = typeof answer === 'number' ? options[answer] : answer;
    if (choice === 'overwrite' || choice === 'skip') return choice;
    if (choice === 'diff') {
      process.stdout.write(formatDiff(rel, current, next));
      options = ['overwrite', 'skip'];
      continue;
    }
    return 'skip';
  }
}

export async function copyPlan({ root, config, id, overwrite = false, dryRun = false, prompt }) {
  const registry = loadRegistry();
  const resolved = resolveId(registry, id);
  if (resolved.id === undefined) {
    const suggestions = resolved.suggestions.length > 0 ? ` Did you mean: ${resolved.suggestions.join(', ')}?` : '';
    throw new Error(`Unknown component '${id}'.${suggestions} Run 'npx cieo list' to see the components this version ships.`);
  }
  const { files, sharedFiles } = plan(registry, resolved.id);
  const copied = [];
  const skipped = [];
  const unchanged = [];
  const conflicts = [];
  for (const rel of [...files, ...sharedFiles]) {
    const content = registryContent(rel);
    const destination = join(root, config.componentsDir, rel);
    const existing = readIfExists(destination);
    if (existing === null) {
      if (!dryRun) writeFileAtomic(destination, content);
      copied.push(rel);
      continue;
    }
    if (existing === content) {
      unchanged.push(rel);
      continue;
    }
    conflicts.push(rel);
    let action = overwrite ? 'overwrite' : 'skip';
    if (!overwrite && prompt !== undefined && prompt.tty === true) {
      action = await chooseAction(prompt, rel, existing, content);
    }
    if (action === 'overwrite') {
      if (!dryRun) writeFileAtomic(destination, content);
      copied.push(rel);
      continue;
    }
    skipped.push(rel);
    process.stderr.write(`skipped ${rel} (differs — re-run with --overwrite)\n`);
  }
  return { copied, skipped, unchanged, conflicts };
}
