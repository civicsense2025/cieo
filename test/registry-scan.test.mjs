import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classifyImport, scanImportSpecifiers, scanRegistrySources } from '../scripts/lib/registry.mjs';

// The CLI keeps its own copy of the package map; a drift would make copied and generated imports disagree.
test('the CLI and the generator map the same package areas', () => {
  const areas = (file) => {
    const body = readFileSync(file, 'utf8').match(/const PACKAGE_AREAS = \{([\s\S]*?)\};/)[1];
    return Object.fromEntries([...body.matchAll(/['"]?([\w-]+)['"]?:\s*'([^']+)'/g)].map((m) => [m[1], m[2]]));
  };
  assert.deepEqual(areas('cli/lib/rewrite.mjs'), areas('scripts/lib/registry.mjs'));
  assert.equal(areas('cli/lib/rewrite.mjs')['data-grid'], 'cieo/data-grid');
});

test('classifies each territory', () => {
  assert.deepEqual(classifyImport('react'), { kind: 'peer' });
  assert.deepEqual(classifyImport('react/jsx-runtime'), { kind: 'peer' });
  assert.deepEqual(classifyImport('../motion.js'), { kind: 'shared', file: 'motion.ts' });
  assert.deepEqual(classifyImport('../Overlay/Overlay.js'), { kind: 'sibling', dir: 'Overlay' });
  assert.deepEqual(classifyImport('../auth-shared.js', 'AuthAccountCard/AuthAccountCard.tsx'), { kind: 'shared', file: 'auth-shared.tsx' });
  assert.deepEqual(classifyImport('./parts.js', 'auth-shared.tsx'), { kind: 'shared', file: 'parts.ts' });
  assert.deepEqual(classifyImport('../react/index.js', 'auth-shared.tsx'), { kind: 'package', packageImport: 'cieo/react' });
  assert.deepEqual(classifyImport('./recorderVisual.js', 'VoiceRecorder/VoiceRecorder.tsx'), { kind: 'shared', file: 'VoiceRecorder/recorderVisual.ts' });
  assert.deepEqual(classifyImport('../../react/index.js'), { kind: 'package', packageImport: 'cieo/react' });
  assert.deepEqual(classifyImport('../../dom/scroll.js'), { kind: 'package', packageImport: 'cieo/dom' });
  assert.deepEqual(classifyImport('../../controls/Select.js'), { kind: 'package', packageImport: 'cieo/controls' });
  assert.deepEqual(classifyImport('../../data-grid/index.js'), { kind: 'package', packageImport: 'cieo/data-grid' });
  assert.throws(() => classifyImport('../../utils/thing.js'), /Unclassified import '\.\.\/\.\.\/utils\/thing\.js'/);
  assert.throws(() => classifyImport('somewhere-else'), /Unclassified bare import/);
});

test('scans import specifiers from source text', () => {
  const src = "import type { A } from 'react';\nimport { B } from '../motion.js';\nexport { C } from '../Overlay/Overlay.js';\n";
  assert.deepEqual(scanImportSpecifiers(src).sort(), ['../Overlay/Overlay.js', '../motion.js', 'react'].sort());
});

test('scans the real tree and finds the known edges', () => {
  const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
  const scan = scanRegistrySources(root);
  assert.ok(Object.keys(scan).length > 150, 'all primitives found');
  assert.deepEqual(scan.Dialog.registryDependencies, ['Overlay']);
  assert.ok(scan.Dialog.packageImports.includes('cieo/react'));
  assert.ok(scan.Dialog.sharedFiles.includes('motion.ts'));
  assert.ok(scan.AuthAccountCard.sharedFiles.includes('auth-shared.tsx'));
  assert.ok(scan.AuthSignInCard.sharedFiles.includes('auth-shared.tsx'));
  assert.deepEqual(scan.AuthAccountCard.registryDependencies, []);
  assert.ok(scan.VoiceRecorder.sharedFiles.includes('VoiceRecorder/recorderVisual.ts'));
  assert.deepEqual(scan.Avatar.registryDependencies, []);
});
