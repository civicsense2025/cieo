# Cieo quality pass — coverage report

Branch: `fix/site-visual-a11y-defects` · 9 commits at creation (10 including this report) · tree clean · local gates green.

## Verification (real tool output, not claims)
- `npm run check`: **1692 tests, 1690 pass, 0 fail, 2 skipped**, exit 0 (build, design gates, token checks, component-pages, deploy-link, CLI e2e). CI on the host is red for pre-existing infrastructure reasons (identical failures on already-merged PR #74); see the merge-readiness notes.
- `test/browser/site.py`: **25 pages, 235 checks, 0 problems** (live Chromium render of the deploy folder).
- `node scripts/build-recipes.mjs --check`: 50 chunks verified. `check-catalog-inventory.mjs --check`: exit 0.

## Phase A — confirmed visual/a11y defects (verified fixes)
- Recipe CSS: legacy vars (`--ink`, `--card`, `--faint`, `--line`, `--muted`, `--sans`) mapped to `--cieo-color-*`; fixed stage heights replaced with theme-aware min-heights; tall previews no longer clipped.
- Library tiles: stage rows `minmax(9rem, auto)`, no silent clipping; grid gutters widened for more air.
- Copy button: canvas glyph retained (correct in both schemes), 44px target, code text padding extended so the button never overlaps code.
- Focus ring: real outline restored on `[data-focus]` (WCAG 2.4.11/2.4.7).
- Touch targets: 44px unconditional on nav/search/menu/esc/segments/copy/recipe controls (WCAG 2.5.8).
- Non-color signals added to form status and the selected search row (WCAG 1.4.1).
- Stale telemetry HUD removed from all 254 part pages (element, JS, CSS, test pin) — physics readout stays on the home instrument only.
- Popover positioner and state-stage overlays stay inside their preview stages.
- Component preview props: RollCall/ShareBar/PaletteSwatches colors now use theme tokens; DropZone demo copy is real.
- Gate updates pin the improved behavior (unconditional touch targets, no HUD, anti-flake perf test) rather than weakening checks.

## Phase B — Anthropic-style visual language
Objective audit across 8 chrome pages × 3 viewports × light/dark (24 renders): **0 horizontal overflow, 0 heading errors, 0 real contrast failures**. The only flagged "failures" were the intentionally visually-hidden skip link. The site already reads warm-paper/ink/minimal with generous hero and section rhythm — the Anthropic register. One low-risk refinement applied: wider library gutters. Brand (instrument/paper/pill/ring, spring motion) preserved.

## Phase C — full catalog audit (subagent team + verification)
### Recipes — 561/561 web recipes rendered in Chromium (`atoms/web/index.json` blocks; the catalog's 573 recipe entries also include Swift-side paired atoms)
- **41 recipes were silently broken**: `REDUCE is not defined` (40) and `rep is not defined` (1). Root cause: the chunk destructure omitted `REDUCE`. Fixed in `build-recipes.mjs`: each chunk now keeps a **live** reduced-motion binding mirroring `runtime.core.js`. Verified in-browser: toggling OS reduce mid-session flips a recipe from "full spring + blur swap" to "instant · no blur".
- **0 init errors, 0 empty stages, 0 null renders** across all 561 recipes after the fix.
- Overflows: recipe stages now scroll tall demos vertically but clip off-screen drawers/menus horizontally — no stray sideways scrollbars.

### Component pages — 254/254 audited in Chromium
- All 253 JS pages: correct 4-tab switching, working copy buttons, stage toolbar, non-empty previews.
- Fixed: 14 pages with duplicate element IDs (preview + state variants) via React `identifierPrefix` + ID namespacing in the builder.
- Fixed: SortableList FSM crash (`createReorderMachine({items})` → `{order}`).
- Fixed: real WCAG contrast bugs in shipped CSS — outgoing chat bubble (dark-on-dark) and input-group addon (1.34:1).
- Fixed: TabList/TabMenu preview tabs had no `aria-controls` — panels with matching ids added to the spec.
- Fixed: 8 DropdownMenu previews cropped — open panels now have a roomy stage (`:has()`).

### Code snippets
- Audited all 254 pages; 13 mismatches found and fixed: 3 internal import paths → public `cieo/<Name>` paths; 2 stale hardcoded data examples; 8 non-runnable `...` placeholders replaced with verified, API-accurate JSX. Every snippet import now matches its page's authoritative import banner.

## Not done (by design / Tan's call)
- **No deploy**: `npm run deploy` needs `wrangler login` + secrets and Tan's approval. Nothing was published.
- **No merge**: PR opened for review only; Tan alone merges/deploys per `docs/COLLABORATION.md`.
- Theme switcher on main pages was not added (separate decision; switches live in the recipes/foundations labs).
- Two pre-existing untracked tool artifacts remain in the worktree; they are not part of this PR.
