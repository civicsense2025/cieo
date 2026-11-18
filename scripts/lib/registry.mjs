import { readdirSync, readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';

const PACKAGE_AREAS = { react: 'cieo/react', dom: 'cieo/dom', live: 'cieo/live', state: 'cieo/state', controls: 'cieo/controls', design: 'cieo/design', agent: 'cieo/agent', core: 'cieo' };
// Modules with their own package subpath, checked before the area they live in. Mirrored in cli/lib/rewrite.mjs.
const PACKAGE_FILES = { 'agent/icons.js': 'cieo/agent-icons', 'state/react.js': 'cieo/state/react' };
const ROOT_SHARED = { './parts.js': 'parts.ts', './customization.js': 'customization.ts' };
const COMPANION_FILES = {
  'auth-shared.js': 'auth-shared.tsx',
  'AudioPlayer/audioPlayerState.js': 'AudioPlayer/audioPlayerState.ts',
  'VoiceRecorder/recorderVisual.js': 'VoiceRecorder/recorderVisual.ts',
  'VoiceRecorder/recorderState.js': 'VoiceRecorder/recorderState.ts',
  'VoiceRecorder/recorderTake.js': 'VoiceRecorder/recorderTake.ts',
  'VoiceRecorder/RecorderControls.js': 'VoiceRecorder/RecorderControls.tsx',
};
const SAME_FOLDER_COMPANIONS = {
  'Popover/Popover.tsx|./focus.js': 'Popover/focus.ts',
  'Popover/Popover.tsx|./position.js': 'Popover/position.ts',
  'Popover/Popover.tsx|./usePopoverPosition.js': 'Popover/usePopoverPosition.ts',
  'Popover/usePopoverPosition.ts|./position.js': 'Popover/position.ts',
  'AudioPlayer/AudioPlayer.tsx|./audioPlayerState.js': 'AudioPlayer/audioPlayerState.ts',
  'VoiceRecorder/VoiceRecorder.tsx|./recorderVisual.js': 'VoiceRecorder/recorderVisual.ts',
  'VoiceRecorder/VoiceRecorder.tsx|./recorderState.js': 'VoiceRecorder/recorderState.ts',
  'VoiceRecorder/VoiceRecorder.tsx|./recorderTake.js': 'VoiceRecorder/recorderTake.ts',
  'VoiceRecorder/VoiceRecorder.tsx|./RecorderControls.js': 'VoiceRecorder/RecorderControls.tsx',
  'VoiceRecorder/RecorderControls.tsx|./recorderVisual.js': 'VoiceRecorder/recorderVisual.ts',
  'VoiceRecorder/RecorderControls.tsx|./recorderState.js': 'VoiceRecorder/recorderState.ts',
  'VoiceRecorder/recorderTake.ts|./recorderState.js': 'VoiceRecorder/recorderState.ts',
};

export function classifyImport(spec, fromFile = '') {
  if (spec === 'react' || spec.startsWith('react/') || spec === 'react-dom') return { kind: 'peer' };
  if (!spec.startsWith('.')) throw new Error(`Unclassified bare import '${spec}' — registry generation refuses to guess`);
  if (spec.startsWith('./')) {
    // A shared module at the primitives root imports its root neighbours with ./ .
    if (fromFile && !fromFile.includes('/') && ROOT_SHARED[spec]) return { kind: 'shared', file: ROOT_SHARED[spec] };
    if (SAME_FOLDER_COMPANIONS[`${fromFile}|${spec}`]) return { kind: 'shared', file: SAME_FOLDER_COMPANIONS[`${fromFile}|${spec}`] };
    throw new Error(`Unclassified import '${spec}' — registry generation refuses to guess`);
  }
  // Root-level shared modules sit one directory above component files, so their depth counts one more.
  const ups = (spec.match(/\.\.\//g) || []).length + (fromFile && !fromFile.includes('/') ? 1 : 0);
  const rest = spec.replace(/^(\.\.\/)+/, '');
  if (ups === 1) {
    if (rest === 'customization.js') return { kind: 'shared', file: 'customization.ts' };
    if (rest === 'parts.js') return { kind: 'shared', file: 'parts.ts' };
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
