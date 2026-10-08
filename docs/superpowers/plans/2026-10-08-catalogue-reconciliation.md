# Catalogue Reconciliation Implementation Plan

> **Execution status:** All three inventory tasks completed and reviewed. The checkboxes record that bounded execution; the full gate remains blocked and later component work is not authorized by this plan.

**Goal:** Account for every existing Swift and web recipe ID before introducing component manifests or moving source files.

**Architecture:** Build a read-only, deterministic inventory from committed recipe sources and the existing web index. Compare independent source declarations, indexed metadata, and a frozen baseline; expose collisions and missing entries as structured diagnostics. This inventory is a migration receipt, not a second mutable component registry.

**Tech Stack:** Existing Node ES modules, `node:test`, Node filesystem/crypto APIs, Git; no new dependency or native build.

**Spec:** [Approved atomic component specification](../specs/2026-10-08-atomic-component-system-design.md)

## Global Constraints

- Preserve `Cieo`, `CieoUI`, `CieoAtoms`, existing recipe IDs and compatibility entry points.
- Preserve `MotionAtomView.init()`, `MotionAtomInfo`, CieoAtoms and web `./atoms/*` imports through retained recipe implementations or compatibility adapters during migration.
- Keep iOS 17/macOS 14 deployment support. The tools manifest remains 5.9 API syntax; the existing back-deployed `@Entry` usage requires Xcode 16+.
- Foundations/styles/resources are not fictitious UI atoms. No wholesale move of the Writing category is authorized by its name alone.
- Local import limits are project defaults: 1 MiB per manifest, 4,096 records per collection, 4,096 characters per ordinary string, 32 nesting levels and 64 MiB per registry import. These are later manifest-import requirements; this inventory does not implement or claim that import boundary.
- Token values remain in `design/`. No product appearance, source membership, exported API, catalogue insertion behavior or generated runtime changes in this slice.
- No secrets or machine-specific private paths enter manifests. Inventory paths are repository-relative with forward slashes.
- Source-only classification cannot establish production readiness. Existing `MotionAtomView` declarations are recorded as recipes; atomic layers and reusable-production disposition require a subsequent component review.

## Review Focus

1. **A recipe disappears or changes ID:** the baseline comparison must report the original identity rather than silently shrinking the catalogue; Task 2 tests deletion and renaming.
2. **Two files claim one ID:** report both paths and block publication; Task 2 tests platform-local collisions while permitting one ID on each platform.
3. **The web index disagrees with executable sources:** keep a mismatch visible instead of choosing whichever looks current; Task 1 tests disagreement and unindexed blocks.
4. **A source path escapes through `..` or a symlink:** reject before reading the file; Task 1 tests containment and symlink inputs.
5. **Generation fails or output is stale:** never overwrite the last valid receipt with a partial result; Task 3 tests check mode, failure preservation and repeatability.

## Approved scope and integration sequence

This is the first independently useful slice of the approved architecture. A single implementation plan for the inventory, recursive typed schema, SwiftUI refactor, export selection, and Tessera persistence would conceal separate review boundaries. Later plans use the approved specification and the outputs below; they are not implicitly implemented by this plan.

| Slice | Deliverable | Prerequisite / remaining design work |
| --- | --- | --- |
| **1. Catalogue reconciliation — this plan** | Complete ID/source receipt and explicit mismatch diagnostics | Existing committed Apple foundation and web sources |
| 2. Component contracts | Colocated manifests, Draft 2020-12 schemas, typed/default/reference validation, generated registry, deterministic migrations | Slice 1; enumerate complete record shapes and migration fixtures in its own plan |
| 3. Native core and optional Writing | Separated styles, controlled APIs, original visual identity, optional target, sample hosts in Examples | Slice 2; review components by purpose, establish rendered baseline, plan each behavior change |
| 4. Portable export | Selected-product closure, disjoint resources, exact hashes, retained destination safeguards | Package graph from slice 3; starter auth/build verification in owning checkout |
| 5. Tessera adapter | Validated explicit pin, independent actions, missing-pack byte preservation | Slice 2/4 contracts; preserve unrelated Tessera changes; native host/helper prerequisites remain independent |

