const PACKAGE_AREAS = {
  react: 'cieo/react',
  dom: 'cieo/dom',
  live: 'cieo/live',
  controls: 'cieo/controls',
  design: 'cieo/design',
  agent: 'cieo/agent',
  core: 'cieo',
};
// Modules with their own package subpath, checked before the area they live in. Mirrored in scripts/lib/registry.mjs.
const PACKAGE_FILES = { 'agent/icons.js': 'cieo/agent-icons' };
const COMPANION_FILES = {
  'customization.ts|./parts.js': true,
  'Popover/Popover.tsx|./position.js': true,
  'Popover/Popover.tsx|./usePopoverPosition.js': true,
  'Popover/usePopoverPosition.ts|./position.js': true,
  'AuthSignInCard/AuthSignInCard.tsx|./AuthMotion.js': true,
  'VoiceRecorder/VoiceRecorder.tsx|./recorderVisual.js': true,
};

/* Deliberately shape-based, mirroring scanImportSpecifiers in scripts/lib/registry.mjs:
   the registry generator and this rewriter must treat the same text as import
   specifiers. Text in comments or strings that happens to match the shape is
   treated as an import by both; the real-tree sweep proves shippable sources
   contain none. Sibling and shared imports lose '.js' so consumer bundlers
   resolve the copied .tsx rather than a missing .js. */
function importPattern() {
  return /((?:import|export)\s[^'"]*?from\s+|import\s+)'([^']+)'/g;
}

function unclassifiedImport(spec, fromFile) {
  return new Error(`Unclassified import '${spec}' in ${fromFile} — the rewriter refuses to guess`);
}

function classifyRelative(spec, fromFile) {
  if (spec.startsWith('./')) {
    if (COMPANION_FILES[`${fromFile}|${spec}`]) return { kind: 'shared' };
    throw unclassifiedImport(spec, fromFile);
  }
  const ups = (spec.match(/\.\.\//g) || []).length;
  const rest = spec.replace(/^(\.\.\/)+/, '');
  if (ups === 1) {
    if (rest === 'customization.js') return { kind: 'shared' };
    if (rest === 'parts.js') return { kind: 'shared' };
    if (rest === 'motion.js') return { kind: 'shared' };
    if (['AuthSignInCard/AuthMotion.js', 'VoiceRecorder/recorderVisual.js'].includes(rest)) return { kind: 'shared' };
    const [first] = rest.split('/');
    if (/^[A-Z]/.test(first) && rest === `${first}/${first}.js`) return { kind: 'sibling' };
    throw unclassifiedImport(spec, fromFile);
  }
  if (ups === 2) {
    if (PACKAGE_FILES[rest]) return { kind: 'package', packageImport: PACKAGE_FILES[rest] };
    const [area] = rest.split('/');
    if (PACKAGE_AREAS[area]) return { kind: 'package', packageImport: PACKAGE_AREAS[area] };
  }
  throw unclassifiedImport(spec, fromFile);
}

function rewriteSpecifier(spec, fromFile) {
  const territory = classifyRelative(spec, fromFile);
  if (territory.kind === 'package') return territory.packageImport;
  return spec.slice(0, -'.js'.length);
}

export function rewriteImports(source, fromFile) {
  return source.replace(importPattern(), (match, prefix, spec) => {
    if (!spec.startsWith('.')) return match;
    return `${prefix}'${rewriteSpecifier(spec, fromFile)}'`;
  });
}

export function assertNoPackageTerritoryImports(source, fromFile) {
  for (const match of source.matchAll(importPattern())) {
    const spec = match[2];
    if (spec.startsWith('../../')) {
      throw new Error(`Unrewritten package import '${spec}' in ${fromFile} — copied files must import through 'cieo/...' subpaths`);
    }
    if (spec.startsWith('.') && spec.endsWith('.js')) {
      throw new Error(`Relative import '${spec}' in ${fromFile} still ends with '.js' — consumer bundlers cannot resolve it`);
    }
  }
}
