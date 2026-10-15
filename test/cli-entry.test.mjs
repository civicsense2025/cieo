import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { MARKER_BLOCK, entryFileFor, wireEntry } from '../cli/lib/entry.mjs';

const BLOCK_LF = `${MARKER_BLOCK}\n`;

function stubTree(entries) {
  const root = mkdtempSync(join(tmpdir(), 'cieo-entry-'));
  for (const [rel, content] of Object.entries(entries)) {
    const target = join(root, rel);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return root;
}

function withTree(entries, run) {
  const root = stubTree(entries);
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('entryFileFor picks the first existing candidate in order', () => {
  withTree({ 'app/layout.tsx': '', 'app/layout.jsx': '' }, (root) => {
    assert.equal(entryFileFor(root, 'next'), join(root, 'app', 'layout.tsx'));
  });
  withTree({ 'app/layout.jsx': '' }, (root) => {
    assert.equal(entryFileFor(root, 'next'), join(root, 'app', 'layout.jsx'));
  });
  withTree({ 'src/main.tsx': '', 'src/main.jsx': '', 'main.tsx': '' }, (root) => {
    assert.equal(entryFileFor(root, 'vite'), join(root, 'src', 'main.tsx'));
  });
  withTree({ 'src/main.jsx': '', 'main.tsx': '' }, (root) => {
    assert.equal(entryFileFor(root, 'vite'), join(root, 'src', 'main.jsx'));
  });
  withTree({ 'main.tsx': '' }, (root) => {
    assert.equal(entryFileFor(root, 'vite'), join(root, 'main.tsx'));
  });
  withTree({ 'app/layout.tsx': '' }, (root) => {
    assert.equal(entryFileFor(root, 'vite'), null);
  });
  withTree({ 'src/main.tsx': '' }, (root) => {
    assert.equal(entryFileFor(root, 'next'), null);
  });
  withTree({}, (root) => {
    assert.equal(entryFileFor(root, 'html'), null);
  });
});

test('wireEntry inserts the block after the last leading import', () => {
  const before =
    "import { createRoot } from 'react-dom/client';\n" +
    "import { App } from './App';\n" +
    '\n' +
    "createRoot(document.getElementById('root'));\n";
  withTree({ 'src/main.tsx': before }, (root) => {
    const result = wireEntry(root, 'vite');
    assert.equal(result.file, join(root, 'src', 'main.tsx'));
    assert.equal(result.changed, true);
    const after = readFileSync(result.file, 'utf8');
    const header =
      "import { createRoot } from 'react-dom/client';\n" +
      "import { App } from './App';\n";
    assert.equal(after, header + BLOCK_LF + "\ncreateRoot(document.getElementById('root'));\n");
  });
});

test("wireEntry places the block after the imports when 'use client' leads", () => {
  const before =
    "'use client';\n" +
    '\n' +
    "import Link from 'next/link';\n" +
    '\n' +
    'export default function Layout() {}\n';
  withTree({ 'app/layout.tsx': before }, (root) => {
    assert.equal(wireEntry(root, 'next').changed, true);
    const after = readFileSync(join(root, 'app', 'layout.tsx'), 'utf8');
    const header = "'use client';\n\nimport Link from 'next/link';\n";
    assert.equal(after, header + BLOCK_LF + '\nexport default function Layout() {}\n');
  });
});

test('wireEntry places the block after a lone directive with no imports', () => {
  const before = "'use client';\nexport default function Page() {}\n";
  withTree({ 'app/layout.jsx': before }, (root) => {
    assert.equal(wireEntry(root, 'next').changed, true);
    const after = readFileSync(join(root, 'app', 'layout.jsx'), 'utf8');
    assert.equal(after, "'use client';\n" + BLOCK_LF + 'export default function Page() {}\n');
  });
});

test('wireEntry lets comment lines precede the imports it anchors to', () => {
  const before = "// Copyright 2026\n/* license */\nimport A from 'a';\nconst x = 1;\n";
  withTree({ 'src/main.jsx': before }, (root) => {
    assert.equal(wireEntry(root, 'vite').changed, true);
    const after = readFileSync(join(root, 'src', 'main.jsx'), 'utf8');
    assert.equal(after, "// Copyright 2026\n/* license */\nimport A from 'a';\n" + BLOCK_LF + 'const x = 1;\n');
  });
});

test('wireEntry anchors after a multi-line import instead of splitting it', () => {
  const before = "import {\n  createRoot,\n} from 'react-dom/client';\ncreateRoot();\n";
  withTree({ 'src/main.tsx': before }, (root) => {
    assert.equal(wireEntry(root, 'vite').changed, true);
    const after = readFileSync(join(root, 'src', 'main.tsx'), 'utf8');
    const header = "import {\n  createRoot,\n} from 'react-dom/client';\n";
    assert.equal(after, header + BLOCK_LF + 'createRoot();\n');
  });
});

test('wireEntry puts the block at the very top when there are no imports', () => {
  const before = 'const answer = 42;\nconsole.log(answer);\n';
  withTree({ 'main.tsx': before }, (root) => {
    assert.equal(wireEntry(root, 'vite').changed, true);
    const after = readFileSync(join(root, 'main.tsx'), 'utf8');
    assert.equal(after, BLOCK_LF + before);
  });
});

test('wireEntry is byte-for-byte idempotent on a second run', () => {
  const before = "import { App } from './App';\n\nrender(App);\n";
  withTree({ 'src/main.tsx': before }, (root) => {
    const first = wireEntry(root, 'vite');
    assert.equal(first.changed, true);
    const wired = readFileSync(first.file, 'utf8');
    const second = wireEntry(root, 'vite');
    assert.equal(second.changed, false);
    assert.equal(readFileSync(second.file, 'utf8'), wired);
    const third = wireEntry(root, 'vite');
    assert.equal(third.changed, false);
    assert.equal(readFileSync(third.file, 'utf8'), wired);
  });
});

test('wireEntry replaces an outdated marker block with the current one', () => {
  const before =
    "import A from 'a';\n" +
    '/* cieo:start */\n' +
    "import 'cieo/tokens.css';\n" +
    '/* cieo:end */\n' +
    'const x = 1;\n';
  withTree({ 'src/main.tsx': before }, (root) => {
    assert.equal(wireEntry(root, 'vite').changed, true);
    const after = readFileSync(join(root, 'src', 'main.tsx'), 'utf8');
    assert.equal(after, "import A from 'a';\n" + BLOCK_LF + 'const x = 1;\n');
    assert.equal(wireEntry(root, 'vite').changed, false);
  });
});

test('wireEntry leaves CRLF files CRLF and untouched bytes identical', () => {
  const before = "import A from 'a';\r\nimport B from 'b';\r\n\r\nrender();\r\n";
  const crlfBlock = MARKER_BLOCK.replaceAll('\n', '\r\n');
  const headerEnd = before.indexOf('\n', before.indexOf('\n') + 1) + 1;
  const expected = before.slice(0, headerEnd) + crlfBlock + '\r\n' + before.slice(headerEnd);
  withTree({ 'src/main.tsx': before }, (root) => {
    assert.equal(wireEntry(root, 'vite').changed, true);
    const after = readFileSync(join(root, 'src', 'main.tsx'), 'utf8');
    assert.equal(after, expected);
    assert.equal(after.slice(0, headerEnd), before.slice(0, headerEnd));
    assert.equal(after.slice(headerEnd + crlfBlock.length + 2), before.slice(headerEnd));
    const inserted = after.slice(headerEnd, headerEnd + crlfBlock.length + 2);
    assert.doesNotMatch(inserted, /(?<!\r)\n/);
    assert.equal(wireEntry(root, 'vite').changed, false);
    assert.equal(readFileSync(join(root, 'src', 'main.tsx'), 'utf8'), expected);
  });
});

test('wireEntry refuses a stray start marker instead of deleting what follows it', () => {
  const before = "/* cieo:start */\nimport A from 'a';\nconst x = 1;";
  withTree({ 'src/main.tsx': before }, (root) => {
    const file = join(root, 'src', 'main.tsx');
    for (let attempt = 0; attempt < 2; attempt += 1) {
      assert.throws(
        () => wireEntry(root, 'vite'),
        (error) => {
          assert.ok(error instanceof Error);
          assert.match(error.message, /cieo:start/);
          assert.match(error.message, /cieo:end/);
          assert.ok(error.message.includes(file), `message must name ${file}`);
          assert.match(error.message, /fix or remove/);
          return true;
        },
      );
      assert.equal(readFileSync(file, 'utf8'), before);
      assert.deepEqual(readdirSync(join(root, 'src')), ['main.tsx']);
    }
  });
});

test('wireEntry ignores marker-looking text inside strings and longer comments', () => {
  const before =
    "import A from 'a';\n" +
    "const s = '/* cieo:start */';\n" +
    '// do not remove /* cieo:end */ here\n' +
    'render();\n';
  const header = "import A from 'a';\n";
  withTree({ 'src/main.tsx': before }, (root) => {
    assert.equal(wireEntry(root, 'vite').changed, true);
    const after = readFileSync(join(root, 'src', 'main.tsx'), 'utf8');
    assert.equal(after, header + BLOCK_LF + before.slice(header.length));
    assert.equal(wireEntry(root, 'vite').changed, false);
    assert.equal(readFileSync(join(root, 'src', 'main.tsx'), 'utf8'), after);
  });
});

test('wireEntry refuses an ambiguous file with a stray start after a real block', () => {
  const before =
    "import A from 'a';\n" +
    '/* cieo:start */\n' +
    "import 'cieo/tokens.css';\n" +
    '/* cieo:end */\n' +
    '/* cieo:start */\n' +
    'const x = 1;\n';
  const nested = '/* cieo:start */\n/* cieo:start */\n/* cieo:end */\n';
  withTree({ 'src/main.tsx': before }, (root) => {
    assert.throws(() => wireEntry(root, 'vite'), /cieo:end/);
    assert.equal(readFileSync(join(root, 'src', 'main.tsx'), 'utf8'), before);
  });
  withTree({ 'src/main.tsx': nested }, (root) => {
    assert.throws(() => wireEntry(root, 'vite'), /cieo:end/);
    assert.equal(readFileSync(join(root, 'src', 'main.tsx'), 'utf8'), nested);
  });
});

test('wireEntry names the paste-ready block when the entry file is missing', () => {
  withTree({ 'app/page.tsx': '' }, (root) => {
    assert.throws(
      () => wireEntry(root, 'next'),
      (error) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /app\/layout\.tsx or app\/layout\.jsx/);
        assert.match(error.message, /import 'cieo\/tokens\.css';/);
        assert.match(error.message, /import '\.\/cieo-theme\.css';/);
        return true;
      },
    );
  });
  withTree({}, (root) => {
    assert.throws(() => wireEntry(root, 'vite'), /src\/main\.tsx or src\/main\.jsx or main\.tsx/);
  });
  withTree({}, (root) => {
    assert.throws(() => wireEntry(root, 'html'), /Unknown target/);
  });
});
