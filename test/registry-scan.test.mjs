import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyImport, scanImportSpecifiers, scanRegistrySources } from '../scripts/lib/registry.mjs';

test('classifies each territory', () => {
  assert.deepEqual(classifyImport('react'), { kind: 'peer' });
  assert.deepEqual(classifyImport('react/jsx-runtime'), { kind: 'peer' });
  assert.deepEqual(classifyImport('../motion.js'), { kind: 'shared', file: 'motion.ts' });
  assert.deepEqual(classifyImport('../Overlay/Overlay.js'), { kind: 'sibling', dir: 'Overlay' });
  assert.deepEqual(classifyImport('../AuthSignInCard/AuthMotion.js', 'AuthAccountCard/AuthAccountCard.tsx'), { kind: 'shared', file: 'AuthSignInCard/AuthMotion.tsx' });
  assert.deepEqual(classifyImport('./AuthMotion.js', 'AuthSignInCard/AuthSignInCard.tsx'), { kind: 'shared', file: 'AuthSignInCard/AuthMotion.tsx' });
  assert.deepEqual(classifyImport('./recorderVisual.js', 'VoiceRecorder/VoiceRecorder.tsx'), { kind: 'shared', file: 'VoiceRecorder/recorderVisual.ts' });
  assert.deepEqual(classifyImport('../../react/index.js'), { kind: 'package', packageImport: 'cieo/react' });
  assert.deepEqual(classifyImport('../../dom/scroll.js'), { kind: 'package', packageImport: 'cieo/dom' });
  assert.deepEqual(classifyImport('../../controls/Select.js'), { kind: 'package', packageImport: 'cieo/controls' });
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
  assert.ok(scan.AuthAccountCard.sharedFiles.includes('AuthSignInCard/AuthMotion.tsx'));
  assert.ok(scan.AuthSignInCard.sharedFiles.includes('AuthSignInCard/AuthMotion.tsx'));
  assert.deepEqual(scan.AuthAccountCard.registryDependencies, []);
  assert.ok(scan.VoiceRecorder.sharedFiles.includes('VoiceRecorder/recorderVisual.ts'));
  assert.deepEqual(scan.Avatar.registryDependencies, []);
});
