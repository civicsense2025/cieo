#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { UsageError } from '../cli/lib/args.mjs';
import { packageRoot } from '../cli/lib/paths.mjs';

const COMMANDS = {
  init: 'Set up a project: config, styles, theme, and an optional starter component.',
  add: 'Copy a component and its dependencies into your project.',
  list: 'List every component and whether it is copied.',
  diff: 'Compare a copied component against the registry.',
  theme: 'Choose theme axes and regenerate the theme stylesheet.',
  doctor: 'Check config, wiring, and copied files; exits nonzero on failure.',
};

function helpText() {
  const commands = Object.entries(COMMANDS)
    .map(([name, description]) => `  ${name.padEnd(7)} ${description}`)
    .join('\n');
  return `cieo: install Cieo components and themes.

Usage:
  cieo <command> [options]

Commands:
${commands}

Options:
  --help     Show this help.
  --version  Print the cieo version.
`;
}

function version() {
  return JSON.parse(readFileSync(join(packageRoot(), 'package.json'), 'utf8')).version;
}

async function main(argv) {
  const [command, ...rest] = argv;
  if (command === undefined || command === '--help') {
    process.stdout.write(helpText());
    return 0;
  }
  if (command === '--version') {
    process.stdout.write(`${version()}\n`);
    return 0;
  }
  if (!Object.hasOwn(COMMANDS, command)) {
    process.stderr.write(`Unknown command '${command}'\n`);
    return 2;
  }
  const { default: run } = await import(`../cli/commands/${command}.mjs`);
  return (await run(rest)) ?? 0;
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (error) {
  if (error instanceof UsageError) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  } else {
    process.stderr.write(`cieo: ${error.message}\n`);
    process.exitCode = 1;
  }
}
