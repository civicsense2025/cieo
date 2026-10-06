# Review: a portable identity layer for Cieo

## Baseline

The reviewed base is `92de47d803d984d917c4b633ddac7a2a00c84683`. The interrupted attempt had created the tree `bd7664fffe30065b701811f5efbf42d2988d58dd` with 13 design files, but no commit, branch, or pull request. Recovery attached that tree to commit `6b056297865f3db5f79b3605901fea3abc5cf569` on `improvements/portable-design-system`. Subsequent changes complete and test that work.

The package already separates the spring core, document helpers, and React entry point, and supplies a SwiftUI package. Its README describes the web atoms as catalogue recipes rather than production component exports. The review preserves that distinction.

## Findings and changes

The catalogue's `atoms/web/shell.before.html` hardcodes its colors, fonts, density, and layout values. `tokens/tokens.json` only describes motion. The new `design/` API supplies a separate, optional visual contract rather than hardcoding another product identity into the spring engine.

`package.json` declares `sideEffects: false`, even though consumers import a token stylesheet for its effect on CSS. The change lists `**/*.css` as side-effectful and keeps the JavaScript modules tree-shakeable.

The baseline token stylesheet sets duration and lag to zero under reduced motion but leaves stagger, drift, and arrival opacity unchanged. The patch sets those values to zero, zero, and one respectively in both explicit and system reduced-motion branches.

The baseline doesn't publish a portable visual-token contract or native visual-token generators. The change adds explicit typed JSON, configuration validation, deterministic CSS, six constant generators, a CLI, and immutable scoped controllers. Native rendering and behavior remain separate integration work.

The recovered controller didn't remove an existing `!important` priority when the new value matched the old value. The completed controller removes that priority while active and restores it on disposal. Tests cover exact restoration and subsequent application edits.

The recovered parser counted JavaScript code units against a “KiB” limit. The completed parser measures UTF-8 bytes. The completed option parser rejects explicit nulls consistently with the configuration schema. The native namespace rule avoids language keyword and built-in type collisions.

The new studio provides an inspectable, working demonstration rather than replacing hundreds of existing recipes blindly. It has no external font or image requests and no account, analytics, remote storage, or AI dependency.

## Deliberate limits

The existing Motion Atoms catalogue remains unchanged and continues to use its own runtime and legacy styling. The new studio links to it in a full repository checkout. This change does not claim that every old recipe has become theme-aware, keyboard-complete, or production-ready.

The static preview demonstrates a finite spring step at the existing base frequency, not a replacement animation scheduler. The original spring and SwiftUI engines remain unchanged.

Generated tokens are not native component parity, a shared binary interface, or a universal renderer. DTCG export is a resolved subset, not a general import/alias-resolution engine. CSS primitives require native HTML semantics and host behavior.

Color-pair audits aren't a conformance certification. The source ledger counts concrete token roles and implemented behaviors; it doesn't count theme permutations as separate improvements or promise a measured percentage gain.

## Release gates

The handoff report records the actual local commands, browser harness, compiler availability, and remaining checks. The pull-request workflow runs the full JavaScript suite and tracked-artifact drift checks, then the existing Swift package on macOS. No release, merge, permission change, or repository visibility change forms part of this work.

## Concurrent upstream work preserved

Before final submission, `main` advanced to `0dca69dc3aa0d2cd10f141ec64d2b4ef3ce6b027` through five commits. The branch incorporates those commits with a merge commit, retaining the new live spring/scheduler API, Swift LiveSpring, updated atom recipes, the library catalogue, and the added engine tests. The package conflict preserves `cieo/live` and expands the upstream CSS side-effect declaration to cover the new design styles. The final upgrade patch targets this newer base; those upstream engine and recipe changes are not counted among this change's 273 refinements.
