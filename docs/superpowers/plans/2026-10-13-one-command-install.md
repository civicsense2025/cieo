# One-Command Install Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Cieo publicly installable with one command (`npx cieo init` leaving a working themed component; `npx cieo add <id>` thereafter), through a bundled source registry, a zero-dependency CLI, and a GitHub Pages docs site.

**Architecture:** One npm package (`cieo`) gains a zero-dependency `bin/cieo.mjs` CLI and a generated, committed `registry/` built from `src/primitives/`. Primitives are source-copied into consumer projects with only package-boundary imports rewritten to `cieo/*` subpaths. Everything else (motion engine, design foundation, controls, atoms, Swift) is untouched.

**Tech Stack:** Node ≥ 20 (built-ins only for the CLI), TypeScript for primitives, `node --test` for tests, GitHub Actions (SHA-pinned) for CI/Pages/release.

**Spec:** `docs/superpowers/specs/2026-10-13-one-command-install-design.md`

## Global Constraints

- CLI runtime deps: zero. Node built-ins only. `engines: { "node": ">=20" }`.
- Registry is generated and committed; `node scripts/build-registry.mjs --check` + `git diff --exit-code -- registry` must pass in `npm run check`.
- Unclassified import edges fail generation loudly. Never guess.
- Copying preserves directory shape. Relative imports (sibling `../Overlay/Overlay.js`, shared `../motion.js`) are rewritten to **extensionless** form (`../Overlay/Overlay`, `../motion`) — Vite does not resolve `.js`→`.tsx`, and extensionless works in Vite, Next, and `moduleResolution: bundler` TS. Package-territory imports map to bare subpaths: `react`→`cieo/react`, `dom`→`cieo/dom`, `live`→`cieo/live`, `controls`→`cieo/controls`, `design`→`cieo/design`, `core`→`cieo`.
- Do not touch: `src/core|dom|react|live|controls`, `design/`, `tokens/`, `atoms/`, `Sources/`, `Tests/`, `Package.swift`, `dist/` semantics.
- `npm run check` stays green at every commit; Actions pinned by full commit SHA with a `# vN` comment.
- Commits: pathspec only (`git commit -m "..." -- <paths>`), message format `<Audience>: <what changed for whom>`.
- Test globs: top-level `test/*.test.mjs` is what `npm test` runs; name new tests `test/cli-*.test.mjs` / `test/registry-*.test.mjs`. E2E lives in `test/cli/` and runs via `npm run test:cli`.
- Errors always state cause + the exact fix command. Non-TTY runs never prompt and never hang.

## Review Focus

Five input classes the spec implies but no single task's happy path exercises; each has a test in the owning task:

1. Destination files already exist when copying (pre-existing `components/cieo/...`, user edits) — overwrite protection and no-clobber behavior (Task 7, Task 10, E2E no-op).
2. Non-TTY / CI / agent invocation — prompts fall back to defaults, exits are deterministic (Task 9 prompt tests, Task 10 `--yes`).
3. JS-only or non-React projects — clear error for primitives; `--target html` must never offer components (Task 9, Task 10).
4. Re-running `init`/`add` after manual edits — idempotent wiring, update offer, never silently clobber (Task 10, E2E second-run byte-for-byte no-op).
5. Unusual entry files — no imports, `'use client'` first line, CRLF line endings, missing `app/layout.tsx` / `src/main.tsx` — must fail loud with a paste-ready snippet (Task 9).

## File Map

| Path | Responsibility |
| --- | --- |
| `scripts/lib/registry.mjs` | Import scanner + edge classifier (single source of truth for both generator and tests) |
| `scripts/build-registry.mjs` | Generator: writes `registry/`, syncs manifest `dependencies`, `--check` mode |
| `registry/index.json` + `registry/**` | Generated, committed, shipped source copies |
| `bin/cieo.mjs` | CLI router, `--help`, `--version`, exit codes |
| `cli/lib/args.mjs` | Tiny flag parser |
| `cli/lib/paths.mjs` | `packageRoot()`, `registryDir()`, root discovery from cwd |
| `cli/lib/config.mjs` | Read/validate/write `cieo.json` |
| `cli/lib/registry.mjs` | Load registry, resolve ids (+suggestions), transitive plan |
| `cli/lib/rewrite.mjs` | Import rewriting for copied files |
| `cli/lib/copy.mjs` | Plan execution: compare/prompt/write/dry-run |
| `cli/lib/detect.mjs` | Target + package manager detection |
| `cli/lib/prompt.mjs` | TTY-aware ask/choose/confirm with defaults |
| `cli/lib/entry.mjs` | Marker-block wiring of `app/layout.tsx` / `src/main.tsx`, HTML snippet |
| `cli/lib/theme.mjs` | `createTheme`+`toCSS` wrapper, theme file location per target |
| `cli/commands/{init,add,list,diff,theme,doctor}.mjs` | One command each |
| `test/registry-scan.test.mjs`, `test/registry-build.test.mjs` | Generator unit tests |
| `test/cli-{args,config,resolve,rewrite,add,theme-doctor,detect-entry,init}.test.mjs` | CLI unit/integration tests |
| `test/cli/fixtures/{next-app,vite-react,static-html}/` | Committed fixture apps |
| `test/cli/e2e.mjs` | Tarball-only end-to-end script |
| `scripts/check-site-links.mjs` | Pages artifact link checker |
| `.github/workflows/pages.yml`, `.github/workflows/release.yml` | Deploy + publish |
| `scripts/build-component-pages.mjs` | Footer line becomes `npx cieo add <Name>` |
| `docs/installation.md`, `docs/cli.md`, `docs/releasing.md` | User + operator docs |
| `docs/source-map.json` | New `install-and-cli` module ownership |
| `LICENSE`, `README.md`, `CONTRIBUTING.md`, `package.json` | Public release readiness |

Uncommitted files from other sessions exist in this checkout (`README.md`, `Sources/**`, `docs/design-system.md`, `src/controls/**`). Never stage files you did not change in this plan; always commit with explicit pathspecs.

---

### Task 0: Adversarial plan check (read-only)

**Files:** none modified. Report: `.superpowers/sdd/one-command-install/plan-check.md`

**Interfaces:**
- Consumes: this plan, the spec, the working tree.
- Produces: a mismatch list (`claim → reality → severity`) that the coordinator folds back into the plan before any builder launches.

- [ ] **Step 1: Dispatch a fresh read-only agent** with only: the spec, this plan, and these instructions: verify every `Files:` path and every interface signature against the actual repo; run `/bin/echo` style existence checks:
  `test -f bin/cieo.mjs` (expected absent), `test -d src/primitives`, `node -e "import('./design/index.js').then(m=>console.log(typeof m.createTheme, typeof m.toCSS))"`, `grep -n "data-install" scripts/build-component-pages.mjs`, `ls test/browser | head`, `sed -n '1,20p' scripts/check-documentation.rb`, confirm `schemas/` is absent, confirm `registry/` absent, confirm `cli/` absent, confirm `test/cli/` absent.
