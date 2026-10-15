import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs, UsageError } from '../lib/args.mjs';
import { readConfig } from '../lib/config.mjs';
import { projectRoot } from '../lib/paths.mjs';
import { loadRegistry } from '../lib/registry.mjs';

export const USAGE = `Usage: cieo list

List every component and whether it is copied into your project.

Options:
  --help       Show this help.
`;

const FLAGS = { help: 'boolean' };

function byCodeUnit(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function marker(existing, total) {
  if (existing > 0 && existing === total) return '✓';
  if (existing > 0) return '~';
  return ' ';
}

export default async function run(rest) {
  const { flags, positionals } = parseArgs(rest, FLAGS);
  if (flags.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (positionals.length > 0) {
    throw new UsageError(`Unexpected argument '${positionals[0]}' — usage: cieo list`);
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
      'Cannot list components in an html project — components need a React project (target next/vite).\n',
    );
    return 1;
  }

  const registry = loadRegistry();
  const names = Object.keys(registry.components).sort(byCodeUnit);
  const lines = [];
  let copied = 0;
  for (const name of names) {
    const files = registry.components[name].files;
    let existing = 0;
    for (const rel of files) {
      if (existsSync(join(root, config.componentsDir, rel))) existing += 1;
    }
    const status = marker(existing, files.length);
    if (status === '✓') copied += 1;
    lines.push(`${status} ${name}`);
  }
  process.stdout.write(`Components in ${config.componentsDir} (${copied} of ${names.length} copied)\n`);
  process.stdout.write(`${lines.join('\n')}\n`);
  return 0;
}
