# Docs page split proposal (route-level)

Status: proposal only — committed `docs/*.html` pages are untouched.

## Baseline (2026-10-14, bytes on disk)

- catalogue/library.html 3.18 MB, collection.html 3.23 MB, workbench.html 3.24 MB
- Each page inlines ONE giant `<script>` (~3.2 MB: runtime + all 409 recipe
  blocks concatenated by `scripts/build-library.mjs` / `build-collection.mjs`).

## Plan

1. Keep the standalone single-file pages as the offline/review fallback.
2. Add a `--split` builder mode emitting `docs/<page>/shell.html` + one
   `docs/<page>/recipes/<block>.js` per `blocks.json` entry, loaded with
   `<script async=false>` in `blocks.json` order (same pattern the existing
   `--linked` collection boot already uses: `atoms/web/catalogue/boot.js`).
3. Render above-the-fold tiles first; `IntersectionObserver` injects the
   remaining recipe scripts as tiles approach the viewport.
4. Workbench already supports `--source` external mode — reuse that shell.

## Estimated win

- Initial JS parse: ~3.2 MB → ~150 KB shell + on-demand chunks (~90% less
  main-thread parse on first paint; LCP dominated by first tile, not the
  409th). Caption pass already deferred to `requestIdleCallback`.
