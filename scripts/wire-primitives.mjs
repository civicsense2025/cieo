// scripts/wire-primitives.mjs — single source of truth for primitive wiring.
// Scans src/primitives/<Name>/<Name>.tsx exports and regenerates:
//   - src/primitives/index.ts (barrel)
//   - package.json deep exports (./<Name> entries; everything else preserved)
//   - design/primitives.css primitive @imports (only stylesheets that exist)
//   - docs/generated/primitive-exports.json ({ names: [...] } consumed by tests)
// Deterministic: sorted, no timestamps. Run: node scripts/wire-primitives.mjs [--check]
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const primDir = `${root}/src/primitives`;
const check = process.argv.includes('--check');

function parseExports(src) {
  const values = [];
  const types = [];
  for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)) values.push(m[1]);
  for (const m of src.matchAll(/export\s+(?:const|class)\s+(\w+)/g)) values.push(m[1]);
  for (const m of src.matchAll(/export\s+(interface)\s+(\w+)/g)) types.push(m[2]);
  for (const m of src.matchAll(/export\s+type\s+(\w+)\s*=/g)) types.push(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const p = part.trim();
      if (!p) continue;
      const isType = p.startsWith('type ');
      const bare = isType ? p.slice(5).trim() : p;
      const asMatch = bare.match(/^(\S+)\s+as\s+(\S+)$/);
      const name = asMatch ? asMatch[2] : bare;
      if (isType) types.push(name);
      else values.push(name);
    }
  }
  for (const m of src.matchAll(/export\s+type\s*\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const p = part.trim();
      if (!p) continue;
      const asMatch = p.match(/^(\S+)\s+as\s+(\S+)$/);
      types.push(asMatch ? asMatch[2] : p);
    }
  }
  return { values: [...new Set(values)], types: [...new Set(types)] };
}

const dirs = readdirSync(primDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const entries = [];
for (const dir of dirs) {
  const file = `${primDir}/${dir}/${dir}.tsx`;
  if (!existsSync(file)) {
    console.error(`missing component source: src/primitives/${dir}/${dir}.tsx`);
    process.exitCode = 1;
    continue;
  }
  const { values, types } = parseExports(readFileSync(file, 'utf8'));
  if (values.length === 0) {
    console.error(`no exported values in ${file}`);
    process.exitCode = 1;
  }
  entries.push({ dir, values, types });
}
if (process.exitCode) process.exit(process.exitCode);

const barrel = entries
  .map(({ dir, values, types }) => `export { ${[...values, ...types.map((t) => `type ${t}`)].join(', ')} } from './${dir}/${dir}.js';`)
  .join('\n') + '\n';

const pkg = JSON.parse(readFileSync(`${root}/package.json`, 'utf8'));
const deepExports = {};
for (const { dir } of entries) {
  deepExports[`./${dir}`] = {
    types: `./dist/primitives/${dir}/${dir}.d.ts`,
    default: `./dist/primitives/${dir}/${dir}.js`,
  };
}
const merged = {};
for (const [k, v] of Object.entries(pkg.exports)) {
  if (/^\.\/[A-Z]/.test(k)) continue; // regenerate primitive deep exports
  merged[k] = v;
  if (k === './primitives.css') Object.assign(merged, deepExports);
}
if (!('./primitives.css' in pkg.exports)) Object.assign(merged, deepExports, { './primitives': merged['./primitives'] });
pkg.exports = merged;

const cssFiles = readdirSync(`${root}/design/styles/primitives`).filter((f) => f.endsWith('.css')).sort();
const css = `/* Opt-in primitives. Unlayered application CSS can override these without !important. */
@layer cieo.base, cieo.components, cieo.utilities, cieo.accessibility;
@import './styles/base.css';
@import './styles/controls.css';
@import './styles/layout.css';
@import './styles/accessibility.css';
${cssFiles.map((f) => `@import './styles/primitives/${f}';`).join('\n')}
`;

const namesJson = JSON.stringify({ names: entries.map((e) => e.dir), count: entries.length }, null, 2) + '\n';

const writes = [
  [`${primDir}/index.ts`, barrel],
  [`${root}/package.json`, JSON.stringify(pkg, null, 2) + '\n'],
  [`${root}/design/primitives.css`, css],
  [`${root}/docs/generated/primitive-exports.json`, namesJson],
];

let dirty = false;
for (const [path, content] of writes) {
  const prev = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (prev !== content) {
    dirty = true;
    if (!check) writeFileSync(path, content);
    console.log(`${check ? 'stale' : 'wrote'}: ${path}`);
  }
}
if (check && dirty) {
  console.error('wire check failed: run node scripts/wire-primitives.mjs');
  process.exit(1);
}
console.log(`primitives: ${entries.length}`);
