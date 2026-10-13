import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseArgs, UsageError } from '../lib/args.mjs';
import { CONFIG_NAME, readConfig, validateConfig, writeConfig } from '../lib/config.mjs';
import { copyPlan } from '../lib/copy.mjs';
import { detectPackageManager, detectTarget } from '../lib/detect.mjs';
import { wireEntry } from '../lib/entry.mjs';
import { projectRoot } from '../lib/paths.mjs';
import { createPrompt } from '../lib/prompt.mjs';
import { loadRegistry, resolveId } from '../lib/registry.mjs';
import { writeThemeFile } from '../lib/theme.mjs';
import { brands, createTheme } from '../../design/index.js';

export const USAGE = `Usage: cieo init [options]

Set up a project: cieo.json, a themed stylesheet, wired CSS imports, and an
optional starter component.

Options:
  --yes            Accept every default without asking.
  --target <t>     Force the target: next, vite, or html.
  --brand <b>      Brand: iris, studio, lagoon, ember, rose, mono.
  --scheme <s>     Appearance: light or dark.
  --dir <path>     Components directory (default components/cieo).
  --with <id>      Copy this starter component (default Dialog).
  --no-starter     Copy no component (mutually exclusive with --with).
  --skip-install   Write files without running the package manager.
  --force          Update an existing cieo.json.
  --help           Show this help.
`;

const FLAGS = {
  yes: 'boolean',
  target: 'string',
  brand: 'string',
  scheme: 'string',
  dir: 'string',
  with: 'string',
  'no-starter': 'boolean',
  'skip-install': 'boolean',
  force: 'boolean',
  help: 'boolean',
};

const TARGETS = ['next', 'vite', 'html'];
const DEFAULT_DIR = 'components/cieo';
const DEFAULT_BRAND = 'iris';
const DEFAULT_SCHEME = 'light';
const CONFIG_KEYS = ['version', 'target', 'componentsDir', 'alias', 'theme'];
const BRAND_OPTIONS = [DEFAULT_BRAND, ...Object.keys(brands).filter((brand) => brand !== DEFAULT_BRAND)];
const SCHEME_OPTIONS = ['light', 'dark'];
const STARTER_LABELS = ['Dialog (recommended)', 'Another component', 'Skip for now'];
const HTML_LINKS = [
  '<link rel="stylesheet" href="node_modules/cieo/tokens/tokens.css">',
  '<link rel="stylesheet" href="node_modules/cieo/design/themes.css">',
  '<link rel="stylesheet" href="node_modules/cieo/design/primitives.css">',
  '<link rel="stylesheet" href="cieo-theme.css">',
];
const INSTALL_COMMANDS = {
  npm: ['npm', ['install', 'cieo']],
  pnpm: ['pnpm', ['add', 'cieo']],
  yarn: ['yarn', ['add', 'cieo']],
  bun: ['bun', ['add', 'cieo']],
};

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function deriveAlias(root, componentsDir) {
  const tsconfig = readJson(join(root, 'tsconfig.json'));
  const paths = tsconfig?.compilerOptions?.paths;
  if (paths === null || typeof paths !== 'object' || Array.isArray(paths)) return undefined;
  if (!Object.hasOwn(paths, '@/*')) return undefined;
  return `@/${componentsDir.split(/[\\/]+/).join('/')}`;
}

function carriedExtras(root) {
  const extras = {};
  let read;
  try {
    read = readConfig(root);
  } catch {
    return extras;
  }
  if (read === null) return extras;
  for (const [key, value] of Object.entries(read.config)) {
    if (!CONFIG_KEYS.includes(key)) extras[key] = value;
  }
  return extras;
}

function relativeTo(root, path) {
  const noted = relative(root, path);
  return noted === '' ? path : noted;
}

function resolveTarget(root, flags) {
  if (flags.target !== undefined) {
    if (!TARGETS.includes(flags.target)) {
      return { error: `Unknown target '${flags.target}' — use --target next, vite, or html.` };
    }
    return { target: flags.target };
  }
  return { target: detectTarget(root) ?? 'html' };
}

async function chooseStarter(prompt) {
  const answer = await prompt.choose('Add a starter component?', [...STARTER_LABELS], { default: 0 });
  const choice = typeof answer === 'number' ? STARTER_LABELS[answer] : answer;
  if (choice === STARTER_LABELS[2]) return null;
  if (choice !== STARTER_LABELS[1]) return 'Dialog';
  const id = await prompt.ask("Component id (run 'npx cieo list' to browse):", { default: 'Dialog' });
  const resolved = resolveId(loadRegistry(), id);
  if (resolved.id === undefined) {
    const suggestions = resolved.suggestions.length > 0 ? ` Did you mean: ${resolved.suggestions.join(', ')}?` : '';
    throw new Error(`Unknown component '${id}'.${suggestions} Run 'npx cieo list' to see the components this version ships.`);
  }
  return resolved.id;
}

