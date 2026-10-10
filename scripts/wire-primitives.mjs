// scripts/wire-primitives.mjs — single source of truth for primitive wiring.
// Scans src/primitives/<Name>/<Name>.tsx exports and regenerates:
//   - src/primitives/index.ts (barrel)
//   - package.json deep exports (./<Name> entries; everything else preserved)
//   - design/primitives.css primitive @imports (only stylesheets that exist)
//   - docs/generated/primitive-exports.json ({ names: [...] } consumed by tests)
// Deterministic: sorted, no timestamps. Run: node scripts/wire-primitives.mjs [--check]
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { scanPrimitives } from './lib/primitives.mjs';

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const primDir = `${root}/src/primitives`;
const check = process.argv.includes('--check');

let entries;
try {
  entries = scanPrimitives(root);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

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
