# One-command install and distribution — design

Date: 2026-10-13. Approach A (one package, bundled registry). Scope: make Cieo installable by anyone with one command, rivaling shadcn's setup experience, without changing the motion engine, design layer, controls, atoms, or the Swift package.

## Background

Cieo is a mature design system — spring engine (DOM/React and SwiftUI), ~171 React primitives, 73 design tokens with six brands, controls, a generated site, a studio, and a workbench. It is currently `"private": true`, `"license": "UNLICENSED"`, and installable only as `npm install github:civicsense2025/cieo#v0.3.0` from a private repo. Setup is manual: install, wire three CSS imports, read docs, copy usage by hand.

Locked decisions (brainstorming, 2026-10-13):

1. **Hybrid distribution.** The compiled package carries the motion engine (`cieo`, `cieo/dom`, `cieo/react`, `cieo/live`), tokens, design foundation (`cieo/design`), and controls. The 171 primitives ship as **source-copy** through a registry: `npx cieo add dialog` copies real TSX into the consumer's repo, which they own and edit.
2. **Public npm, MIT.** `private` flips off; an MIT LICENSE is added; the `civicsense2025` org owns the publish. `cieo` is unclaimed on npm (verified 2026-10-13).
3. **Launch targets.** Next.js App Router and Vite + React get the full experience; any other stack gets the tokens/design-only path (`--target html`). No other frameworks at launch.
4. **Docs site.** The existing generated site (component pages, catalogue) is hosted on GitHub Pages with a light catalogue cleanup and a quickstart strip. No landing-page redesign.

## Architecture

One package stays one package. Additive layout:

- `bin/cieo.mjs` — CLI entry. Zero runtime dependencies; Node ≥ 20 built-ins only (same culture as `scripts/export-theme.mjs`). `npx cieo init` resolves because bin name = package name.
- `cli/commands/` — one file per command: `init`, `add`, `list`, `diff`, `theme`, `doctor`.
- `cli/lib/` — framework/package-manager detection, registry resolution, import rewriting, prompt + TTY handling, file operations.
- `registry/` — generated, committed, shipped in `files[]`: `index.json` manifest plus exact component source copies.
- `scripts/build-registry.mjs` — the generator (with `--check` mode, matching `wire-primitives.mjs`).
- `scripts/check-registry.mjs` — parity and import-graph gate.

### Registry generation

Source of truth is `src/primitives/`. Each component directory holds exactly `<Name>.tsx`, `manifest.json`, `README.md` (verified: no other file types). Shared files at the directory root: `motion.ts` (shared by 6+ components); `index.ts` is the barrel and is excluded.

A new `scripts/lib/registry.mjs` extends the existing `scripts/lib/primitives.mjs` scanning with an import-edge scanner. Every import edge is classified:

| Edge | Example | Registry treatment |
| --- | --- | --- |
| Sibling primitive | `../Overlay/Overlay.js` | `registryDependencies`; copied transitively |
| Shared file | `../motion.js` | copied to components root, import unchanged |
| Motion engine | `../../react/index.js` (5 files), `../../dom/scroll.js` (1) | import rewritten to `cieo/react`, `cieo/dom` |
| Controls | `../../controls/{classes,Range,SearchField,Select,Toggles}.js` (8 files) | import rewritten to `cieo/controls` |
| `react` | peer | untouched |

Verified 2026-10-13: these are the only non-primitive import edges in `src/primitives/*/*.tsx`. No `core`, `live`, or `design` imports occur; if the scanner meets an unclassified edge, generation **fails loudly** rather than guessing.

`registry/index.json` per component: `id` (PascalCase, case-insensitive match), `files[]` (source path relative to `src/primitives/`), `registryDependencies[]`, `packageImports[]` (the `cieo/*` subpaths it will need), `docs` (site page URL), `manifest` (component version metadata). Generation is deterministic; CI runs `build-registry --check` plus `git diff --exit-code -- registry` inside `npm run check`, the same drift gate style as `dist/` and `wire-primitives`.

The per-component `manifest.json` `dependencies` field is **cross-checked against the scanner, not trusted** — Dialog's manifest says `dependencies: []` while its source imports `Overlay`. Mismatches fail the gate and get fixed as part of this work.

## The CLI

### `cieo.json`

Written by `init`, read by every other command; validated against `design/theme.schema.json`'s theme shape:

```json
{
  "version": 1,
  "target": "next",
  "componentsDir": "components/cieo",
  "alias": "@/components/cieo",
  "theme": { "brand": "iris", "scheme": "dark", "density": "comfortable", "radius": "soft" }
}
```

### `npx cieo@latest init`

1. **Detect**: `next.config.*` + `app/` → `next`; `vite.config.*` + React dep → `vite`; otherwise tokens-only (`html`), or explicit `--target`.
2. **Ask at most three questions**: brand (six), appearance (light/dark/system-resolved), components directory. Density and radius take documented defaults without asking. `--yes` plus flags makes it fully non-interactive for CI and agents.
3. **Install** `cieo` with the detected package manager (lockfile sniffing: npm, pnpm, yarn, bun); `--skip-install` writes everything but runs nothing.
4. **Wire styles** in a marker-delimited idempotent block (`/* cieo:start */ ... /* cieo:end */`): `next` → `app/layout.tsx` JS imports; `vite` → `src/main.tsx`; `html` → generated snippet printed, never edits unknown HTML. Order: `cieo/tokens.css`, `cieo/design.css`, `cieo/primitives.css`, `./cieo-theme.css`.
5. **Generate `cieo-theme.css`** from the chosen axes with the existing exporter (`toCSS`), so static theming needs no runtime JS. Runtime `applyTheme` stays documented as the dynamic path.
6. **Write `cieo.json`**, then end interactive mode by offering a starter component (Dialog recommended, any registry id, or skip) copied through the exact `add` path — so one interactive command leaves a working, themed component. `--with <id>` does the same non-interactively; `--no-starter` skips. Always print the docs link. Re-running detects existing config and offers update; it never silently clobbers.