async function init(root, flags, prompt) {
  const { target, error } = resolveTarget(root, flags);
  if (error !== undefined) {
    process.stderr.write(`${error}\n`);
    return 1;
  }
  if (target !== 'html' && !existsSync(join(root, 'tsconfig.json'))) {
    process.stderr.write('components are TypeScript — add a tsconfig.json, or use --target html\n');
    return 1;
  }
  if (target === 'html' && flags.with !== undefined) {
    process.stderr.write('components need a React project (target next/vite)\n');
    return 1;
  }
  if (target === 'html' && flags.dir !== undefined) {
    process.stderr.write('--dir does not apply to --target html — the html path writes only the theme stylesheet.\n');
    return 1;
  }

  const brand = flags.brand ?? (await prompt.choose('Brand:', [...BRAND_OPTIONS], { default: 0 }));
  const scheme = flags.scheme ?? (await prompt.choose('Appearance:', [...SCHEME_OPTIONS], { default: 0 }));
  const componentsDir =
    target === 'html' ? DEFAULT_DIR : flags.dir ?? (await prompt.ask('Components directory:', { default: DEFAULT_DIR }));

  const theme = { brand, scheme };
  try {
    createTheme(theme);
  } catch (cause) {
    process.stderr.write(
      `${cause.message} — valid brands: ${BRAND_OPTIONS.join(', ')}; valid schemes: ${SCHEME_OPTIONS.join(', ')}.\n`,
    );
    return 1;
  }

  let starterId;
  if (flags.with !== undefined) {
    const resolved = resolveId(loadRegistry(), flags.with);
    if (resolved.id === undefined) {
      process.stderr.write(`Unknown component '${flags.with}'.\n`);
      if (resolved.suggestions.length > 0) {
        process.stderr.write(`Did you mean: ${resolved.suggestions.join(', ')}?\n`);
      }
      process.stderr.write("Run 'npx cieo list' to see every component in this version.\n");
      return 1;
    }
    starterId = resolved.id;
  }

  const existing = existsSync(join(root, CONFIG_NAME));
  if (existing && flags.force !== true) {
    if (!prompt.tty) {
      process.stderr.write(`${CONFIG_NAME} already exists in ${root} — re-run with --force to update it.\n`);
      return 1;
    }
    const update = await prompt.confirm(`${CONFIG_NAME} already exists — update the existing setup?`, { default: true });
    if (!update) {
      process.stdout.write('Left the existing setup untouched.\n');
      return 0;
    }
  }

  const alias = target === 'html' ? undefined : deriveAlias(root, componentsDir);
  const config = {
    version: 1,
    target,
    componentsDir,
    ...(alias === undefined ? {} : { alias }),
    theme,
    ...(existing ? carriedExtras(root) : {}),
  };
  try {
    validateConfig(config);
  } catch (cause) {
    process.stderr.write(`${cause.message} — pass a relative components directory inside the project with --dir.\n`);
    return 1;
  }

  const written = [join(root, CONFIG_NAME)];
  writeConfig(root, config);
  written.push(writeThemeFile(root, target, theme).file);

  if (target === 'html') {
    process.stdout.write('Add these stylesheets to your page:\n');
    for (const link of HTML_LINKS) process.stdout.write(`${link}\n`);
    process.stdout.write(
      'If you serve a bare directory without node_modules, copy the cieo tokens/ and design/ folders next to your page and point the links there.\n',
    );
  } else {
    written.push(wireEntry(root, target).file);
  }

  let starterLine = 'skipped';
  if (target !== 'html' && flags['no-starter'] !== true) {
    const chosen = starterId ?? (await chooseStarter(prompt));
    if (chosen !== null) {
      const result = await copyPlan({ root, config, id: chosen, overwrite: false, prompt });
      starterLine =
        result.copied.length > 0
          ? `${chosen} copied to ${config.componentsDir} (${result.copied.length} files)`
          : `${chosen} already present (${result.unchanged.length} files unchanged)`;
    }
  }

  if (flags['skip-install'] !== true) {
    const manager = detectPackageManager(root);
    const [command, args] = INSTALL_COMMANDS[manager];
    const outcome = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
    if (outcome.error !== undefined || outcome.status !== 0) {
      process.stderr.write(
        `cieo: warning: installing cieo with ${manager} failed — run '${command} ${args.join(' ')}' in your project, then 'npx cieo doctor' to verify the setup.\n`,
      );
    }
  }

  process.stdout.write(`\ncieo init complete (target ${target}).\nFiles written:\n`);
  for (const path of written) process.stdout.write(`  ${relativeTo(root, path)}\n`);
  process.stdout.write(`Starter component: ${starterLine}\n\nNext steps:\n`);
  if (target === 'html') {
    process.stdout.write('  npx cieo theme brand=<brand> scheme=<scheme>   regenerate the theme stylesheet\n');
  } else {
    process.stdout.write('  npx cieo add <component-id>   copy another component (npx cieo list to browse)\n');
  }
  process.stdout.write('  npx cieo doctor               verify the setup\n');
  process.stdout.write('\nDocs: docs/installation.md\n');
  return 0;
}

export default async function run(rest) {
  const { flags, positionals } = parseArgs(rest, FLAGS);
  if (flags.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (positionals.length > 0) {
    throw new UsageError(`Unexpected argument '${positionals[0]}' — usage: cieo init [options]`);
  }
  if (flags.with !== undefined && flags['no-starter'] === true) {
    throw new UsageError('--with and --no-starter are mutually exclusive — pass one or the other.');
  }

  const prompt = createPrompt({ yes: flags.yes === true });
  try {
    return await init(projectRoot(), flags, prompt);
  } finally {
    prompt.close();
  }
}
