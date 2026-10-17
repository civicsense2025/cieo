import { readdirSync, readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';

const PACKAGE_AREAS = { react: 'cieo/react', dom: 'cieo/dom', live: 'cieo/live', controls: 'cieo/controls', design: 'cieo/design', agent: 'cieo/agent', core: 'cieo' };
// Modules with their own package subpath, checked before the area they live in. Mirrored in cli/lib/rewrite.mjs.
const PACKAGE_FILES = { 'agent/icons.js': 'cieo/agent-icons' };

export function classifyImport(spec) {
  if (spec === 'react' || spec.startsWith('react/')) return { kind: 'peer' };
  if (!spec.startsWith('../')) throw new Error(`Unclassified bare import '${spec}' — registry generation refuses to guess`);
  const ups = (spec.match(/\.\.\//g) || []).length;
  const rest = spec.replace(/^(\.\.\/)+/, '');
  if (ups === 1) {
    if (rest === 'motion.js') return { kind: 'shared', file: 'motion.ts' };
    const [first] = rest.split('/');
    if (/^[A-Z]/.test(first) && rest === `${first}/${first}.js`) return { kind: 'sibling', dir: first };
    throw new Error(`Unclassified import '${spec}' — registry generation refuses to guess`);
  }
  if (ups === 2) {
    if (PACKAGE_FILES[rest]) return { kind: 'package', packageImport: PACKAGE_FILES[rest] };
    const [area] = rest.split('/');
    if (PACKAGE_AREAS[area]) return { kind: 'package', packageImport: PACKAGE_AREAS[area] };
  }
  throw new Error(`Unclassified import '${spec}' — registry generation refuses to guess`);
}

export function scanImportSpecifiers(source) {
  const specs = [];
  for (const m of source.matchAll(/(?:import|export)\s[^'"]*?from\s+'([^']+)'|import\s+'([^']+)'/g)) specs.push(m[1] ?? m[2]);
  return [...new Set(specs)];
}

export function scanRegistrySources(root) {
  const primDir = `${root}/src/primitives`;
  const dirs = readdirSync(primDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const components = {};
  for (const dir of dirs) {
    const file = `${dir}/${dir}.tsx`;
    if (!existsSync(`${primDir}/${file}`)) throw new Error(`Primitive '${dir}' has no ${file}`);
    const source = readFileSync(`${primDir}/${file}`, 'utf8');
    const registryDependencies = new Set(), packageImports = new Set(), sharedFiles = new Set();
    for (const spec of scanImportSpecifiers(source)) {
      const c = classifyImport(spec);
      if (c.kind === 'sibling') registryDependencies.add(c.dir);
      else if (c.kind === 'package') packageImports.add(c.packageImport);
      else if (c.kind === 'shared') sharedFiles.add(c.file);
    }
    for (const dep of registryDependencies) if (!existsSync(`${primDir}/${dep}/${dep}.tsx`)) throw new Error(`'${dir}' imports missing primitive '${dep}'`);
    components[dir] = { files: [file], registryDependencies: [...registryDependencies].sort(), packageImports: [...packageImports].sort(), sharedFiles: [...sharedFiles].sort() };
  }
  return components;
}