The component-contract plan must cover every field in the approved spec, not just the illustrative Input record. The native plan must account for every inventory ID, preserving existing recipe APIs where a production replacement is inappropriate. Media research is still open and does not become complete through approval of this specification.

[File ownership](#file-ownership) · [Task 1](#task-1-read-independent-recipe-identities) · [Task 2](#task-2-reconcile-platforms-and-preserve-the-baseline) · [Task 3](#task-3-publish-and-check-the-receipt) · [Acceptance](#acceptance-and-execution-handoff)

## File ownership

| File | Responsibility |
| --- | --- |
| `scripts/catalogue/source-inventory.mjs` | Read supported source declaration headers, enforce containment, report parse gaps |
| `scripts/catalogue/reconcile.mjs` | Join by identity, detect collisions, compare frozen compatibility baseline |
| `scripts/check-catalogue-inventory.mjs` | CLI orchestration, deterministic receipt/check mode, safe replacement |
| `test/catalogue-inventory.test.mjs` | Behavioral source/reconciliation/filesystem/CLI tests |
| `test/fixtures/catalogue-baseline.json` | Frozen IDs, symbols and source hashes from pre-migration committed sources |
| `docs/generated/catalogue-inventory.json` | Generated current receipt; never hand-edit |
| `docs/catalogue-inventory.md` | Receipt meaning, parser limitations, migration rules and exact gate evidence |
| `package.json` | Add explicit inventory check script without weakening existing gates |
| `docs/apple-components.md` | Link to the inventory receipt guide without changing readiness claims |

No change to `atoms/`, `Sources/`, `design/`, `Package.swift`, generated catalogue HTML or Tessera is required. New tooling lives beside its owning concept, rather than growing the existing catalogue builders. No shared extractor refactor is needed until a real consumer adopts this output.

## Task 1: Read independent recipe identities

**Files:** Create `scripts/catalogue/source-inventory.mjs`; create `test/catalogue-inventory.test.mjs`.

**Interfaces:**

```js
// Every diagnostic is a plain JSON record; no source bodies in messages.
// { code: string, path: string, message: string }
// Every source record is:
// { platform: 'swift'|'web', id: string, symbol: string|null,
//   category: string, path: string, sha256: string, artifactKind: 'recipe' }
// readSwiftSource(text: string, relativePath: string) -> { records, diagnostics }
// readWebSource(text: string, relativePath: string) -> { ids, diagnostics }
// containedFile(root: string, relativePath: string) -> absolute regular-file path; throws with code
// collectSources(root: string) -> { records, diagnostics }
```

The signatures above define the implementation contract. Use the concrete extraction patterns and failure rules below.

- [x] **Step 1: Add source-header regression tests.** Use these tests and add the filesystem fixtures described in Step 3.

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readSwiftSource, readWebSource } from '../scripts/catalogue/source-inventory.mjs';
const swift = 'public struct SampleAtom: MotionAtomView {\n' +
  'public static let info = MotionAtomInfo(id: "sample", category: "Writing", name: "Sample", summary: "Demo")\n' +
  'public init() {}\npublic var body: some View { Text("Example") }\n}';