- [ ] **Step 2: Verify the import-edge inventory** reproduces: `grep -rhoE "from '(\.\./)+[^']+'" src/primitives/*/*.tsx | grep -vE "from '\.\./[A-Z][^/]*/[^']+'$" | sort | uniq -c` must show exactly the 8 package-territory edges + 6 `../motion.js` (counts may drift if primitives changed since 2026-10-13 — recount and record).
- [ ] **Step 3: Write the report** with concrete findings; anything claiming a file exists that does not (or vice versa) is a plan bug. Commit: `git add .superpowers/sdd/one-command-install/plan-check.md && git commit -m "Dev: Adversarial check of the one-command install plan against the tree." -- .superpowers/sdd/one-command-install/plan-check.md`

---

## Phase 1 — Registry (Lane R)

### Task 1: Import scanner + edge classifier

**Files:**
- Create: `scripts/lib/registry.mjs`
- Test: `test/registry-scan.test.mjs`

**Interfaces:**
- Produces:
  - `classifyImport(spec: string): { kind: 'peer' } | { kind: 'shared', file: string } | { kind: 'sibling', dir: string } | { kind: 'package', packageImport: string }` — throws `Error` with the offending specifier for anything else.
  - `scanImportSpecifiers(source: string): string[]`
  - `scanRegistrySources(root: string): Record<string, { files: string[], registryDependencies: string[], packageImports: string[], sharedFiles: string[] }>` — sorted keys and sorted arrays; throws if a sibling directory has no `<dir>/<dir>.tsx`.

- [ ] **Step 1: Write the failing test** — `test/registry-scan.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyImport, scanImportSpecifiers, scanRegistrySources } from '../scripts/lib/registry.mjs';

test('classifies each territory', () => {
  assert.deepEqual(classifyImport('react'), { kind: 'peer' });
  assert.deepEqual(classifyImport('react/jsx-runtime'), { kind: 'peer' });
  assert.deepEqual(classifyImport('../motion.js'), { kind: 'shared', file: 'motion.ts' });
  assert.deepEqual(classifyImport('../Overlay/Overlay.js'), { kind: 'sibling', dir: 'Overlay' });
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
  assert.deepEqual(scan.Avatar.registryDependencies, []);
});
```

- [ ] **Step 2: Run it to verify it fails** — `node --test test/registry-scan.test.mjs` → FAIL (module not found).
- [ ] **Step 3: Implement** — `scripts/lib/registry.mjs`:

```js
import { readdirSync, readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';

const PACKAGE_AREAS = { react: 'cieo/react', dom: 'cieo/dom', live: 'cieo/live', controls: 'cieo/controls', design: 'cieo/design', core: 'cieo' };

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
```

- [ ] **Step 4: Run** — `node --test test/registry-scan.test.mjs` → PASS. If `scan.Dialog.registryDependencies` differs, read `grep -rhoE "from '\.\./[^']+'" src/primitives/Dialog/*.tsx` and fix the test expectation to reality (never the reverse); record it in the plan-check report.
- [ ] **Step 5: Commit** — `git add scripts/lib/registry.mjs test/registry-scan.test.mjs && git commit -m "Dev: A scanner that classifies every primitive import edge, refusing to guess." -- scripts/lib/registry.mjs test/registry-scan.test.mjs`

### Task 2: Registry generator, manifest sync, parity gate

**Files:**
- Create: `scripts/build-registry.mjs`
- Modify: `package.json` (add `bin/`, `cli/`, `registry/` to `files[]`; add registry check to `check`; add `test:cli` script — single name, no `test:cli:e2e`; `engines`; remove `private`; `license`; version `0.4.0` — package.json is single-writer in this lane, and the existing `"bin": { "cieo-theme": ... }` key must be preserved when Task 3 extends it)
- Modify: `src/primitives/*/manifest.json` (generator-synced `dependencies`; initially ~N files change)
- Create (generated): `registry/index.json`, `registry/<Name>/<Name>.tsx`, `registry/motion.ts`
- Test: `test/registry-build.test.mjs`

**Interfaces:**
- Consumes: `scanRegistrySources` from Task 1.
- Produces: `registry/index.json` shape `{ "schemaVersion": 1, "shared": ["motion.ts"], "components": { "<Name>": { files, registryDependencies, packageImports, sharedFiles } } }`; `buildRegistry(root): { index, written }`; `--check` compares generated output to disk and exits 1 on any difference (including manifest `dependencies`).

- [ ] **Step 1: Write the failing test** — `test/registry-build.test.mjs` asserts, after running the generator into a tmp copy of a miniature fake tree (2 components, one shared file, one sibling edge): copied `.tsx` contents are byte-identical to source; `index.json` is deterministic across two runs; a manifest whose `dependencies` disagrees with the scan fails `--check`; a tampered `registry/Dialog/Dialog.tsx` fails `--check`. Use `fs.cpSync` into `mkdtempSync` for isolation. Include a real-tree assertion: `buildRegistry(realRoot)` in check mode on the actual repo reports clean after generation.
- [ ] **Step 2: Run** — `node --test test/registry-build.test.mjs` → FAIL.
- [ ] **Step 3: Implement `scripts/build-registry.mjs`** with: `--check` flag; JSON output `JSON.stringify(value, null, 2) + '\n'`; mkdir+copy for `registry/<file>` (only `files` + `sharedFiles`, never `manifest.json`/`README.md`); manifest sync writes `dependencies = registryDependencies` (stable order, keep every other field untouched, indent 2, trailing newline); `--check` prints a per-path report and `process.exitCode = 1` on diff. No timestamps anywhere.
- [ ] **Step 4: Run generator for real** — `node scripts/build-registry.mjs && node scripts/build-registry.mjs --check` → clean second run. Inspect `registry/Dialog/` + `registry/index.json` by eye; commit them.
- [ ] **Step 5: Wire gates** — `package.json`: `"check"` gains `&& node scripts/build-registry.mjs --check && git diff --exit-code -- registry src/primitives` (before the existing final `git diff` step, or merged into it); scripts `"test:cli": "node test/cli/e2e.mjs"`, `"test:cli:e2e": "node test/cli/e2e.mjs"` is NOT needed — `test:cli` is the single name; `check` appends `&& npm run test:cli` LAST. Temporary measure until Task 12 lands fixtures: create `test/cli/e2e.mjs` as a stub that exits 0 with `console.log('e2e pending fixtures')`. This keeps `npm run check` runnable per-commit.
- [ ] **Step 6: Run** — `node --test test/registry-build.test.mjs && npm run check` → PASS (Swift untouched).
- [ ] **Step 7: Commit** — `git add scripts/build-registry.mjs test/registry-build.test.mjs test/cli/e2e.mjs registry package.json src/primitives && git commit -m "Dev: The registry is generated from source, and manifests can no longer lie." -- scripts/build-registry.mjs test/registry-build.test.mjs test/cli/e2e.mjs registry package.json src/primitives`

