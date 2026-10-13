import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs, UsageError } from '../lib/args.mjs';
import { readConfig } from '../lib/config.mjs';
import { packageRoot, projectRoot } from '../lib/paths.mjs';
import { loadRegistry, plan, resolveId } from '../lib/registry.mjs';
import { rewriteImports } from '../lib/rewrite.mjs';

export const USAGE = `Usage: cieo diff <id>

Compare a copied component and its dependencies against the registry.

Options:
  --help       Show this help.
`;

const FLAGS = { help: 'boolean' };

function readIfExists(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function expectedContent(rel) {
  const path = join(packageRoot(), 'registry', rel);
  let source;
  try {
    source = readFileSync(path, 'utf8');
  } catch (error) {
    throw new Error(`Cannot read registry file ${rel}: ${error.message} — the cieo package looks incomplete; reinstall it.`);
  }
  return rewriteImports(source, rel);
}

function splitLines(text) {
  const lines = text.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

export function alignedDiff(expected, actual) {
  const wanted = splitLines(expected);
  const found = splitLines(actual);
  const lines = [];
  const count = Math.max(wanted.length, found.length);
  for (let index = 0; index < count; index += 1) {
    if (wanted[index] === found[index]) continue;
    if (index < wanted.length) lines.push(`- ${wanted[index]}`);
    if (index < found.length) lines.push(`+ ${found[index]}`);
  }
  return lines;
}

export default async function run(rest) {
  const { flags, positionals } = parseArgs(rest, FLAGS);
  if (flags.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (positionals.length === 0) {
    throw new UsageError('Missing component id — usage: cieo diff <id>');
  }
  if (positionals.length > 1) {
    throw new UsageError(`Unexpected argument '${positionals[1]}' — usage: cieo diff <id>`);
  }

  const root = projectRoot();
  const read = readConfig(root);
  if (read === null) {
    process.stderr.write(`No cieo.json found in ${root} — run 'npx cieo init' first.\n`);
    return 1;
  }
  const { config } = read;
  if (config.target === 'html') {
    process.stderr.write(
      'Cannot compare components in an html project — components need a React project (target next/vite).\n',
    );
    return 1;
  }

  const registry = loadRegistry();
  const resolved = resolveId(registry, positionals[0]);
  if (resolved.id === undefined) {
    process.stderr.write(`Unknown component '${positionals[0]}'.\n`);
    if (resolved.suggestions.length > 0) {
      process.stderr.write(`Did you mean: ${resolved.suggestions.join(', ')}?\n`);
    }
    process.stderr.write("Run 'npx cieo list' to see every component in this version.\n");
    return 1;
  }

  const chosen = plan(registry, resolved.id);
  const output = [];
  let differs = false;
  for (const rel of [...chosen.files, ...chosen.sharedFiles]) {
    const expected = expectedContent(rel);
    const actual = readIfExists(join(root, config.componentsDir, rel));
    if (actual === null) {
      output.push(`${rel}: missing`);
      differs = true;
      continue;
    }
    if (actual === expected) continue;
    differs = true;
    output.push(`${rel}:`);
    output.push(...alignedDiff(expected, actual));
  }
  if (output.length > 0) process.stdout.write(`${output.join('\n')}\n`);
  return differs ? 1 : 0;
}
