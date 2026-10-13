// scripts/build-registry.mjs — single source of truth for the installable registry.
// Scans src/primitives/<Name>/<Name>.tsx with the import classifier, then regenerates:
//   - registry/<Name>/<Name>.tsx and registry/<shared file> copies of shipped sources
//   - registry/index.json ({ schemaVersion, shared, components })
//   - src/primitives/<Name>/manifest.json "dependencies" (synced to the scan)
// Deterministic: sorted, no timestamps. Run: node scripts/build-registry.mjs [--check]
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanRegistrySources } from './lib/registry.mjs';

const SCHEMA_VERSION = 1;

const json = (value) => JSON.stringify(value, null, 2) + '\n';

// Manifests are hand-formatted with inline objects; replace only the dependencies
// value so every other byte survives, and minified manifests stay minified.
function syncManifestDependencies(raw, dependencies, name) {
  const match = raw.match(/("dependencies"\s*:\s*)\[[^\]]*\]/);
  if (!match) throw new Error(`primitive '${name}' manifest.json has no dependencies array`);
  const separator = raw.includes('\n') ? ', ' : ',';
  const literal = `[${dependencies.map((dep) => JSON.stringify(dep)).join(separator)}]`;
  return raw.slice(0, match.index) + match[1] + literal + raw.slice(match.index + match[0].length);
}

export function buildRegistry(root, { check = false } = {}) {
  const components = scanRegistrySources(root);
  const shared = [...new Set(Object.values(components).flatMap((c) => c.sharedFiles))].sort();
  const index = { schemaVersion: SCHEMA_VERSION, shared, components };

  const outputs = [];
  for (const component of Object.values(components)) {
    for (const file of component.files) outputs.push([`registry/${file}`, readFileSync(`${root}/src/primitives/${file}`)]);
  }
  for (const file of shared) outputs.push([`registry/${file}`, readFileSync(`${root}/src/primitives/${file}`)]);
  outputs.push(['registry/index.json', json(index)]);

  const written = [];
  const diffs = [];
  const emit = (rel, content) => {
    const target = `${root}/${rel}`;
    const next = Buffer.isBuffer(content) ? content : Buffer.from(content);
    if (existsSync(target) && readFileSync(target).equals(next)) return;
    if (check) {
      diffs.push(rel);
      return;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, next);
    written.push(rel);
  };

  for (const [rel, content] of outputs) emit(rel, content);

  for (const [name, component] of Object.entries(components)) {
    const rel = `src/primitives/${name}/manifest.json`;
    if (!existsSync(`${root}/${rel}`)) {
      if (check) {
        diffs.push(rel);
        continue;
      }
      throw new Error(`primitive '${name}' has no manifest.json to sync`);
    }
    emit(rel, syncManifestDependencies(readFileSync(`${root}/${rel}`, 'utf8'), component.registryDependencies, name));
  }

  return { index, written, diffs };
}

function main() {
  const root = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
  const check = process.argv.includes('--check');
  let result;
  try {
    result = buildRegistry(root, { check });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  if (!check) {
    for (const rel of result.written) console.log(`wrote: ${rel}`);
    console.log(`registry: ${Object.keys(result.index.components).length} components, ${result.written.length} files written`);
    return;
  }
  for (const rel of result.diffs) console.error(`stale: ${rel}`);
  if (result.diffs.length) {
    console.error('registry check failed: run node scripts/build-registry.mjs');
    process.exitCode = 1;
    return;
  }
  console.log('registry: clean');
}

// realpath both sides: tmpdirs on macOS resolve through /private symlinks.
const isMain = () => {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
};
if (isMain()) main();