---

## Phase 2 — CLI core (Lane C, after Lane R)

### Task 3: Router, args, paths

**Files:**
- Create: `bin/cieo.mjs`, `cli/lib/args.mjs`, `cli/lib/paths.mjs`
- Test: `test/cli-args.test.mjs`

**Interfaces:**
- Produces: `parseArgs(argv: string[], spec: Record<string, 'boolean'|'value'>): { flags: Record<string, string|true>, positionals: string[] }` (unknown flag → throws `UsageError`); `packageRoot(): string` (from `import.meta.url`, the dir containing `package.json` + `registry/`); `projectRoot(): string` (`process.cwd()`); router dispatch table with commands `init add list diff theme doctor`; `cieo --version` prints `package.json` version; `cieo --help` lists commands and per-command usage from a `USAGE` map each command module exports; unknown command → exit 2.
- Consumes (later tasks import this shape): each `cli/commands/<name>.mjs` default-exports `async run(rest: string[]): Promise<number>` and exports `USAGE: string`.

- [ ] **Step 1: Failing test** — `test/cli-args.test.mjs`: `parseArgs` happy paths + unknown flag throws + `--` passthrough; spawn `node bin/cieo.mjs --version` and assert it equals `package.json` version; `--help` exits 0 and contains `init`; `node bin/cieo.mjs wat` exits 2 and prints `Unknown command`.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** the three files. Router reads commands lazily (`await import(\`../cli/commands/${cmd}.mjs\`)`) so `--help`/`--version` never touch command code. `#!/usr/bin/env node` first line; `chmod +x bin/cieo.mjs`; add `"bin": { "cieo": "bin/cieo.mjs", "cieo-theme": "scripts/export-theme.mjs" }` in Task 2's package.json edit? No — package.json `bin` edit belongs to this task: extend it here (second package.json writer — sequential lanes make this safe; do it in this task's commit).
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** — `git add bin/cieo.mjs cli/lib/args.mjs cli/lib/paths.mjs test/cli-args.test.mjs package.json && git commit -m "Dev: The cieo CLI exists and answers --help honestly." -- bin/cieo.mjs cli/lib/args.mjs cli/lib/paths.mjs test/cli-args.test.mjs package.json`

### Task 4: Config read/validate/write

**Files:**
- Create: `cli/lib/config.mjs`
- Test: `test/cli-config.test.mjs`

**Interfaces:**
- Produces: `CONFIG_NAME = 'cieo.json'`; `readConfig(root): { path, config } | null`; `validateConfig(config): Config` (throws `Error` with actionable text); `writeConfig(root, config): void` (stable key order: version, target, componentsDir, alias, theme; 2-space indent + trailing newline). `Config = { version: 1, target: 'next'|'vite'|'html', componentsDir: string, alias?: string, theme: object }`. Theme validity delegates to `createTheme` from `../../design/index.js` (depth-2 relative from `cli/lib/`, unlike `scripts/export-theme.mjs` which sits at depth 1 — verified; `cieo/design` self-reference would also work but the relative path keeps the CLI dependency-free of package resolution).
- Consumes: design `createTheme`.

- [ ] **Step 1: Failing test** — roundtrip; missing file → null; `version: 2`, bad target, absolute `componentsDir`, `..` traversal, `componentsDir: ''`, invalid brand → each throws with the field named; partial theme (`{ brand: 'lagoon' }`) is valid.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement. Step 4:** PASS.
- [ ] **Step 5: Commit** — `git add cli/lib/config.mjs test/cli-config.test.mjs && git commit -m "Dev: cieo.json has one validated shape, checked before anything writes." -- cli/lib/config.mjs test/cli-config.test.mjs`

### Task 5: Registry load, id resolution, transitive plan

**Files:**
- Create: `cli/lib/registry.mjs`
- Test: `test/cli-resolve.test.mjs`

