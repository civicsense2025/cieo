# Apple library integration

The integrated source contains the Apple component foundation, the 550-recipe native gallery, discovery and interaction cleanup, component-system research, and current web catalogue fixes. Native rendered acceptance and device GPU/energy profiling remain open.

[Included work](#included-work) · [Verification](#verification) · [Remaining acceptance](#remaining-acceptance)

## Included work

- Keep reusable foundations, atoms, molecules and organisms separate from reference recipes and host-owned data/actions.
- Search recipes and categories, save favorites and revisit recent previews. Keep the canvas stationary and use native glass only for preview controls, with accessibility fallbacks.
- Adapt 141 content-width frames across 129 files. Repair recovery cancellation, local save feedback, sample action receipts and notification dismissal. Fixed-size scenes still need individual device review.
- Preserve current remote catalogue fixes and the separate component-system architecture, research and inventory tooling. Regenerate all four web pages from source and refresh the identity receipt without changing its frozen baseline.

## Verification

The [verification record](../generated/apple-library-verification.json) records the integrated source boundary and check counts. The earlier inventory-only failures are historical. Current brand and design-ledger checks pass.

| Check | Result |
|---|---|
| Web aggregate | 102 tests: 100 passed, 2 skipped; brand, 34 design exports, 273 ledger entries, types and generated drift passed |
| Catalogue build/model | 13 passed |
| HTTP browser review | 67 passed, including 320–1920 px geometry, keyboard interaction, dark appearance, reduced motion and forced colors |
| JavaScript browser suite | 24 passed; no uncaught browser errors |
| Apple catalogue/export regressions | 3 passed in each suite |
| Swift package | 14 XCTest cases passed |
| Catalogue receipt | 1,100 source records: 550 Swift and 550 web, 551 identities and 11 explicit loader observations |

The first HTTP smoke attempt failed on broad appearance selectors. A focused check confirmed the controls worked. The corrected suite targets accessible button names and preserves the same assertions and deadlines; the failed local receipt is retained.

## Remaining acceptance

1. Mirror this committed revision into the Apple starter and complete its source/build gate. The previous simulator attempt was interrupted because integration superseded its source revision.
2. Close Components normally before replacing `com.principle.components`. Preserve the working learning app and its authentication setup.
3. Run the seven physical-device interaction tests and review compact/landscape, keyboard, large text, dark appearance, Reduce Motion, Reduce Transparency and VoiceOver behavior.
4. Profile a matched device workload for GPU, energy and hitches. Source checks and native compilation do not establish these results.

Legacy compiler warnings and some fixed-size recipe scenes remain. No exhaustive visual acceptance of all 550 native recipes is claimed.
