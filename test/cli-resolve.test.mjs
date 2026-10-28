import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadRegistry, packageImportsFor, plan, resolveId } from '../cli/lib/registry.mjs';

function component(files, options = {}) {
  return {
    files,
    registryDependencies: options.dependencies ?? [],
    packageImports: options.packageImports ?? [],
    sharedFiles: options.sharedFiles ?? [],
  };
}

const STUB = {
  schemaVersion: 1,
  shared: ['motion.ts'],
  components: {
    A: component(['A/A.tsx'], { dependencies: ['B', 'C'], packageImports: ['cieo/react'], sharedFiles: ['motion.ts'] }),
    B: component(['B/B.tsx'], { dependencies: ['C'], packageImports: ['cieo/dom'], sharedFiles: ['motion.ts'] }),
    C: component(['C/C.tsx'], { packageImports: ['cieo'] }),
    Alarm: component(['Alarm/Alarm.tsx']),
    AlertDialog: component(['AlertDialog/AlertDialog.tsx']),
    Dialog: component(['Dialog/Dialog.tsx'], {
      dependencies: ['Overlay'],
      packageImports: ['cieo/react'],
      sharedFiles: ['motion.ts'],
    }),
    DialogBody: component(['DialogBody/DialogBody.tsx']),
    DialogFooter: component(['DialogFooter/DialogFooter.tsx']),
    DialogHeader: component(['DialogHeader/DialogHeader.tsx']),
    DialogTitle: component(['DialogTitle/DialogTitle.tsx']),
    HStack: component(['HStack/HStack.tsx']),
    Overlay: component(['Overlay/Overlay.tsx']),
    Toolbar: component(['Toolbar/Toolbar.tsx'], { dependencies: ['VStack', 'HStack'] }),
    VStack: component(['VStack/VStack.tsx']),
  },
};

test('resolveId matches ids case-insensitively, first', () => {
  assert.deepEqual(resolveId(STUB, 'Dialog'), { id: 'Dialog' });
  assert.deepEqual(resolveId(STUB, 'dialog'), { id: 'Dialog' });
  assert.deepEqual(resolveId(STUB, 'DIALOG'), { id: 'Dialog' });
});

test('resolveId suggests the near-miss id for a typo, and nothing unrelated', () => {
  const { suggestions } = resolveId(STUB, 'diolog');
  assert.deepEqual(suggestions, ['Dialog']);
});

test('resolveId ranks prefix matches before near misses, capped at five', () => {
  assert.deepEqual(resolveId(STUB, 'alert').suggestions, ['AlertDialog', 'Alarm']);
  assert.deepEqual(resolveId(STUB, 'dial').suggestions, [
    'Dialog',
    'DialogBody',
    'DialogFooter',
    'DialogHeader',
    'DialogTitle',
  ]);
});

test('resolveId returns an empty suggestion list for garbage', () => {
  assert.deepEqual(resolveId(STUB, 'qqqqqqqq'), { suggestions: [] });
});

test('plan visits dependencies depth-first, dedupes the diamond, and lists motion.ts once', () => {
  assert.deepEqual(plan(STUB, 'A'), {
    id: 'A',
    files: ['C/C.tsx', 'B/B.tsx', 'A/A.tsx'],
    sharedFiles: ['motion.ts'],
  });
});

test('plan visits sibling dependencies in alphabetical order', () => {
  assert.deepEqual(plan(STUB, 'Toolbar').files, ['HStack/HStack.tsx', 'VStack/VStack.tsx', 'Toolbar/Toolbar.tsx']);
});

test('plan keeps component files and shared files in their own lists', () => {
  const planned = plan(STUB, 'A');
  assert.equal(planned.files.includes('motion.ts'), false);
  assert.equal(new Set(planned.files).size, planned.files.length);
  assert.equal(new Set(planned.sharedFiles).size, planned.sharedFiles.length);
});

test('plan refuses an unknown id with an actionable error', () => {
  assert.throws(() => plan(STUB, 'Nope'), /Unknown component 'Nope'/);
});

test('packageImportsFor unions the transitive imports, sorted and deduped', () => {
  assert.deepEqual(packageImportsFor(STUB, 'A'), ['cieo', 'cieo/dom', 'cieo/react']);
  assert.deepEqual(packageImportsFor(STUB, 'Dialog'), ['cieo/react']);
  assert.deepEqual(packageImportsFor(STUB, 'Overlay'), []);
});

test('the bundled registry loads, resolves Dialog, and plans Overlay plus each customization and motion helper exactly once', () => {
  const registry = loadRegistry();
  assert.equal(registry.schemaVersion, 1);
  assert.ok(Object.keys(registry.components).length > 150, 'the full primitive inventory is present');
  assert.deepEqual(resolveId(registry, 'dialog'), { id: 'Dialog' });
  const planned = plan(registry, 'Dialog');
  assert.equal(planned.id, 'Dialog');
  assert.deepEqual(planned.files, ['Overlay/Overlay.tsx', 'Dialog/Dialog.tsx']);
  assert.deepEqual(planned.sharedFiles, ['customization.ts', 'parts.ts', 'motion.ts']);
  assert.equal(new Set(planned.files).size, planned.files.length);
  assert.equal(new Set(planned.sharedFiles).size, planned.sharedFiles.length);
  assert.ok(packageImportsFor(registry, 'Dialog').includes('cieo/react'));
});
