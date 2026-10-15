import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageRoot } from './paths.mjs';

const SCHEMA_VERSION = 1;
const MAX_SUGGESTIONS = 5;
const MAX_DISTANCE = 2;

function byCodeUnit(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function levenshtein(a, b) {
  if (a === b) return 0;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

function transitiveComponents(registry, id, visit) {
  const components = registry.components;
  if (!Object.hasOwn(components, id)) {
    throw new Error(`Unknown component '${id}' — run 'npx cieo list' to see the components this version ships.`);
  }
  const done = new Set();
  const walk = (name) => {
    if (done.has(name)) return;
    const entry = components[name];
    if (!entry) {
      throw new Error(`Component '${id}' depends on '${name}', which this registry does not contain — reinstall cieo.`);
    }
    done.add(name);
    for (const dependency of [...entry.registryDependencies].sort(byCodeUnit)) walk(dependency);
    visit(entry);
  };
  walk(id);
}

export function loadRegistry() {
  const path = join(packageRoot(), 'registry', 'index.json');
  let source;
  try {
    source = readFileSync(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Registry file not found: ${path} — the cieo package is incomplete; reinstall it.`);
    }
    throw new Error(`Cannot read registry file ${path}: ${error.message}`);
  }
  let registry;
  try {
    registry = JSON.parse(source);
  } catch (error) {
    throw new Error(`Registry file ${path} is not valid JSON: ${error.message}`);
  }
  const components = registry?.components;
  if (
    registry?.schemaVersion !== SCHEMA_VERSION ||
    typeof components !== 'object' ||
    components === null ||
    Array.isArray(components)
  ) {
    throw new Error(
      `Registry file ${path} is malformed: expected schemaVersion ${SCHEMA_VERSION} and a components object — reinstall cieo.`,
    );
  }
  return registry;
}

export function resolveId(registry, input) {
  if (typeof input !== 'string' || input === '') {
    throw new Error(`Component id must be a non-empty string (got ${JSON.stringify(input)}).`);
  }
  const wanted = input.toLowerCase();
  const ids = Object.keys(registry.components).sort(byCodeUnit);
  const exact = ids.find((id) => id.toLowerCase() === wanted);
  if (exact !== undefined) return { id: exact };
  const prefixes = [];
  const close = [];
  for (const id of ids) {
    const lower = id.toLowerCase();
    if (lower.startsWith(wanted)) {
      prefixes.push(id);
      continue;
    }
    const distance = levenshtein(wanted, lower);
    if (distance <= MAX_DISTANCE) close.push({ id, distance });
  }
  close.sort((a, b) => a.distance - b.distance || byCodeUnit(a.id, b.id));
  const suggestions = [...prefixes, ...close.map((match) => match.id)].slice(0, MAX_SUGGESTIONS);
  return { suggestions };
}

export function plan(registry, id) {
  const files = [];
  const sharedFiles = [];
  const seenFiles = new Set();
  const seenSharedFiles = new Set();
  const collect = (list, seen, file) => {
    if (seen.has(file)) return;
    seen.add(file);
    list.push(file);
  };
  transitiveComponents(registry, id, (entry) => {
    for (const file of entry.files) collect(files, seenFiles, file);
    for (const file of entry.sharedFiles) collect(sharedFiles, seenSharedFiles, file);
  });
  return { id, files, sharedFiles };
}

export function packageImportsFor(registry, id) {
  const imports = new Set();
  transitiveComponents(registry, id, (entry) => {
    for (const specifier of entry.packageImports) imports.add(specifier);
  });
  return [...imports].sort(byCodeUnit);
}
