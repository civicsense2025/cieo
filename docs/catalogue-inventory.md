# Catalogue migration receipt

The reproducible [receipt](generated/catalogue-inventory.json) preserves 1,090 current source records (540 Swift, 550 web). Eleven `indexed-source-not-loaded` observations expose indexed declarations outside the web loader list. Focused tooling passes; the full gate remains blocked by inherited failures described below.

- [Generate and check](#generate-and-check)
- [Interpret the receipt](#interpret-the-receipt)
- [Amend the baseline](#amend-the-baseline)
- [Verification and limits](#verification-and-limits)

## Generate and check

1. Run `node scripts/check-catalogue-inventory.mjs` to regenerate the fixed receipt destination.
2. Run `npm run check:catalogue` to compare exact bytes without changing files.

Run the commands above from the repository root. The CLI derives its data root from its own location; invoking Node with an absolute path to `scripts/check-catalogue-inventory.mjs` also works from another working directory. It accepts only no arguments or `--check`: success exits 0, diagnostics or stale output exit 1, unsupported arguments exit 2. Failures emit one JSON object containing a diagnostic array. Source errors stop writes; output symlinks are rejected. Generation uses an exclusive same-directory temporary file and rename, cleaning up only its own temporary file. Existing brand, design ledger and aggregate checks remain unchanged.

## Interpret the receipt

Every entry is a `recipe`, including existing Swift `MotionAtomView` declarations. `paired`, `swift-only` and `web-only` describe declared identity coverage; they do not establish visual, behavioral or production parity. Source paths are repository-relative and SHA-256 hashes identify exact current bytes, including line endings. The frozen baseline revision avoids a receipt that invalidates itself on each commit. There are no timestamps or checkout paths.

Observations retain index-only declarations without claiming those recipes are loaded. A source/index ID mismatch, duplicate identity, missing baseline identity or changed public Swift symbol blocks generation. Diagnostics and observations are sorted for reproducibility.

Extraction is deliberately conservative lexical inspection of literal declaration headers. It does not evaluate scripts, compile Swift or parse either full language. Unsupported or declaration-shaped comment/string syntax fails rather than silently disappearing. Changing header syntax requires supported extraction and regression coverage first.

This file is a migration receipt, not the forthcoming manifest registry. It does not define reusable production atoms, component contracts, import caps, permission policy or runtime registration. Existing catalogue builders continue using `blocks.json` and `index.json`; Swift keeps its generated index. No consumer is switched to this receipt.

## Amend the baseline

The frozen identity fixture is `test/fixtures/catalogue-baseline.json`. Generation never updates it. Intentional identity removal, renaming or public symbol changes require an explicitly reviewed baseline amendment with compatibility rationale and tests; do not regenerate it merely to silence a diagnostic. Path or byte changes alone do not require identity amendment.

## Verification and limits

Verification runs on this tooling slice are recorded below. The prepared baseline already verifies 34 design exports before failing the ledger at `CIEO-144`; aggregate brand validation and catalogue source-block ordering also fail before this slice. No product sources, public APIs, loader membership or token values changed. Native rendering, starter parity and production manifest support remain separate work.

<!-- verification-results -->

| Check | Observed result |
| --- | --- |
| Inventory fixture tests | 35/35 pass, including real child processes, import without argv, exact byte hashes, stale preservation and linked output rejection |
| Generate and `check:catalogue` | Pass; 551 entries retain 1,090 source records and 11 sorted observations; all current source hashes independently match raw bytes |
| `npm run test` | 99 tests: 97 pass, 2 skipped |
| Design exports / design types | 34 exports verify; type check passes; design ledger fails at inherited `Missing source contract: CIEO-144` |
| Aggregate / catalogue / Apple export | The slice preflight and publication each had 57 brand hits. Whole-branch review against `9d2574f` attributed 50 to branch-added documentation; relocation and portable references remove those 50, leaving seven older hits; catalogue remains 8/9 with `every declared source block is included in order` failing at `blocks/000-shared.js`; Apple export 2/2 passes |

`git diff --check` passes. No browser or native app was launched: this slice changes tooling and documentation only. Full-gate status is **focused-pass/full-gate-blocked**; resolve the inherited checks in separately authorized work before merging or starting source migration. Local command logs and baseline comparison are in the ignored task evidence directory; the local `task-3-report.md` records exact commands and evidence paths.
