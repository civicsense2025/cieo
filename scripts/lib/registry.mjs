import { readdirSync, readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';

const PACKAGE_AREAS = { react: 'cieo/react', dom: 'cieo/dom', live: 'cieo/live', controls: 'cieo/controls', design: 'cieo/design', agent: 'cieo/agent', core: 'cieo' };
// Modules with their own package subpath, checked before the area they live in. Mirrored in cli/lib/rewrite.mjs.
const PACKAGE_FILES = { 'agent/icons.js': 'cieo/agent-icons' };
const COMPANION_FILES = {
  'AuthSignInCard/AuthMotion.js': 'AuthSignInCard/AuthMotion.tsx',
  'VoiceRecorder/recorderVisual.js': 'VoiceRecorder/recorderVisual.ts',
};

export function classifyImport(spec, fromFile = '') {
  if (spec === 'react' || spec.startsWith('react/')) return { kind: 'peer' };
  if (!spec.startsWith('.')) throw new Error(`Unclassified bare import '${spec}' — registry generation refuses to guess`);
  if (spec.startsWith('./')) {
    const companion = fromFile === 'AuthSignInCard/AuthSignInCard.tsx' && spec === './AuthMotion.js'
      ? 'AuthSignInCard/AuthMotion.tsx'
      : fromFile === 'VoiceRecorder/VoiceRecorder.tsx' && spec === './recorderVisual.js'
        ? 'VoiceRecorder/recorderVisual.ts'
        : null;
    if (companion) return { kind: 'shared', file: companion };
    throw new Error(`Unclassified import '${spec}' — registry generation refuses to guess`);
  }
  const ups = (spec.match(/\.\.\//g) || []).length;
  const rest = spec.replace(/^(\.\.\/)+/, '');
  if (ups === 1) {
    if (rest === 'motion.js') return { kind: 'shared', file: 'motion.ts' };
    if (COMPANION_FILES[rest]) return { kind: 'shared', file: COMPANION_FILES[rest] };
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
    const registryDependencies = new Set(), packageImports = new Set(), sharedFiles = new Set();
    const pending = [file];
    const scanned = new Set();
    while (pending.length) {
      const sourceFile = pending.pop();
      if (scanned.has(sourceFile)) continue;
      scanned.add(sourceFile);
      const source = readFileSync(`${primDir}/${sourceFile}`, 'utf8');
      for (const spec of scanImportSpecifiers(source)) {
        const c = classifyImport(spec, sourceFile);
        if (c.kind === 'sibling') registryDependencies.add(c.dir);
        else if (c.kind === 'package') packageImports.add(c.packageImport);
        else if (c.kind === 'shared') {
          sharedFiles.add(c.file);
          if (!scanned.has(c.file)) pending.push(c.file);
        }
      }
    }
    for (const dep of registryDependencies) if (!existsSync(`${primDir}/${dep}/${dep}.tsx`)) throw new Error(`'${dir}' imports missing primitive '${dep}'`);
    components[dir] = { files: [file], registryDependencies: [...registryDependencies].sort(), packageImports: [...packageImports].sort(), sharedFiles: [...sharedFiles].sort() };
  }
  return components;
}
