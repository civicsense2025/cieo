import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs, UsageError } from '../lib/args.mjs';
import { readConfig } from '../lib/config.mjs';
import { copyPlan } from '../lib/copy.mjs';
import { packageRoot, projectRoot } from '../lib/paths.mjs';
import { loadRegistry, plan, resolveId } from '../lib/registry.mjs';

export const USAGE = `Usage: cieo add <id> [options]

Copy a component and its dependencies into your project.

Options:
  --dry-run    Report what would copy without writing files.
  --overwrite  Replace files you edited locally.
  --yes        Answer yes to prompts (for scripts and CI).
  --help       Show this help.
`;

const FLAGS = { 'dry-run': 'boolean', overwrite: 'boolean', yes: 'boolean', help: 'boolean' };

const LOCKFILE_COMMANDS = [
  ['bun.lockb', 'bun add cieo'],
  ['bun.lock', 'bun add cieo'],
  ['pnpm-lock.yaml', 'pnpm add cieo'],
  ['yarn.lock', 'yarn add cieo'],
  ['package-lock.json', 'npm install cieo'],
];

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function installCommand(root) {
  for (const [lockfile, command] of LOCKFILE_COMMANDS) {
    if (existsSync(join(root, lockfile))) return command;
  }
  return 'npm install cieo';
}

function warnAboutInstall(root) {
  const cli = readJson(join(packageRoot(), 'package.json'));
  const installed = readJson(join(root, 'node_modules', 'cieo', 'package.json'));
  if (cli && installed && installed.version !== cli.version) {
    process.stderr.write(
      `cieo: warning: the CLI is cieo ${cli.version} but this project has cieo ${installed.version} installed — run '${installCommand(root)}' to align them.\n`,
    );
  }
  const project = readJson(join(root, 'package.json'));
  const dependencies = project
    ? { ...project.dependencies, ...project.devDependencies, ...project.peerDependencies }
    : null;
  if (dependencies === null || !Object.hasOwn(dependencies, 'cieo')) {
    process.stderr.write(
      `cieo: warning: this project does not depend on cieo yet — run '${installCommand(root)}' so the copied imports resolve.\n`,
    );
  }
}

export default async function run(rest) {
  const { flags, positionals } = parseArgs(rest, FLAGS);
  if (flags.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (positionals.length === 0) {
    throw new UsageError('Missing component id — usage: cieo add <id> [--dry-run] [--overwrite] [--yes]');
  }
  if (positionals.length > 1) {
    throw new UsageError(
      `Unexpected argument '${positionals[1]}' — usage: cieo add <id> [--dry-run] [--overwrite] [--yes]`,
    );
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
      'Cannot copy components into an html project — components need a React project (target next/vite).\n',
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
  const dryRun = flags['dry-run'] === true;
  if (dryRun) process.stdout.write('Dry run: no files will be written.\n');
  process.stdout.write(`Adding ${resolved.id} to ${config.componentsDir}:\n`);
  for (const rel of [...chosen.files, ...chosen.sharedFiles]) {
    process.stdout.write(`  ${rel}\n`);
  }

  const result = await copyPlan({
    root,
    config,
    id: resolved.id,
    overwrite: flags.overwrite === true,
    dryRun,
  });
  process.stdout.write(`${result.copied.length} copied, ${result.unchanged.length} unchanged, ${result.skipped.length} skipped\n`);
  if (!dryRun) warnAboutInstall(root);
  return 0;
}