**Interfaces:**
- Produces: `loadRegistry(): Registry` (always from `packageRoot()/registry/index.json` — the CLI's own bundled copy, version-aligned by construction); `resolveId(registry, input): { id } | { suggestions: string[] }` (case-insensitive exact; else prefix matches + Levenshtein ≤ 2, sorted, capped at 5); `plan(registry, id): { id, files: string[], sharedFiles: string[] }` (DFS over `registryDependencies`, stable order, dedup; `motion.ts` included once); `packageImportsFor(registry, id): string[]`.
- Consumes: Task 1 output shape.

- [ ] **Step 1: Failing test** — with a stub registry literal: `dialog`→`Dialog`, `DIALOG`→`Dialog`, `diolog`→suggestions contains `Dialog` (and not 5 unrelated ids), unknown garbage → empty suggestions; transitive plan for `[A→B→C]` returns all three files once even with diamond deps; loading the real bundled `registry/index.json` works and resolves `Dialog`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement. Step 4:** PASS.
- [ ] **Step 5: Commit** — `git add cli/lib/registry.mjs test/cli-resolve.test.mjs && git commit -m "Dev: Component ids resolve case-insensitively and typos get suggestions." -- cli/lib/registry.mjs test/cli-resolve.test.mjs`

### Task 6: Import rewriting

**Files:**
- Create: `cli/lib/rewrite.mjs`
- Test: `test/cli-rewrite.test.mjs`

**Interfaces:**
- Produces: `rewriteImports(source: string, fromFile: string): string`; `assertNoPackageTerritoryImports(source: string, fromFile: string): void` (post-copy guard used by `add` and E2E to prove zero `../../` remain).

- [ ] **Step 1: Failing test** — table-driven: every edge from `classifyImport` incl. `import type` forms and multi-line imports; `../motion.js` → `../motion`, `../Overlay/Overlay.js` → `../Overlay/Overlay` (extension stripped, folder shape kept); unclassified `../../utils/x.js` throws naming file + specifier; `assertNoPackageTerritoryImports` passes on rewritten Dialog source and fails on the original; a real-tree sweep asserts every `src/primitives/*/*.tsx` rewritten output contains zero `../../` and every relative import is extensionless.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** (regex over `from '<spec>'` where spec starts with `../`, mirroring the classifier's rules — same table, and a test asserts the two tables agree for every real primitive file).
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Commit** — `git add cli/lib/rewrite.mjs test/cli-rewrite.test.mjs && git commit -m "Dev: Copied components keep their shape, drop extensions Vite cannot resolve, and cross the package boundary only deliberately." -- cli/lib/rewrite.mjs test/cli-rewrite.test.mjs`

### Task 7: `add`, `list`, `diff` commands

**Files:**
- Create: `cli/lib/copy.mjs`, `cli/commands/add.mjs`, `cli/commands/list.mjs`, `cli/commands/diff.mjs`
- Test: `test/cli-add.test.mjs`

**Interfaces:**
- Produces: `copyPlan({ root, config, id, overwrite, dryRun, prompt }): Promise<{ copied: string[], skipped: string[], unchanged: string[], conflicts: string[] }>` — every destination under `join(root, config.componentsDir)/<rel>`; equal content → `unchanged`; differing file without `--overwrite`: TTY → ask overwrite/skip/diff, non-TTY → `skipped` + notice; `dryRun` → report only. After copying, warn (not fail) when the installed `cieo` version differs from the CLI's own. Commands: `add <id> [--dry-run] [--overwrite] [--yes]`, `list`, `diff <id>`; `add` refuses with the exact init command when `cieo.json` is missing, and refuses with "components need a React project (target next/vite)" when `config.target === 'html'`.
- Consumes: Tasks 4–6.

- [ ] **Step 1: Failing tests** (spawn CLI with `cwd` = tmp project): (a) no config → stderr contains `npx cieo init`, exit 1; (b) happy add copies `Dialog/Dialog.tsx`, `Overlay/Overlay.tsx`, `motion.ts`, rewritten, `assertNoPackageTerritoryImports` clean, exit 0; (c) second run → all `unchanged`, zero writes (mtime check); (d) user-edited file → non-TTY skip + notice; with `--overwrite` → overwritten; (e) `--dry-run` touches nothing; (f) `list` shows `✓` for copied; (g) `diff` on edited file exits 1 and prints `-/+` lines; on identical exits 0; (h) `cieo.json` with `target: "html"` → exit 1, message contains `components need a React project`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement. Step 4:** PASS.
- [ ] **Step 5: Commit** — `git add cli/lib/copy.mjs cli/commands/add.mjs cli/commands/list.mjs cli/commands/diff.mjs test/cli-add.test.mjs && git commit -m "Users: npx cieo add brings a component in without ever overwriting your edits." -- cli/lib/copy.mjs cli/commands/add.mjs cli/commands/list.mjs cli/commands/diff.mjs test/cli-add.test.mjs`

### Task 8: `theme` and `doctor`

**Files:**
- Create: `cli/lib/theme.mjs`, `cli/commands/theme.mjs`, `cli/commands/doctor.mjs`
- Test: `test/cli-theme-doctor.test.mjs`

**Interfaces:**
- Produces: `themeFileFor(root, target)` → `app/cieo-theme.css` (next) | `src/cieo-theme.css` (vite) | `cieo-theme.css` (html); `writeThemeFile(root, target, theme): { file, css }` using `toCSS(createTheme(theme))`; `verifyThemeFile(root, target, theme): boolean` (used by doctor; compares regenerated output). `theme key=value...` validates each pair against `createTheme` axes (unknown key → error listing valid keys), updates `cieo.json`, regenerates the file, `--print` prints CSS only. `doctor`: checks (1 config valid, (2) `cieo` installed under `node_modules/cieo` and `package.json` version equals CLI `package.json` version — mismatch = fail with both versions, (3) entry wiring present for target next/vite (html skips with note), (4) every copied component file exists and matches registry (user-modified → warn with count, missing → fail), (5) tsconfig alias resolves when `alias` set; exit 1 if any fail, print `cause → fix` lines; `--json` prints machine-readable results.
- Consumes: Tasks 4–7, design `createTheme`/`toCSS`.

- [ ] **Step 1: Failing tests** — theme: updates config + file, unknown key error lists `brand, scheme, density, radius`, `--print` writes nothing; doctor on a broken tmp project returns exit 1 with each failing check named, on a healthy one (fixture-like tmp tree) exit 0 with warnings only for a user-modified file.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement. Step 4:** PASS.
- [ ] **Step 5: Commit** — `git add cli/lib/theme.mjs cli/commands/theme.mjs cli/commands/doctor.mjs test/cli-theme-doctor.test.mjs && git commit -m "Users: npx cieo doctor says exactly what is broken and how to fix it." -- cli/lib/theme.mjs cli/commands/theme.mjs cli/commands/doctor.mjs test/cli-theme-doctor.test.mjs`

---

## Phase 3 — Init (Lane I, after Lane C)

### Task 9: Detection, prompts, entry wiring

**Files:**
- Create: `cli/lib/detect.mjs`, `cli/lib/prompt.mjs`, `cli/lib/entry.mjs`
- Test: `test/cli-detect-entry.test.mjs`

**Interfaces:**
- Produces: `detectTarget(root): 'next'|'vite'|null` (next: `next.config.{js,mjs,ts}` + `app/` dir; vite: `vite.config.{js,mjs,ts}` + react in deps); `detectPackageManager(root): 'npm'|'pnpm'|'yarn'|'bun'`; `readPackageJson(root): object | null`; `hasReact(root): boolean`. Prompt: `createPrompt({ input, output })` → `{ tty: boolean, ask(q, { default }), choose(q, options, { default: i }), confirm(q, { default }) }`; non-TTY (or `CI` env, or `--yes`) returns defaults without writing a prompt. Entry: `entryFileFor(root, target): string | null`; `wireEntry(root, target): { file, changed }` inserting/replacing the marker block `/* cieo:start */ … /* cieo:end */` with the four CSS imports; missing entry file → `Error` whose message includes the paste-ready block.
- Consumes: Tasks 3–4.

- [ ] **Step 1: Failing tests** — detection matrix (stub trees); prompt non-TTY returns defaults, TTY path exercised via a `PassThrough` stream pair; entry wiring: plain file, `'use client'` first line, existing marker block (idempotent: second run `changed: false` byte-for-byte), no imports at all (block at top), CRLF file (EOL preserved everywhere except the inserted block uses file EOL), missing `app/layout.tsx` → message contains `import 'cieo/tokens.css';`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement. Step 4:** PASS.
- [ ] **Step 5: Commit** — `git add cli/lib/detect.mjs cli/lib/prompt.mjs cli/lib/entry.mjs test/cli-detect-entry.test.mjs && git commit -m "Dev: Framework detection and style wiring are idempotent and CI-safe." -- cli/lib/detect.mjs cli/lib/prompt.mjs cli/lib/entry.mjs test/cli-detect-entry.test.mjs`

### Task 10: `init`

**Files:**
- Create: `cli/commands/init.mjs`
- Test: `test/cli-init.test.mjs`

**Interfaces:**
- Produces: `npx cieo init [--yes] [--target next|vite|html] [--brand <b>] [--scheme light|dark] [--dir <componentsDir>] [--with <id>|--no-starter] [--skip-install] [--force]`. Order: detect/flags → answers (≤3 questions: brand, scheme, components dir; skipped entirely for html except brand/scheme) → validate `--with` is a registry id and target ≠ html (else clear error) → write `cieo.json` → write theme file → wire entry → copy starter via `copyPlan` → run detected PM install (`npm install cieo` / `pnpm add cieo` / `yarn add cieo` / `bun add cieo`; failure → warning + exact manual command, exit still 0 with a `doctor` hint) → summary (files written, next commands). Existing `cieo.json` without `--force`: TTY offers update (re-run wiring + theme with new answers), non-TTY exits 1 with `re-run with --force`. `--target html`: theme file + printed `<link>` snippet (`<link rel="stylesheet" href="cieo-theme.css">` plus the three package links), never copies components, `--with` errors.
- Consumes: Tasks 4–9.

- [ ] **Step 1: Failing tests** (tmp projects): vite happy path `--yes --skip-install --with dialog` → config, `src/cieo-theme.css`, marker block in `src/main.tsx`, `Dialog/` copied, summary mentions `npx cieo add`; next wiring into `app/layout.tsx`; html path writes `cieo-theme.css` + prints links, `--with` exits 1; JS-only project (no tsconfig) with target next/vite → clear error naming tsconfig; non-TTY existing config → exit 1 + `--force`; `--force` re-run → `changed: false` on second identical run (byte-for-byte).
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement. Step 4:** PASS.
- [ ] **Step 5: Commit** — `git add cli/commands/init.mjs test/cli-init.test.mjs && git commit -m "Users: npx cieo init leaves a themed, working component in place." -- cli/commands/init.mjs test/cli-init.test.mjs`

---

## Phase 4 — Fixtures and end-to-end proof (Lane E, after Lane I)

### Task 11: Committed fixture apps

**Files:**
- Create: `test/cli/fixtures/vite-react/{package.json,vite.config.ts,index.html,src/main.tsx,src/App.tsx,tsconfig.json}`
- Create: `test/cli/fixtures/next-app/{package.json,next.config.mjs,app/layout.tsx,app/page.tsx,tsconfig.json}`
- Create: `test/cli/fixtures/static-html/index.html`
- Modify: root `package.json` devDeps: add pinned `vite`, `@vitejs/plugin-react`, `@types/react-dom` (same versions as fixtures, warming the npm cache for E2E)

**Interfaces:**
- Produces: `FIXTURE_VERSIONS` note in `test/cli/fixtures/README.md` (why each pin exists + the ≥7-day-age rule). Fixture `package.json` files declare deps but NOT `cieo` (E2E installs the tarball explicitly). `vite-react` uses extensionless relative imports (`./App`), `moduleResolution: "bundler"`.

- [ ] **Step 1: Version check** — `npm view vite version && npm view vite time --json | tail -8 && npm view @vitejs/plugin-react version && npm view @types/react-dom version`. Pick the newest version published ≥ 7 days ago for each; record exact pins.
- [ ] **Step 2: Write fixtures.** `vite-react/src/main.tsx`: `import { createRoot } from 'react-dom/client'; import { App } from './App'; createRoot(document.getElementById('root')!).render(<App />);`; `src/App.tsx`: `export function App() { return <main>Cieo fixture</main>; }`; `tsconfig.json` with `{"compilerOptions":{"target":"ES2022","lib":["DOM","ES2022"],"jsx":"react-jsx","module":"ESNext","moduleResolution":"bundler","strict":true,"noEmit":true,"skipLibCheck":true},"include":["src","app"]}`. `next-app` mirrors Next's shape (`app/layout.tsx` default-exporting a root layout with no `next` imports so it typechecks without the next package; `next.config.mjs`: `export default {};`). Fixture deps: react 19.3.0, react-dom 19.3.0; devDeps @types/react 19.0.4, typescript 6.0.3 + picked pins.
- [ ] **Step 3: Root devDeps edit** — add the three picked pins to `package.json` devDependencies, `npm install` to refresh the lockfile, confirm `npm ls vite` resolves.
- [ ] **Step 4: Commit** — `git add test/cli/fixtures package.json package-lock.json && git commit -m "Dev: Three real fixture apps give the installer something honest to run against." -- test/cli/fixtures package.json package-lock.json`

### Task 12: Tarball-only E2E + CI wiring

**Files:**
- Modify: `test/cli/e2e.mjs` (replace the Task 2 stub)
- Modify: `.github/workflows/design-system.yml` (web job gains `npm run test:cli` — already inside `npm run check`; add nothing if check already covers it; instead verify and, if check is too slow, leave as is per spec)

**Interfaces:**
- Consumes: fixtures (Task 11), CLI (Tasks 3–10), `npm pack` output.
- Produces: `node test/cli/e2e.mjs` exits 0 with a per-fixture PASS report on stdout; nonzero + failing assertion text otherwise. Tarball path reused for all three fixtures.

- [ ] **Step 1: Implement `test/cli/e2e.mjs`** (plain Node, no test runner):

```js
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'pipe', encoding: 'utf8' });
const assert = (ok, msg) => { if (!ok) { console.error(`FAIL: ${msg}`); process.exit(1); } };

const packJson = JSON.parse(run('npm', ['pack', '--json'], root));
const tarball = join(root, packJson[0].filename);
const listing = run('tar', ['-tf', tarball], root);
for (const needed of ['package/bin/cieo.mjs', 'package/cli/commands/init.mjs', 'package/registry/index.json', 'package/registry/Dialog/Dialog.tsx']) {
  assert(listing.includes(needed), `tarball missing ${needed}`);
}

const hashTree = (dir) => {
  const entries = [];
  const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.name === 'node_modules') continue;
    const p = join(d, e.name);
    entries.push(e.isDirectory() ? `${p}/` : `${p}:${createHash('sha256').update(readFileSync(p)).digest('hex')}`);
    if (e.isDirectory()) walk(p);
  } };
  walk(dir);
  return entries.join('\n');
};

const setup = (fixture) => {
  const dir = join(mkdtempSync(join(tmpdir(), `cieo-${fixture}-`)), 'app');
  cpSync(join(root, 'test', 'cli', 'fixtures', fixture), dir, { recursive: true });
  run('npm', ['install', '--no-audit', '--no-fund', tarball], dir);
  return dir;
};

// --- vite-react: the full stranger path ---
{
  const dir = setup('vite-react');
  const bin = join(dir, 'node_modules', 'cieo', 'bin', 'cieo.mjs');
  run('node', [bin, 'init', '--yes', '--skip-install', '--with', 'dialog', '--brand', 'iris'], dir);
  for (const f of ['cieo.json', 'src/cieo-theme.css', 'components/cieo/Dialog/Dialog.tsx', 'components/cieo/Overlay/Overlay.tsx', 'components/cieo/motion.ts']) {
    assert(existsSync(join(dir, f)), `init did not write ${f}`);
  }
  const copied = [readFileSync(join(dir, 'components/cieo/Dialog/Dialog.tsx'), 'utf8'), readFileSync(join(dir, 'components/cieo/Overlay/Overlay.tsx'), 'utf8')].join('\n');
  assert(!copied.includes('../../'), 'copied files still contain package-territory imports');
  assert(copied.includes("from 'cieo/react'"), 'copied files do not import the package runtime');
  const main = readFileSync(join(dir, 'src/main.tsx'), 'utf8');
  assert(main.includes('/* cieo:start */') && main.includes("import 'cieo/tokens.css';"), 'entry not wired');
  const before = hashTree(dir);
  run('node', [bin, 'init', '--yes', '--skip-install', '--with', 'dialog', '--force'], dir);
  assert(hashTree(dir) === before, 'second init was not a byte-for-byte no-op');
  run('node', [bin, 'doctor'], dir);
  writeFileSync(join(dir, 'src', 'App.tsx'), "import { Dialog } from './components/cieo/Dialog/Dialog';\nexport function App() { return <main>Fixture<Dialog label=\"E2E\" open={false}>x</Dialog></main>; }\n");
  run('npx', ['tsc', '-p', '.'], dir);
  run('npx', ['vite', 'build'], dir);
  assert(existsSync(join(dir, 'dist', 'index.html')), 'vite build produced nothing');
  console.log('PASS vite-react: init+add+build from tarball');
}

// --- next-app: detection, wiring, typecheck ---
{
  const dir = setup('next-app');
  const bin = join(dir, 'node_modules', 'cieo', 'bin', 'cieo.mjs');
  run('node', [bin, 'init', '--yes', '--skip-install', '--no-starter'], dir);
  const layout = readFileSync(join(dir, 'app', 'layout.tsx'), 'utf8');
  assert(layout.includes('/* cieo:start */'), 'next layout not wired');
  assert(existsSync(join(dir, 'app', 'cieo-theme.css')), 'next theme file missing');
  run('npx', ['tsc', '-p', '.'], dir);
  console.log('PASS next-app: init+typecheck');
}

// --- static-html: tokens path, no components, no clobber ---
{
  const dir = setup('static-html');
  const bin = join(dir, 'node_modules', 'cieo', 'bin', 'cieo.mjs');
  const out = run('node', [bin, 'init', '--yes', '--skip-install'], dir);
  assert(existsSync(join(dir, 'cieo-theme.css')), 'html theme file missing');
  assert(out.includes('<link rel="stylesheet" href="cieo-theme.css">'), 'html snippet not printed');
  assert(!existsSync(join(dir, 'components')), 'html target copied components');
  console.log('PASS static-html: tokens path only');
}
```

- [ ] **Step 2: Run** — `npm run test:cli` → all three PASS. Fix CLI/fixtures, never the assertions' intent, until green.
- [ ] **Step 3: Confirm gate wiring** — `npm run check` includes `npm run test:cli` (Task 2) and stays green; total check time recorded in the commit message body (CI timeout is 15 minutes).
- [ ] **Step 4: Commit** — `git add test/cli/e2e.mjs && git commit -m "Users: The pack that ships is the pack that is proven to install and build." -- test/cli/e2e.mjs`

---

## Phase 5 — Docs site (Lane D, independent)

### Task 13: Pages deploy, honest per-component commands, catalogue quickstart

**Files:**
- Create: `scripts/check-site-links.mjs`, `test/site-links.test.mjs`
- Create: `.github/workflows/pages.yml`
- Create: `site/index.html` (authored landing: quickstart + links; nothing generates it today — verified absent)
- Modify: `scripts/build-component-pages.mjs` (footer `data-install` line ~52), `site/component.html` (reference shell footer), regenerate `site/components/**` (169 pages + generated `components/index.html`)
- Modify: `atoms/web/shell.library.before.html` (the catalogue's real header at `<header class="top">` ~line 121 — NOT `scripts/build-library.mjs`, which has no markup; verified), regenerate `docs/catalogue.html`

**Interfaces:**
- Produces: `checkSiteLinks(dir): string[]` (list of `file → missing target` for every relative `href`/`src` in `**/*.html`; skips `http(s):`, `mailto:`, `#`, `data:`; `/`-rooted resolved against `dir`; trailing-slash targets require `index.html`). CLI exit 1 on nonempty. Pages artifact layout: `public/` = contents of `site/` + `tokens/` + `design/` + selected `docs/` surfaces (`catalogue.html`, `agent-identity.html`, `workbench.html`, `studio/`) — so existing `../../tokens/...`, `../../design/...`, `../../docs/workbench.html` references resolve; component URLs stay `/components/<Name>.html`, root is `/index.html`.

- [ ] **Step 1: Failing test** — `test/site-links.test.mjs` builds three tmp trees (clean, missing target, external-only) and asserts `checkSiteLinks`. Then run `node scripts/check-site-links.mjs site` on the current tree: record the baseline failures (site pages reference `../../tokens/` outside the tree — expected; the checker runs against the assembled `public/`, so document that the site-only run is informational).
- [ ] **Step 2: Implement checker + test** → PASS. Commit check-only: `git add scripts/check-site-links.mjs test/site-links.test.mjs && git commit -m "Dev: The Pages build can no longer ship with silently broken links." -- scripts/check-site-links.mjs test/site-links.test.mjs`
- [ ] **Step 3: Footer command swap** — in `scripts/build-component-pages.mjs` replace `<code data-install>npm install github:civicsense2025/cieo#v0.3.0</code>` with `<code data-install>npx cieo add ${dir}</code>` (the per-component id); mirror in `site/component.html`; regenerate pages; `node scripts/build-component-pages.mjs --check` green. Commit: `git add scripts/build-component-pages.mjs site && git commit -m "Users: Every component page now shows the one command that actually brings it in." -- scripts/build-component-pages.mjs site` (site/component.html and site/components/** travel together).
- [ ] **Step 4: Catalogue quickstart strip** — edit `atoms/web/shell.library.before.html` (the catalogue shell): insert directly after its header, `<header class="top">` (verified at ~line 121):

```html
<div class="cieo-quickstart" role="note"><p><strong>Use Cieo in one command:</strong> <code>npx cieo init</code> sets up themed tokens, wires the CSS, and adds your first component. Then <code>npx cieo add dialog</code> for more. <a href="../">Component docs</a></p></div>
```

  Style it with one rule added to that file's style block: `.cieo-quickstart{display:flex;gap:.5rem;padding:.75rem 1rem;border:1px solid var(--border-control, rgba(0,0,0,.2));border-radius:var(--radius-control,10px);margin:1rem 0}`. Regenerate: `node scripts/build-catalogue.mjs`. Commit: `git add atoms/web/shell.library.before.html docs/catalogue.html && git commit -m "Users: The catalogue opens with the one command that gets you started." -- atoms/web/shell.library.before.html docs/catalogue.html`
- [ ] **Step 5: Root landing page** — create `site/index.html` (nothing generates it; the Pages checker and the catalogue strip's `href="../"` require it):

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Cieo</title><link rel="stylesheet" href="tokens/tokens.css"><link rel="stylesheet" href="design/primitives.css"></head><body class="cieo"><main><h1>Cieo</h1><p>Calm, critically damped spring motion with a design foundation, for the web and SwiftUI.</p><p><code>npx cieo init</code> — themed tokens, wired CSS, and your first component in one command.</p><nav><a href="components/">Component docs</a> · <a href="docs/catalogue.html">Catalogue</a> · <a href="docs/studio/">Studio</a> · <a href="docs/workbench.html">Workbench</a></nav></main></body></html>
```

  Commit: `git add site/index.html && git commit -m "Users: The docs site gets a front door that says how to start." -- site/index.html`
- [ ] **Step 6: Pages workflow** — resolve action SHAs first (never invent one):

```sh
gh api repos/actions/configure-pages/git/ref/tags/v5 --jq '.object.sha'
gh api repos/actions/upload-pages-artifact/git/ref/tags/v3 --jq '.object.sha'
gh api repos/actions/deploy-pages/git/ref/tags/v4 --jq '.object.sha'
```

  If a ref returns a tag object (`"type": "tag"`), peel it: `gh api repos/<owner>/<repo>/git/tags/<sha> --jq '.object.sha'`. Reuse the existing pinned SHAs from `design-system.yml` verbatim for `actions/checkout` and `actions/setup-node`.   Write `.github/workflows/pages.yml`: triggers `push` to `main` + `workflow_dispatch`; `permissions: { contents: read, pages: write, id-token: write }`; concurrency group `pages`; steps: checkout → setup-node (22, cache npm) → `npm ci` → `npm run build:pages` → assemble (only public surfaces — never all of `docs/`, which holds internal plans and reports):

```sh
mkdir -p public/docs
cp -R site/. public/
cp -R tokens design public/
cp docs/catalogue.html docs/agent-identity.html docs/workbench.html public/docs/
cp -R docs/studio public/docs/studio
node scripts/check-site-links.mjs public
```

  → configure-pages → upload-pages-artifact(`path: public`) → deploy-pages (job `environment: github-pages`). Human step (record in PR description): repo Settings → Pages → Source: GitHub Actions. Commit: `git add .github/workflows/pages.yml && git commit -m "Ops: The docs site deploys itself from main, links checked before it ships." -- .github/workflows/pages.yml`

---

## Phase 6 — Repo readiness (Lane G, independent)

### Task 14: License, README quickstart, contributor docs, module ownership

**Files:**
- Create: `LICENSE`, `CONTRIBUTING.md`, `docs/installation.md`, `docs/cli.md`
- Modify: `README.md` (top section), `docs/source-map.json` (new module)
- Verify: `package.json` public-release fields were already set in Task 2 (`private` removed, `license: "MIT"`, `engines`, version `0.4.0`) — confirm, do not re-edit.

**Interfaces:**
- Produces: new source-map module entry (mirror the exact key set of an existing entry, e.g. `web-controls`):

```json
{ "id": "install-and-cli",
  "sources": ["bin/**/*", "cli/**/*", "registry/**/*", "scripts/build-registry.mjs", "scripts/lib/registry.mjs", "test/cli/**/*", "test/cli-*.test.mjs", "test/registry-*.test.mjs"],
  "docs": ["docs/installation.md", "docs/cli.md"] }
```

- [ ] **Step 1: LICENSE** — standard MIT text, `Copyright (c) 2026 Civic Sense`. Commit with Step 4.
- [ ] **Step 2: README top** — replace the current `## Install` + `## Use` headers with a quickstart that leads with the one command:

```md
## Quick start

```sh
npx cieo init        # detects your framework, themes the tokens, wires CSS, adds a starter component
npx cieo add dialog  # copy any of the 169 primitives into your project — you own the source
npm run dev
```

Choose `--target html` for any non-React stack: Cieo's tokens and design layer work without a framework. On Swift, add the package in Xcode (File → Add Package Dependencies → `https://github.com/civicsense2025/cieo`) and `import Cieo`.

Full details: [installation](docs/installation.md) · [CLI reference](docs/cli.md) · [docs site](https://civicsense2025.github.io/cieo/)
```

  Keep the existing Install-from-GitHub note only as a "pinning a review" footnote; remove the `#v0.3.0` instruction line from the top.
- [ ] **Step 3: `docs/installation.md`** — sections: requirements (Node ≥ 20, React 18+), the three targets with real before/after entry snippets, the hybrid model in five lines (package vs copied source), theming (`cieo theme`, `cieo-theme.css`, runtime `applyTheme` link), troubleshooting pointer to `doctor`. **`docs/cli.md`** — every command with flags, lifted from each command's `USAGE` export (run `node bin/cieo.mjs --help` and each subcommand's `--help` to collect exact text). **`CONTRIBUTING.md`** — dev loop (`npm install && npm test`), gates (`npm run check`, `npm run test:cli`), where primitives live and the wire flow (`node scripts/wire-primitives.mjs`, then `node scripts/build-registry.mjs`), commit style pointer.
- [ ] **Step 4: source-map + gate** — add the module entry; run `ruby scripts/check-documentation.rb --self-test && ruby scripts/check-documentation.rb` → passes; `npm run check` green. Commit: `git add LICENSE README.md CONTRIBUTING.md docs/installation.md docs/cli.md docs/source-map.json && git commit -m "Users: The repo reads like something a stranger can adopt, not just a project we run." -- LICENSE README.md CONTRIBUTING.md docs/installation.md docs/cli.md docs/source-map.json`

### Task 15: Release workflow + operator runbook

**Files:**
- Create: `.github/workflows/release.yml`, `docs/releasing.md`

**Interfaces:**
- Consumes: same pinned SHAs as `design-system.yml` (copy verbatim: `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1`, `actions/setup-node@820762786026740c76f36085b0efc47a31fe5020`), plus one more `setup-node`? No — one setup-node step runs `npm install -g npm@^11.5.1` afterward for trusted publishing.
- Produces: tag `v*` on `main` → guard (tag must equal `package.json` version, and tag must be an ancestor of `origin/main`) → `npm ci` → `npm run check` → `npm publish --provenance --access public`. `docs/releasing.md` records: first-publish is manual by an org owner (`npm publish --access public` after `npm login`, because npm trusted publishing requires the package to exist); then configure the trusted publisher (GitHub repo `civicsense2025/cieo`, workflow `release.yml`); subsequent releases are `git tag v<version> && git push origin v<version>`; verify with `npm view cieo version`. Human checklist also lists: repo visibility public, Pages source = GitHub Actions.

- [ ] **Step 1: Write `release.yml`**:

```yaml
name: Release
on:
  push:
    tags: ['v*']
permissions:
  contents: read
  id-token: write
jobs:
  publish:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
        with:
          fetch-depth: 0
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v6
        with:
          node-version: '22'
          cache: npm
          registry-url: https://registry.npmjs.org
      - name: Tag matches package version and is on main
        run: |
          TAG="${GITHUB_REF_NAME#v}"
          PKG="$(node -p "require('./package.json').version")"
          [ "$TAG" = "$PKG" ] || { echo "tag $TAG != package version $PKG"; exit 1; }
          git merge-base --is-ancestor "$GITHUB_REF_NAME" origin/main || { echo "tag not on main"; exit 1; }
      - run: npm ci
      - run: npm run check
      - run: npm pack --dry-run
      - run: npm install -g npm@^11.5.1
      - run: npm publish --provenance --access public
```

- [ ] **Step 2: Write `docs/releasing.md`** with the Interfaces content above, including the exact `npm view cieo version` verification step and rollback note (`npm deprecate cieo@<bad> "reason"`; never unpublish).
- [ ] **Step 3: Validate locally** — `node --check` is not applicable to YAML; run `npm run pack --dry-run`-equivalent (`npm pack --dry-run --json` → inspect files list contains bin/, cli/, registry/) and `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/release.yml'))"`.
- [ ] **Step 4: Commit** — `git add .github/workflows/release.yml docs/releasing.md && git commit -m "Ops: Releases publish themselves from an exact tag, with provenance and a ledger." -- .github/workflows/release.yml docs/releasing.md`

---

## Phase 7 — The stranger test (after everything lands)

### Task 16: Adversarial acceptance by a fresh agent

**Files:**
- Create: `.superpowers/sdd/2026-10-13-one-command-install/acceptance.md` (workspace convention supersedes the spec's folder name)
- No source changes. Any failure found reverts to the owning lane's task (never patch here).

**Interfaces:**
- Consumes: the merged branch, the README only (the agent must not read the spec or this plan's interiors — the README is the product).
- Produces: a verdict with raw command transcripts: each command, exit code, and the exact output (trimmed), plus explicit "not verified" lines.

- [ ] **Step 1: Fresh agent, cold read** — dispatch with: "You are a stranger evaluating this repo. Use only `README.md` and what the CLI tells you." Give it: `npm pack` output path, a scratch dir, and 30 minutes. It must, without reading any other doc: (a) create a fresh Vite React-TS app (`npm create vite@latest -- --template react-ts`), (b) install the tarball (`npm install <tarball>`), (c) follow README to init + add a component, (d) `npm run build`, (e) run `npx tsc --noEmit`, (f) try to break it: re-run add after editing a copied file (must not clobber), run `add nonsense` (must suggest), run in a JS-only dir (must refuse clearly), run non-TTY (`</dev/null`, must not hang). Time each step.
- [ ] **Step 2: Report** — `acceptance.md` with PASS/FAIL per step, transcript excerpts, wall-clock, and any README sentence that misled it. It lives in the git-ignored SDD workspace, so no commit is possible or expected there; the coordinator copies its findings into the final report. (Ledger ruling: workspace convention supersedes the plan's old folder path.)
- [ ] **Step 3: Coordinator final sweep** — on the merged tip: `npm run check`, `npm run test:cli`, `npm pack --dry-run`, `swift build && swift test` (prove untouched), `git log --oneline main..HEAD` reviewed. Open the PR; after CI green, merge per house flow. Publish + Pages + visibility are the human checklist from `docs/releasing.md`.

---

## Execution Map (the squadron)

Dependencies are explicit; only genuinely independent lanes run in parallel, each in its own worktree (`~/.claude/bin/wt-new`), one commit-sized unit per builder, fresh reviewer per unit.

1. **Wave 1 (parallel, disjoint files):**
   - **Lane R — registry:** Tasks 1–2 (owns `scripts/lib/registry.mjs`, `scripts/build-registry.mjs`, `registry/`, `src/primitives/*/manifest.json`, `package.json`).
   - **Lane D — docs site:** Task 13 (owns `scripts/build-component-pages.mjs`, `scripts/build-library.mjs`, `site/**`, `docs/catalogue.html`, `.github/workflows/pages.yml`, `scripts/check-site-links.mjs`).
   - **Lane G — readiness:** Tasks 14–15 (owns `LICENSE`, `README.md`, `CONTRIBUTING.md`, `docs/installation.md`, `docs/cli.md`, `docs/source-map.json`, `.github/workflows/release.yml`).
2. **Merge order into the feature branch:** R → D → G (R first: Lane C consumes `registry/`).
3. **Wave 2 (sequential chain, one builder lane on the feature branch):** Lane C Tasks 3–8 → Lane I Tasks 9–10 → Lane E Tasks 11–12.
4. **Wave 3:** Task 16 (fresh adversarial agent) → coordinator sweep → PR → CI → merge.
5. **Disk discipline:** reclaim each lane worktree as it merges (`~/.claude/bin/wt-clean --apply`); delete build outputs from retired worktrees.
6. **Human-gated, after merge:** repo visibility, npm first publish + trusted publisher, Pages enablement, then tag `v0.4.0`.

## Self-Review (completed against the spec)

- **Spec coverage:** distribution model → Tasks 1–2, 7; targets → Tasks 9–10, 11 (fixtures per target); `cieo.json` → Task 4; init ≤3 questions + starter → Task 10; add/rewrite → Tasks 5–7; supporting commands → Tasks 7–8; docs site → Task 13; repo readiness → Tasks 2, 14 (package.json moved from the spec's readiness list into the registry lane to keep a single writer; same deliverable); release → Task 15; testing/proof incl. tarball-only E2E → Tasks 11–12; stranger test → Task 16; success criteria 1–5 → Tasks 10, 12, 16 (+2's drift gate, 15's publish path). No gaps found.
- **Placeholder scan:** no TBDs; every code step carries real code or an exact command; "mirror the existing entry key set" instructions name the file and entry to copy from.
- **Type consistency:** `scanRegistrySources`/`classifyImport` (T1) ↔ generator (T2) ↔ rewriter table agreement test (T6); `readConfig`/`validateConfig`/`writeConfig` (T4) used by T7, T8, T10; `plan`/`resolveId`/`loadRegistry` (T5) used by T7, T10; `copyPlan` (T7) used by T10; `wireEntry`/`entryFileFor` (T9) used by T10; `themeFileFor`/`writeThemeFile` (T8) used by T10; `checkSiteLinks` (T13) used by Pages workflow (T13).
- **Review Focus mapping:** 1→T7(d)/T10/T12; 2→T9 prompt/T10 `--yes`; 3→T9/T10 html+JS errors; 4→T7(c)/T10 force/T12 hash no-op; 5→T9 entry tests (CRLF, 'use client', no imports, missing file).
- **Corrections folded in:** extensionless relative imports for copied files (Vite cannot resolve `x.js`→`x.tsx`; E2E proves it); `package.json` single-writer per lane; `test:cli` runs the E2E and sits last in `check`; stub E2E in T2 keeps every commit runnable.