### `npx cieo add <id>`

- Resolves case-insensitively with typo suggestions; prints the transitive set before copying.
- Preserves the source directory shape inside `componentsDir` (`components/cieo/Dialog/Dialog.tsx`, `components/cieo/Overlay/Overlay.tsx`, `components/cieo/motion.ts`), so relative sibling/shared imports stay valid verbatim. Only the hybrid-seam imports are rewritten (table above). Minimal rewriting is the design rule.
- `'use client'` banners travel with the files; `react` imports remain.
- Existing files: prompt overwrite / skip / diff; `--overwrite` and `--dry-run` for scripts. Adding an already-added component is a no-op unless it changed.
- Warns if the project's installed `cieo` version differs from the running CLI version.

### Supporting commands

- `list` — every component with copied/available status.
- `diff <id>` — local file vs registry.
- `theme key=value` — regenerate `cieo-theme.css` from `cieo.json`.
- `doctor` — package present and version-aligned, CSS imports wired in entry, config valid, registry drift (local copies vs installed version), tsconfig alias resolvable. Nonzero exit on failure, for CI.
- Non-TTY: prompts fall back to defaults; no command ever hangs waiting for input.
- Errors state cause and the fix command. TS is required for primitives (clear error otherwise); JS users still get the tokens path.

## Docs site

- `.github/workflows/pages.yml` (SHA-pinned actions, house style): run the existing site build chain, deploy `site/` to GitHub Pages.
- Component page footers rewrite the `data-install` line to `npx cieo add <Name>`; the import banner stays. README's install section becomes the quickstart.
- Catalogue top gets a quickstart strip (one command, 60-second result) and a light cleanup; no redesign, no marketing page.
- Swift install remains SwiftPM (already one step) in README and `docs/apple-components.md`.

## Repo readiness and release

- MIT `LICENSE` (copyright holder to confirm at review; default: Civic Sense).
- `package.json`: `private` off, `license: "MIT"`, `engines: { "node": ">=20" }`, `files[]` gains `bin/`, `cli/`, `registry/`. Version bumps to `0.4.0` for the release.
- README top: 60-second quickstart with the one command; existing detail restructured below.
- Minimal `CONTRIBUTING.md` (dev loop is `npm install && npm test`).
- `.github/workflows/release.yml` on `v*` tag: `npm ci` → `npm run check` → `npm pack --dry-run` sanity → `npm publish --provenance --access public` via npm trusted publishing (OIDC, no long-lived token).
- **Human steps (cannot be automated):** flip repo visibility to public; configure npm org ownership and trusted publisher; enable GitHub Pages. Listed as a checklist with the exact clicks at delivery.

## Testing and proof

- **Unit** (`node --test`, existing style): detection, config validation, edge classification, rewriting (including fail-loud on unknown edges), transitive resolution, idempotence, typo matching, non-TTY behavior.
- **Fixtures** (committed): `test/cli/fixtures/next-app`, `vite-react`, `static-html` — minimal but real apps.
- **End-to-end**: pack the real tarball (`npm pack`), install it into a temp copy of each fixture **from the tarball, not the working tree**, run `init --yes` (including `--with dialog` on the Vite fixture) and `add`, then assert: files copied with correct shape, zero package-territory imports remain, second run is a byte-for-byte no-op, `css` imports wired in the entry file. The Vite fixture compiles (`tsc --noEmit` + `vite build`); the Next fixture typechecks. No network beyond the local tarball.
- **Gates**: registry parity joins `npm run check`; the CLI suite is `npm run test:cli`, wired into `npm run check` so drift cannot merge.
- **The stranger test (acceptance)**: on a clean machine state, from the packed tarball: `npx cieo init --yes` in a fresh Vite app, `npx cieo add dialog`, build succeeds, theme visible. Run once by the implementing agent and once by a separate adversarial agent using only the README.

## Success criteria

1. A stranger with a Vite or Next app reaches a themed, working Cieo component with one interactive command (`npx cieo init`, answering the starter prompt — or `npx cieo init --with dialog`), and can keep adding components with `npx cieo add <id>`.
2. Any other stack reaches themed tokens with one command (`init --target html` snippet) and zero framework assumptions.
3. `registry/` can never disagree with `src/primitives/` — the drift gate enforces it.
4. `npm publish` produces a tarball whose contents are provably sufficient: the e2e tests only ever use that tarball.
5. Swift install is unchanged and documented.

## Out of scope

- Any change to the motion engine, design foundation, controls, atoms, or Swift package behavior.
- Other React frameworks (Remix, React Router); Tailwind integration; JS-only project support for primitives.
- Landing-page redesign; custom domain setup; shadcn-format registry interop (cheap fast-follow once the generator exists, explicitly not a dependency).
- Dynamic runtime theming UI; publishing the studio.

## Implementation lanes (preview for the plan step)

1. Registry generator + classification + gates (blocks 2 and 5).
2. CLI core: config, detection, rewriting, prompts, `add`/`list`/`diff`/`theme`/`doctor` (blocks 3).
3. `init` adapters per target (next / vite / html) (blocks 4).
4. Fixtures + e2e harness + CI wiring (depends on 2–3).
5. Docs site: Pages workflow, page footers, catalogue quickstart strip (independent).
6. Repo readiness: LICENSE, package.json, README, release workflow (independent).
7. Adversarial end-to-end stranger test from the packed tarball (last; separate agent from all builders).
