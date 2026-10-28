import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertNoPackageTerritoryImports, rewriteImports } from '../cli/lib/rewrite.mjs';
import { classifyImport, scanImportSpecifiers, scanRegistrySources } from '../scripts/lib/registry.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

const REWRITES = [
  {
    name: 'shared file loses its extension',
    source: "import { motionAttrs } from '../motion.js';\n",
    expected: "import { motionAttrs } from '../motion';\n",
  },
  {
    name: 'sibling keeps its folder shape and loses its extension',
    source: "import { Overlay } from '../Overlay/Overlay.js';\n",
    expected: "import { Overlay } from '../Overlay/Overlay';\n",
  },
  {
    name: 'AuthMotion sibling helper keeps its path and loses its extension',
    source: "import { AuthMotionMessage } from '../AuthSignInCard/AuthMotion.js';\n",
    fromFile: 'AuthAccountCard/AuthAccountCard.tsx',
    expected: "import { AuthMotionMessage } from '../AuthSignInCard/AuthMotion';\n",
  },
  {
    name: 'AuthMotion same-folder helper maps to the same registry file',
    source: "import { AuthMotionMessage } from './AuthMotion.js';\n",
    fromFile: 'AuthSignInCard/AuthSignInCard.tsx',
    expected: "import { AuthMotionMessage } from './AuthMotion';\n",
  },
  {
    name: 'VoiceRecorder same-folder helper is treated as shared',
    source: "import { recorderVisual } from './recorderVisual.js';\n",
    fromFile: 'VoiceRecorder/VoiceRecorder.tsx',
    expected: "import { recorderVisual } from './recorderVisual';\n",
  },
  {
    name: 'type-only relative import loses its extension',
    source: "import type { MotionProps } from '../motion.js';\n",
    expected: "import type { MotionProps } from '../motion';\n",
  },
  {
    name: 'type-only package import crosses the boundary',
    source: "import type { ReactNode } from '../../react/index.js';\n",
    expected: "import type { ReactNode } from 'cieo/react';\n",
  },
  {
    name: 'export-from loses its extension',
    source: "export { parse } from '../motion.js';\n",
    expected: "export { parse } from '../motion';\n",
  },
  {
    name: 'type-only export-from loses its extension',
    source: "export type { MotionProps } from '../motion.js';\n",
    expected: "export type { MotionProps } from '../motion';\n",
  },
  {
    name: 'multi-line import loses its extension',
    source: "import {\n  motionAttrs,\n  type MotionProps,\n} from '../motion.js';\n",
    expected: "import {\n  motionAttrs,\n  type MotionProps,\n} from '../motion';\n",
  },
  {
    name: 'side-effect import loses its extension',
    source: "import '../motion.js';\n",
    expected: "import '../motion';\n",
  },
  {
    name: 'react package import maps to the subpath',
    source: "import { usePresence } from '../../react/index.js';\n",
    expected: "import { usePresence } from 'cieo/react';\n",
  },
  {
    name: 'dom package import maps to the subpath',
    source: "import { scrollIntoView } from '../../dom/scroll.js';\n",
    expected: "import { scrollIntoView } from 'cieo/dom';\n",
  },
  {
    name: 'live package import maps to the subpath',
    source: "import { spring } from '../../live/spring.js';\n",
    expected: "import { spring } from 'cieo/live';\n",
  },
  {
    name: 'controls package import maps to the subpath',
    source: "import { Select } from '../../controls/Select.js';\n",
    expected: "import { Select } from 'cieo/controls';\n",
  },
  {
    name: 'design package import maps to the subpath',
    source: "import { tokens } from '../../design/tokens.js';\n",
    expected: "import { tokens } from 'cieo/design';\n",
  },
  {
    name: 'core package import maps to the root package',
    source: "import { spring } from '../../core/spring.js';\n",
    expected: "import { spring } from 'cieo';\n",
  },
  {
    name: 'bare react imports stay untouched',
    source: "import { useState } from 'react';\nimport { jsx } from 'react/jsx-runtime';\n",
    expected: "import { useState } from 'react';\nimport { jsx } from 'react/jsx-runtime';\n",
  },
];

for (const { name, source, expected, fromFile = 'Test/Test.tsx' } of REWRITES) {
  test(`rewriteImports: ${name}`, () => {
    assert.equal(rewriteImports(source, fromFile), expected);
  });
}

test('rewriteImports preserves everything except specifiers, byte for byte', () => {
  const source = [
    "'use client';",
    '/* Dialog. Controlled modal panel over a scrim. */',
    '// Sibling import of Overlay; see ../Overlay/Overlay.js for the scrim.',
    "import type { KeyboardEvent, ReactNode } from 'react';",
    "import { usePresence } from '../../react/index.js';",
    "import { Overlay } from '../Overlay/Overlay.js';",
    "import { motionAttrs, type MotionProps } from '../motion.js';",
    'export interface DialogProps extends MotionProps { label: string }',
    '',
  ].join('\n');
  const expected = source
    .replace("'../../react/index.js'", "'cieo/react'")
    .replace("'../Overlay/Overlay.js'", "'../Overlay/Overlay'")
    .replace("'../motion.js'", "'../motion'");
  assert.equal(rewriteImports(source, 'Dialog/Dialog.tsx'), expected);
});

