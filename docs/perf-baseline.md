# Perf baseline — Cieo (2026-10-14, worktree `perf-baseline`)

Env: macOS, node v22.22.2, no `node_modules` in worktree (react/ts deps
uninstalled). `npm run build` NOT run — it does `rm -rf dist` (read-only
mandate); `tsc --noEmit` used instead. No src/dist edits made.

## 1. Size table (bytes via `wc -c`, `du -sk`)

| entry | JS bytes | notes |
|---|---|---|
| dist/core | 7,254 | spring.js only |
| dist/dom | 20,616 | index.js 15,291 + scroll.js 5,325 |
| dist/react | 9,530 | index.js only |
| dist/live | 6,637 | scheduler 3,775 + channel 2,754 + index |
| dist/controls | 51,287 | largest: Select.js 12,625, Toggles 5,542 |
| dist/primitives | 101,288 | barrel 10,489; ~171 components |
| **dist JS total** | **196,612** | `find dist -name '*.js' \| xargs cat \| wc -c` |
| dist/ (all, du) | 1,640K | incl. .d.ts + css |

| css | bytes |
|---|---|
| dist/controls/controls.css | 24,559 |
| design/themes.css | 9,666 |
| design/primitives.css | 7,237 |
| tokens/tokens.css | 1,274 |
| **css total** | **42,736** |

| docs html | bytes |
|---|---|
| workbench.html | 3,243,715 |
| collection.html | 3,227,087 |
| catalogue.html / library.html | 3,175,205 each |
| agent-identity.html | 414,684 |
| controls.html / studio.html / studio/index.html | 46,285 / 58,899 / 11,280 |
| **docs html total** | **13,352,360 (~13.4 MB)** |
| docs/ (all, du) | 13,952K |

| misc | value |
|---|---|
| package.json `exports` count | 186 |
| src/primitives count | 171 |
| largest 3 dist files | dom/index.js (15,291), controls/Select.js (12,625), primitives/index.js (10,489) |

Pasted outputs:
```
$ du -sk dist dist/primitives docs → 1640 dist / 1388 dist/primitives / 13952 docs
$ wc -c … → 7254 spring.js / 15291 dom/index.js / 5325 scroll.js / 9530 react/index.js / 3775 frame-scheduler.js / 2754 spring-channel.js / 12625 Select.js / 3650 Button.js / 4823 Field.js / 1501 motion.js / 5308 listbox.js (total 71836)
```

## 2. Hot-path inventory (`grep -rn` on src/core, src/dom, src/react, src/controls, src/live)

| pattern | file:line |
|---|---|
| getBoundingClientRect | spring.ts:155; dom/index.ts:231,234,237,338; react/index.tsx:200,213; controls/Button.tsx:54; controls/Select.tsx:86 |
| querySelectorAll | dom/index.ts:16 (`list()` string path); controls/Select.tsx:137 (options per open) |
| Math.exp | spring.ts:29,33 (`resp`/`vel` per job per frame); spring.ts:104 (`prune` envelope); live/spring-channel.ts:42 |
| toFixed template write | dom/index.ts:67,68,69,266,267,364,389,390,392; controls/motion.ts:56 (`px`); controls/Range.tsx:29,35; controls/Select.tsx:143,144,145,148 |
| addEventListener / observers | spring.ts:222,223,224 (motion:change, visibilitychange, media); scroll.ts:49,79,116 (IntersectionObserver, motion:change, 4× input listeners); react/index.tsx:18,19,21 (MutationObserver, media, motion:change); controls/Field.tsx:79,80; controls/Select.tsx:72,127 |
| textContent / replaceChildren | dom/index.ts:171,172 (swap `put`); 282,288,298,309,311,331 (digits build/teardown); react/index.tsx:134,187 |
| scrollTo per frame | scroll.ts:93 (`go` closure), 117–122 (`step` calls `go(tx.at, ty.at)` every frame) |

## 3. Build time

`tsc -p tsconfig.json --noEmit` (pnpm tsc 5.9.3): **exit 2, 1188 errors, ~2 s wall**.
All errors are `TS2307 Cannot find module 'react'` + knock-on JSX `any` errors —
worktree has no `node_modules`; type baseline is unusable until `npm ci`.
`npm run build` deliberately not executed (destructive `rm -rf dist`).

## 4. Test baseline

`node --test test/*.test.mjs` tail:
```
# tests 942 / # pass 938 / # fail 2 / # skipped 2 / ~24.5 s
not ok 22 - test/controls.test.mjs  (ERR_MODULE_NOT_FOUND: 'react')
not ok 375 - dist primitives barrel resolves symbols as functions (same cause)
```
Both failures are missing-dep env failures, not code failures. No fixes applied.

## 5. Top-5 risks

1. **High** — `allowed()` per job per frame in `tick` (spring.ts:195) re-runs `state()` (matchMedia read + dataset + `document.hidden`) for every job each frame; cache per tick.
2. **High** — `paint` string churn + `blur()` filter (dom/index.ts:65–70, Select.tsx:145): per-frame template + `toFixed` + blur forces repaint; gate blur behind `BLUR`/progress threshold.
3. **Medium** — FLIP double-measure (dom/index.ts:231–237 + react/index.tsx:213): `before` snapshot in render phase then re-measure after mutate; forced sync layout on large lists.
4. **Medium** — render-phase measure in `useFlip` (react/index.tsx:212–214) reads layout during render; move to layout effect or `useSyncExternalStore`.
5. **Low** — 186 exports + unminified dist + 13.4 MB docs HTML (catalogue/library/workbench ~3.2 MB each): barrel re-exports hurt tree-shaking signals; docs pages need code-split/minify.