test('retains declared identity rather than deriving it from the filename', () => {
  const result = readSwiftSource(swift, 'atoms/swift/Writing/Different.swift');
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.records[0].id, 'sample');
  assert.equal(result.records[0].symbol, 'SampleAtom');
  assert.equal(result.records[0].artifactKind, 'recipe');
});
test('unsupported metadata is a diagnostic rather than a silent omission', () => {
  const result = readSwiftSource(swift.replace('id: "sample"', 'id: computedID'), 'atoms/swift/Writing/Sample.swift');
  assert.equal(result.records.length, 0);
  assert.ok(result.diagnostics.some(d => d.code === 'unsupported-source-header'));
});
test('web extraction reads declaration headers without executing code', () => {
  const result = readWebSource("atom({ id:'sample', cat:'Writing', init(){ throw Error('never run'); }});", 'atoms/web/blocks/sample.js');
  assert.deepEqual(result.ids, ['sample']);
  assert.deepEqual(result.diagnostics, []);
});
```

Run `node --test test/catalogue-inventory.test.mjs`; expect module-not-found failure before the implementation exists.

- [x] **Step 2: Implement narrow, fail-closed header extraction.** Use these patterns for the source format actually observed in the repository:

```js
const swiftDeclarations = /\bpublic\s+struct\s+(\w+)\s*:\s*MotionAtomView\b/g;
const swiftInfo = /\bpublic\s+static\s+let\s+info\s*=\s*MotionAtomInfo\(\s*id:\s*"([a-zA-Z0-9_-]+)"\s*,\s*category:\s*"([^"\\\r\n]+)"/g;
const webCalls = /\batom\s*\(/g;
const webHeaders = /\batom\s*\(\s*\{\s*id\s*:\s*(['"])([a-zA-Z0-9_-]+)\1\s*,\s*cat\s*:/g;
```

For Swift, split the text at declaration offsets. Each declaration segment must contain exactly one supported `swiftInfo` match. A file with zero declarations is support code and contributes no recipe. A file with an unsupported/multiple header contributes a diagnostic, never a guessed ID. Pair each ID with its declaration symbol and category. For web, the supported header count must equal the `webCalls` count. Shared blocks with zero calls are valid. Preserve declaration order in extraction; sort only in the receipt owner. Hash exact source bytes with `createHash('sha256').update(bytes).digest('hex')`.

These regexes are not language parsers. They may conservatively reject strings/comments containing declaration-like text; record that limitation and test ambiguous input as rejected. Do not strip arbitrary content, evaluate web blocks, infer IDs from filenames, or ignore an unexpected source form. If the real corpus fails, add a minimal fixture for that specific form and extend extraction deliberately; do not relax the total-accounting invariant. The acceptance condition is zero parse gaps on the actual committed corpus, not a count copied from the report.

- [x] **Step 3: Implement contained source collection.** Discover all `.swift` files under `atoms/swift`, excluding `*.generated.swift`, using sorted directory traversal. Reject symlink entries. Read `atoms/web/blocks.json` and `atoms/web/index.json` as JSON, require arrays, and require strings for block entries and `id`, `category`, `file` for index entries. Reject duplicate block paths and index IDs. Read every listed block; compare its header IDs with index rows assigned to that block. Report missing/extra/index-mismatch records; do not select one source as silently authoritative. A block containing more than one recipe is allowed only when the index supplies every ID. Hash block bytes and carry indexed category after correspondence is established.

Use this containment implementation, with errors normalized at `collectSources` into code/path/message diagnostics:

```js
import fs from 'node:fs';
import path from 'node:path';
export function containedFile(root, relativePath) {
  const fail = code => { throw Object.assign(new Error(code), { code }); };
  if (typeof relativePath !== 'string' || relativePath.includes('\\') ||
      path.isAbsolute(relativePath) || relativePath.split('/').some(p => p === '..' || p === '.' || p === '')) fail('unsafe-path');
  const base = fs.realpathSync(root);
  let cursor = base;
  for (const part of relativePath.split('/')) {
    cursor = path.join(cursor, part);
    if (fs.lstatSync(cursor).isSymbolicLink()) fail('symlink-source');
  }
  if (!fs.statSync(cursor).isFile()) fail('source-not-file');
  const resolved = fs.realpathSync(cursor);
  if (!resolved.startsWith(base + path.sep)) fail('unsafe-path');
  return resolved;
}
```

Add temporary-directory tests for `../outside`, an absolute path, a symlink to an outside file, missing source, index/source disagreement, unindexed recipe, duplicate block path, shared block, and unsupported headers. Use `fs.mkdtempSync` and `t.after` cleanup for owned fixtures only. The collector must not run source or fetch remote URLs.

- [x] **Step 4: Run focused tests and collect the real corpus.** Invoke `collectSources(process.cwd())` from a temporary Node ES-module entry. Expected: all declaration/index identities accounted for, or explicit diagnostics requiring fixture-driven extractor correction. Record observed counts; the research's 540 Swift/45 Writing counts are a cross-check, not a fixed pass assertion. Re-read source headers for every discrepancy.
- [x] **Step 5: Commit only the new collector and its tests.** Message: “Read recipe identities from their existing sources. Report unsupported headers and index disagreements before migration can drop an ID.”

## Task 2: Reconcile platforms and preserve the baseline

**Files:** Create `scripts/catalogue/reconcile.mjs`; extend `test/catalogue-inventory.test.mjs`; create `test/fixtures/catalogue-baseline.json`.

**Interfaces:** Consumes source records from Task 1. Produces `reconcile(records, baseline = []) -> { entries, diagnostics }`, where each entry has `id`, `artifactKind: 'recipe'`, `sources` (sorted source records), and `platformStatus: 'paired'|'swift-only'|'web-only'`. Baseline compares platform, ID and Swift symbol. Paths and hashes remain evidence, not identity.

- [x] **Step 1: Add collision and compatibility tests.**

```js
import { reconcile } from '../scripts/catalogue/reconcile.mjs';
const source = (platform, id, file, symbol = null) => ({
  platform, id, symbol, category: 'Writing', path: file,
  sha256: 'a'.repeat(64), artifactKind: 'recipe'
});
test('joins equivalent IDs across platforms without erasing either source', () => {
  const result = reconcile([source('swift', 'outline', 'a.swift', 'OutlineAtom'), source('web', 'outline', 'a.js')]);
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.entries[0].platformStatus, 'paired');
  assert.equal(result.entries[0].sources.length, 2);
});
test('duplicate identity on one platform blocks the receipt', () => {
  const result = reconcile([source('swift', 'same', 'a.swift'), source('swift', 'same', 'b.swift')]);
  assert.ok(result.diagnostics.some(d => d.code === 'duplicate-platform-id' && d.message.includes('a.swift') && d.message.includes('b.swift')));
});
test('renaming an ID or Swift symbol cannot silently satisfy the baseline', () => {
  const original = source('swift', 'before', 'a.swift', 'BeforeAtom');
  assert.ok(reconcile([source('swift', 'after', 'a.swift', 'BeforeAtom')], [original]).diagnostics.some(d => d.code === 'missing-baseline-id'));
  assert.ok(reconcile([source('swift', 'before', 'a.swift', 'AfterAtom')], [original]).diagnostics.some(d => d.code === 'changed-baseline-symbol'));
});
test('single-platform coverage is retained rather than claimed as parity', () => {
  const result = reconcile([source('web', 'web-only', 'one.js')]);
  assert.equal(result.entries[0].platformStatus, 'web-only');
  assert.deepEqual(result.diagnostics, []);
});
```

Run the focused test file; expect missing-module failure.

- [x] **Step 2: Implement reconciliation.** The following algorithm owns grouping and baseline preservation; normalize/sort diagnostics by code/path/message before returning.

```js
export function reconcile(records, baseline = []) {
  const groups = new Map();
  const diagnostics = [];
  for (const record of records) {
    const sources = groups.get(record.id) ?? [];
    const duplicate = sources.find(s => s.platform === record.platform);
    if (duplicate) diagnostics.push({ code: 'duplicate-platform-id', path: record.path,
      message: `${record.platform}:${record.id} is declared by ${duplicate.path} and ${record.path}` });
    sources.push(record);
    groups.set(record.id, sources);
  }
  for (const original of baseline) {
    const current = (groups.get(original.id) ?? []).find(s => s.platform === original.platform);
    if (!current) diagnostics.push({ code: 'missing-baseline-id', path: original.path,
      message: `Missing ${original.platform}:${original.id}` });
    else if (current.symbol !== original.symbol) diagnostics.push({ code: 'changed-baseline-symbol', path: current.path,
      message: `Changed public symbol for ${original.platform}:${original.id}` });
  }
  const entries = [...groups].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([id, sources]) => ({
    id, artifactKind: 'recipe',
    platformStatus: new Set(sources.map(s => s.platform)).size === 2 ? 'paired' : `${sources[0].platform}-only`,
    sources: sources.toSorted((a, b) => a.platform < b.platform ? -1 : a.platform > b.platform ? 1 : a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
  }));
  const key = d => `${d.code}/${d.path}/${d.message}`;
  return { entries, diagnostics: diagnostics.sort((a, b) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0) };
}
```

Use `[...sources].sort(...)` instead of `toSorted` if the pinned Node runtime requires it. Add a test asserting caller input remains unchanged. Compare byte-identical receipts after reversing input order. Test equal diagnostic keys as well; deterministic ordering must not depend on sort instability.

- [x] **Step 3: Freeze the actual pre-migration baseline.** Require clean tracked recipe inputs using Git before collecting; record their source revision and exact source hashes. Store `{ formatVersion: 1, sourceRevision, records }` in the fixture. Sort platform/id/path using explicit codepoint comparison. This is the one deliberate baseline creation; do not offer a routine CLI “accept all changes” switch. Baseline updates require an explained compatibility migration and review. Do not erase duplicates or bypass parse diagnostics to create it.
- [x] **Step 4: Re-run focused tests and independently compare baseline IDs with the existing Swift generated index and web index.** Symbol count must match `MotionAtom(Type.self)` entries in `atoms/swift/AtomIndex.generated.swift`; mismatch is a diagnostic for investigation. No generated index rewrite in this task. The Writing category remains source metadata; it grants neither optional-target membership nor production status.
- [x] **Step 5: Commit reconciler, baseline and tests.** Message: “Freeze pre-migration recipe identities and reconcile platform coverage. Keep missing IDs and symbol changes visible without treating a demo as a production component.”

## Task 3: Publish and check the receipt

**Files:** Create `scripts/check-catalogue-inventory.mjs`, `docs/generated/catalogue-inventory.json`, `docs/catalogue-inventory.md`; modify `package.json`; extend `test/catalogue-inventory.test.mjs`.

**Interfaces:** CLI `node scripts/check-catalogue-inventory.mjs [--check]`. Root is derived from `import.meta.url`, independent of working directory. Exit 0 on exact valid receipt, 1 on diagnostics or stale output, 2 on unsupported arguments. No implicit baseline mutation.

- [x] **Step 1: Add CLI tests with a temporary fixture repository.** Export `buildReceipt(root)` from the CLI module and guard the entry point with `pathToFileURL(process.argv[1]).href === import.meta.url`. `buildReceipt` consumes collectors/reconciler and returns `{ bytes, diagnostics }`; it never writes. Add these concrete assertions after constructing a minimal fixture using the source text from Task 1:

```js
const first = buildReceipt(fixtureRoot);
const second = buildReceipt(fixtureRoot);
assert.deepEqual(first.diagnostics, []);
assert.equal(first.bytes, second.bytes);
assert.equal(JSON.parse(first.bytes).entries[0].artifactKind, 'recipe');
assert.ok(!first.bytes.includes(fixtureRoot));
```

Spawn the CLI with an exported `runInventory({ root, check })` test seam rather than exposing an arbitrary root flag to normal users. Require these assertions: missing output + check returns 1 without creating a file; valid generation then check returns 0; edited output + check returns 1 and retains edits; source parse error leaves old output bytes unchanged. The CLI must never invoke Swift, evaluate a block or start a server.

- [x] **Step 2: Implement receipt/check/write orchestration.** Receipt shape is `{ formatVersion: 1, baselineRevision, entries }`, serialized as `JSON.stringify(value, null, 2) + '\n'`; omit timestamps/current checkout paths so repeated source input produces identical bytes. Use the frozen baseline revision, not the current commit, to avoid a self-invalidating receipt. Source hashes identify current bytes. On source diagnostics print one JSON object containing the diagnostic array and exit 1 before any write.

For writes, create the parent directory only after validation, write a same-directory temporary file with `flag: 'wx'`, and `renameSync` into place; clean up only that owned temporary file in `finally`. Check mode compares exact bytes and reports `stale-inventory` without mutation. The public script accepts only no arguments or `--check`; reject any other argument with exit 2. Treat unexpected filesystem errors as failures rather than an empty catalogue. Do not overwrite source or baseline from this CLI.

- [x] **Step 3: Add the explicit package command and usage documentation.**

```json
"check:catalogue": "node scripts/check-catalogue-inventory.mjs --check"
```

Keep existing `check`, brand validation and ledger checks intact. Document generation and check commands, baseline amendment rules, recipe-only classification, parser limitations, platform-mismatch interpretation, and why this file is not the forthcoming manifest registry. Add a link to this receipt guide from `docs/apple-components.md`; reread its surrounding status language before editing. This additional touched file is documentation only.

- [x] **Step 4: Run the required gates and compare inherited failures.** Before edits in Task 1, capture baseline exits for the same commands below. After implementation, run them again with logs in a task-local ignored temporary evidence directory. Do not call a failing aggregate green because focused tests pass.

```sh
node --test test/catalogue-inventory.test.mjs
node scripts/check-catalogue-inventory.mjs
npm run check:catalogue
npm run test
npm run check:design
npm run test:design:types
npm run check
node --test test/catalogue/*.test.mjs
python3 test/apple-export.test.py
git diff --check
```

Capture known brand/ledger failure identities before claiming they are inherited. Do not fix unrelated brand/ledger source in this slice. Any newly introduced regression must be fixed or the responsible change reverted. If the aggregate remains inherited-red, record this slice as focused-pass/full-gate-blocked and stop before merging or starting source migration. This preserves the user's requirement that red refactors are not done; this slice does not refactor product behavior.

Search direct consumers with `rg 'index.json|blocks.json|MotionAtomInfo|MotionAtoms.all|AtomIndex.generated' scripts atoms test Sources docs`; reread relevant call sites and confirm no consumer was switched to the receipt. No native app builds are needed for these tooling-only changes. If native verification becomes necessary because scope changed, enumerate matching processes and use normal quit before building/testing.

- [x] **Step 5: Review the full diff and commit the receipt owner.** Confirm only the listed tooling, fixture, documentation and package command changed. Ensure all generated bytes match check mode, hashes correspond to current source, no private absolute paths appear, no temporary files are staged, and no process was left running. Message: “Publish a reproducible catalogue migration receipt. Add a non-mutating check so stale inventories and source gaps block the next migration.”

## Acceptance and execution handoff

The slice is complete only when every real source ID is represented or explicitly blocks generation, duplicates are rejected, baseline deletions/renames fail, receipts repeat byte-for-byte, no public recipe changes, and all new focused tests pass. The existing aggregate failure status must remain visible. New production manifest support, native aesthetic acceptance, optional Swift targets and exported starter parity are **not** acceptance claims for this slice.

Self-review mapping: specification inventory/compatibility requirements map to Tasks 1–3. The remaining contract, native, export and Tessera requirements map to slices 2–5 above and require their own concrete plans; none is silently omitted from the approved integration scope. The research media gaps remain in the coverage ledger.

**Execution completed:** The approved subagent-driven method completed all three inventory tasks through `7cb3d06`. Focused tooling passes; older brand, design ledger and catalogue-order failures still block merge and source migration. Whole-branch documentation remediation follows the final review; runtime contracts and later slices retain their separate acceptance gates.