test('the shared rule is shape-based: import-shaped comment text is treated as an import', () => {
  const source = "// import { a } from '../motion.js';\n";
  assert.equal(rewriteImports(source, 'Styled/Styled.tsx'), "// import { a } from '../motion';\n");
});

test('unclassified relative imports fail loudly, naming the file and the specifier', () => {
  assert.throws(
    () => rewriteImports("import { x } from '../../utils/x.js';\n", 'Weird/Weird.tsx'),
    (error) =>
      error instanceof Error &&
      error.message.includes("'../../utils/x.js'") &&
      error.message.includes('Weird/Weird.tsx'),
  );
  assert.throws(
    () => rewriteImports("import { x } from './local.js';\n", 'Weird/Weird.tsx'),
    (error) => error instanceof Error && error.message.includes("'./local.js'") && error.message.includes('Weird/Weird.tsx'),
  );
  assert.throws(
    () => rewriteImports("import { x } from '../../../core/spring.js';\n", 'Weird/Weird.tsx'),
    (error) =>
      error instanceof Error &&
      error.message.includes("'../../../core/spring.js'") &&
      error.message.includes('Weird/Weird.tsx'),
  );
});

test('the post-copy guard passes a rewritten Dialog and fails the registry original', () => {
  const original = readFileSync(join(root, 'src/primitives/Dialog/Dialog.tsx'), 'utf8');
  const rewritten = rewriteImports(original, 'Dialog/Dialog.tsx');
  assert.doesNotThrow(() => assertNoPackageTerritoryImports(rewritten, 'Dialog/Dialog.tsx'));
  assert.throws(
    () => assertNoPackageTerritoryImports(original, 'Dialog/Dialog.tsx'),
    (error) =>
      error instanceof Error &&
      error.message.includes('../parts.js') &&
      error.message.includes('Dialog/Dialog.tsx'),
  );
});

test('the post-copy guard rejects leftover package specifiers and .js relatives', () => {
  assert.throws(
    () => assertNoPackageTerritoryImports("import { x } from '../../utils/thing';\n", 'A/A.tsx'),
    /\.\.\/\.\.\/utils\/thing/,
  );
  assert.throws(
    () => assertNoPackageTerritoryImports("import { x } from '../motion.js';\n", 'A/A.tsx'),
    /\.\.\/motion\.js/,
  );
  assert.throws(
    () => assertNoPackageTerritoryImports("import '../motion.js';\n", 'A/A.tsx'),
    /\.\.\/motion\.js/,
  );
  assert.doesNotThrow(() =>
    assertNoPackageTerritoryImports("import { x } from '../motion';\nimport { y } from 'cieo/react';\n", 'A/A.tsx'),
  );
});

test('every real primitive rewrites exactly as the classifier table says', () => {
  const primDir = join(root, 'src/primitives');
  const dirs = readdirSync(primDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  assert.ok(dirs.length > 150, `expected the full primitive inventory, found ${dirs.length} directories`);
  const seen = { package: 0, sibling: 0, shared: 0, peer: 0 };
  for (const dir of dirs) {
    const rel = `${dir}/${dir}.tsx`;
    const source = readFileSync(join(primDir, rel), 'utf8');
    const output = rewriteImports(source, rel);
    let expected = source;
    for (const spec of scanImportSpecifiers(source)) {
      const classified = classifyImport(spec, rel);
      const next =
        classified.kind === 'peer'
          ? spec
          : classified.kind === 'package'
            ? classified.packageImport
            : spec.slice(0, -'.js'.length);
      seen[classified.kind] += 1;
      expected = expected.split(`'${spec}'`).join(`'${next}'`);
    }
    assert.equal(output, expected, `${rel} must rewrite exactly the classified specifiers and nothing else`);
    const rewritten = scanImportSpecifiers(output);
    assert.equal(rewritten.some((spec) => spec.startsWith('../../')), false, `${rel} still crosses into package territory`);
    assert.equal(
      rewritten.some((spec) => spec.startsWith('.') && spec.endsWith('.js')),
      false,
      `${rel} keeps a relative specifier ending in .js`,
    );
    assert.doesNotThrow(() => assertNoPackageTerritoryImports(output, rel));
  }
  const scan = scanRegistrySources(root);
  const sharedFiles = [...new Set(Object.values(scan).flatMap((component) => component.sharedFiles))].sort();
  assert.ok(sharedFiles.includes('AuthSignInCard/AuthMotion.tsx'));
  assert.ok(sharedFiles.includes('VoiceRecorder/recorderVisual.ts'));
  for (const rel of sharedFiles) {
    const source = readFileSync(join(primDir, rel), 'utf8');
    const output = rewriteImports(source, rel);
    assert.doesNotThrow(() => assertNoPackageTerritoryImports(output, rel));
    assert.equal(
      scanImportSpecifiers(output).some((spec) => spec.startsWith('.') && spec.endsWith('.js')),
      false,
      `${rel} keeps a relative specifier ending in .js`,
    );
  }
  assert.ok(seen.package > 0 && seen.sibling > 0 && seen.shared > 0, 'the sweep must exercise every territory');
});
