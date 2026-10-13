import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs, UsageError } from '../lib/args.mjs';
import { readConfig } from '../lib/config.mjs';
import { MARKER_BLOCK } from '../lib/entry.mjs';
import { packageRoot, projectRoot } from '../lib/paths.mjs';
import { loadRegistry, plan } from '../lib/registry.mjs';
import { rewriteImports } from '../lib/rewrite.mjs';

export const USAGE = `Usage: cieo doctor [--json]

Check config, package, entry wiring, copied components, and the alias mapping.

Options:
  --json   Print machine-readable results.
  --help   Show this help.
`;

const FLAGS = { json: 'boolean', help: 'boolean' };
const ENTRY_FILES = { next: 'app/layout.tsx', vite: 'src/main.tsx' };
const INSTALL_FIX = 'npm install cieo@latest';
const CHECK_ORDER = ['config', 'package', 'entry', 'components', 'alias'];

function ok(name, detail) {
  return { name, status: 'ok', detail };
}

function warn(name, detail) {
  return { name, status: 'warn', detail };
}

function fail(name, detail, fix) {
  return { name, status: 'fail', detail, fix };
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function byCodeUnit(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function checkConfig(root) {
  try {
    const read = readConfig(root);
    if (read === null) {
      return { check: fail('config', `No cieo.json found in ${root} — run 'npx cieo init' first.`, 'npx cieo init') };
    }
    return {
      config: read.config,
      check: ok('config', `cieo.json is valid (target ${read.config.target}, componentsDir ${read.config.componentsDir})`),
    };
  } catch (error) {
    return { check: fail('config', error.message, 'npx cieo init --force') };
  }
}

function checkPackage(root, config) {
  const cli = readJson(join(packageRoot(), 'package.json'));
  const cliVersion = typeof cli?.version === 'string' ? cli.version : 'unknown';
  const projectPath = join(root, 'package.json');
  const project = readJson(projectPath);
  if (project === null) {
    if (config.target === 'html' && !existsSync(projectPath)) {
      return warn(
        'package',
        'tokens-only project — no package needed for CSS; run npm install cieo only if you use the package imports',
      );
    }
    const detail = existsSync(projectPath) ? 'package.json is not valid JSON' : `no package.json found in ${root}`;
    return fail('package', detail, INSTALL_FIX);
  }
  const dependencies = { ...project.dependencies, ...project.devDependencies };
  if (!Object.hasOwn(dependencies, 'cieo')) {
    return fail('package', 'package.json does not list cieo in dependencies or devDependencies', INSTALL_FIX);
  }
  const installedPath = join(root, 'node_modules', 'cieo', 'package.json');
  const installed = readJson(installedPath);
  if (installed === null || typeof installed.version !== 'string') {
    const detail = existsSync(installedPath)
      ? 'node_modules/cieo/package.json is not valid JSON'
      : `cieo is not installed under node_modules (this CLI is ${cliVersion})`;
    return fail('package', detail, INSTALL_FIX);
  }
  if (installed.version !== cliVersion) {
    return fail('package', `installed cieo ${installed.version} does not match this CLI (${cliVersion})`, INSTALL_FIX);
  }
  return ok('package', `cieo ${cliVersion} is installed and matches this CLI`);
}

function entryFix(relative) {
  return `npx cieo init --force, or paste this block into ${relative}:\n${MARKER_BLOCK}`;
}

function checkEntry(root, config) {
  if (config.target === 'html') {
    return warn('entry', 'target html — tokens path needs only the CSS links');
  }
  const relative = ENTRY_FILES[config.target];
  let source;
  try {
    source = readFileSync(join(root, relative), 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return fail('entry', `${relative} not found`, entryFix(relative));
  }
  if (!source.includes('/* cieo:start */') || !source.includes('/* cieo:end */')) {
    return fail('entry', `${relative} has no cieo styles block`, entryFix(relative));
  }
  return ok('entry', `cieo styles are wired in ${relative}`);
}

function checkComponents(root, config) {
  const registry = loadRegistry();
  const ids = Object.keys(registry.components).sort(byCodeUnit);
  const present = [];
  const missingOwn = [];
  for (const id of ids) {
    const files = registry.components[id].files;
    const missing = files.filter((rel) => !existsSync(join(root, config.componentsDir, rel)));
    /* Every component owns exactly one file today, so a deleted file leaves the
       destination folder as the only evidence the component was ever copied. */
    const folder = dirname(files[0]);
    const folderPresent = folder !== '.' && existsSync(join(root, config.componentsDir, folder));
    if (missing.length < files.length || folderPresent) {
      present.push(id);
      if (missing.length > 0) missingOwn.push({ id, files: missing });
    }
  }
  const shared = Array.isArray(registry.shared) ? registry.shared : [];
  const sharedPresent = shared.filter((rel) => existsSync(join(root, config.componentsDir, rel)));
  if (present.length === 0 && sharedPresent.length === 0) {
    return ok('components', "no components copied yet — run 'npx cieo add <id>' to install one");
  }
  if (present.length === 0) {
    return ok('components', `only shared files present (${sharedPresent.join(', ')}) — run 'npx cieo add <id>' to install a component`);
  }

  const registrySources = new Map();
  const registryContent = (rel) => {
    if (!registrySources.has(rel)) {
      registrySources.set(rel, rewriteImports(readFileSync(join(packageRoot(), 'registry', rel), 'utf8'), rel));
    }
    return registrySources.get(rel);
  };
  const modified = [];
  const noteModified = (rel) => {
    if (!modified.includes(rel)) modified.push(rel);
  };

  for (const id of present) {
    for (const rel of registry.components[id].files) {
      const path = join(root, config.componentsDir, rel);
      if (!existsSync(path)) continue;
      if (readFileSync(path, 'utf8') !== registryContent(rel)) noteModified(rel);
    }
  }

  const missingShared = [];
  for (const id of present) {
    for (const rel of plan(registry, id).sharedFiles) {
      if (missingShared.includes(rel)) continue;
      const path = join(root, config.componentsDir, rel);
      if (!existsSync(path)) {
        missingShared.push(rel);
        continue;
      }
      if (readFileSync(path, 'utf8') !== registryContent(rel)) noteModified(rel);
    }
  }

  const edits = modified.length > 0 ? `; ${modified.length} local file(s) differ (your edits are kept)` : '';
  if (missingOwn.length > 0) {
    const parts = missingOwn.slice(0, 3).map(({ id, files }) => `${id} is missing ${files.join(', ')}`);
    const extra = missingOwn.length > 3 ? `; and ${missingOwn.length - 3} more component(s)` : '';
    const sharedNote =
      missingShared.length > 0 ? `; ${missingShared.slice(0, 3).join(', ')} required by copied components but missing` : '';
    return fail('components', `${parts.join('; ')}${extra}${sharedNote}${edits}`, `npx cieo add ${missingOwn[0].id} --overwrite`);
  }
  if (missingShared.length > 0) {
    const owner = present.find((id) => plan(registry, id).sharedFiles.includes(missingShared[0])) ?? present[0];
    return fail(
      'components',
      `${missingShared.slice(0, 3).join(', ')} required by copied components but missing${edits}`,
      `npx cieo add ${owner}`,
    );
  }
  if (modified.length > 0) {
    const noun = modified.length === 1 ? 'file differs' : 'files differ';
    return warn(
      'components',
      `${modified.length} local ${noun} from the registry (your edits are kept): ${modified.slice(0, 3).join(', ')}`,
    );
  }
  const noun = present.length === 1 ? 'component matches' : 'components match';
  return ok('components', `${present.length} copied ${noun} the registry`);
}

function checkAlias(root, config) {
  if (config.alias === undefined) return ok('alias', 'no alias configured');
  const mapping = `${config.alias}/*`;
  const tsconfig = readJson(join(root, 'tsconfig.json'));
  if (tsconfig === null) {
    return warn('alias', `alias '${config.alias}' is set but tsconfig.json is missing or invalid (expected a "${mapping}" path mapping)`);
  }
  const paths = tsconfig?.compilerOptions?.paths;
  if (paths === null || typeof paths !== 'object' || Array.isArray(paths) || !Object.hasOwn(paths, mapping)) {
    return warn('alias', `alias '${config.alias}' has no "${mapping}" path mapping in tsconfig.json`);
  }
  return ok('alias', `alias '${config.alias}' resolves through "${mapping}" in tsconfig.json`);
}

export default async function run(rest) {
  const { flags, positionals } = parseArgs(rest, FLAGS);
  if (flags.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (positionals.length > 0) {
    throw new UsageError(`Unexpected argument '${positionals[0]}' — usage: cieo doctor [--json]`);
  }

  const root = projectRoot();
  const { check: configCheck, config } = checkConfig(root);
  const checks = [configCheck];
  if (config === undefined) {
    for (const name of CHECK_ORDER.slice(1)) checks.push(warn(name, 'not checked — fix the config first'));
  } else {
    const guarded = (name, check) => {
      try {
        return check();
      } catch (error) {
        return fail(name, error.message, INSTALL_FIX);
      }
    };
    checks.push(guarded('package', () => checkPackage(root, config)));
    checks.push(guarded('entry', () => checkEntry(root, config)));
    checks.push(guarded('components', () => checkComponents(root, config)));
    checks.push(guarded('alias', () => checkAlias(root, config)));
  }

  const failures = checks.filter((check) => check.status === 'fail').length;
  const warnings = checks.filter((check) => check.status === 'warn').length;

  if (flags.json === true) {
    process.stdout.write(`${JSON.stringify({ checks, failures, warnings }, null, 2)}\n`);
  } else {
    for (const check of checks) {
      process.stdout.write(`${check.status} ${check.name}: ${check.detail}\n`);
      if (check.fix !== undefined) process.stdout.write(`  fix: ${check.fix.replace(/\n/g, '\n  ')}\n`);
    }
  }
  return failures > 0 ? 1 : 0;
}
