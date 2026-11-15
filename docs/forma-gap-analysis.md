# Forma → Cieo gap analysis

Worktree: `cieo-forma-gaps` (branch `feat/forma-components`, from `origin/main`).
Forma reference (read-only): `.forma-gesso-worktrees/forma-design-spec` (`web/` + `docs/superpowers/specs/2026-11-15-forma-brand-redesign-design.md` + `docs/design/forma-redesign/*.png`).
Home-gallery revision applied: 4 columns, Vectorize as 2-column feature card, 4:3 cards, large hero illustration card with crosshair marks inside the card.
Cieo base: v0.6.4 (`58b8c6d`). Every "covered" verdict below was verified by reading the named source, not its file name.

## Verdicts

| # | Forma part | Cieo export (source read) | Verdict | Reasoning |
| --- | --- | --- | --- | --- |
| 1 | top bar | `TopNav` + `TopNavHeading` + `TopNavItem` (`src/primitives/TopNav*/`) | covered | Sticky header landmark with labelled nav; `TopNavItem` renders a real `<a>` with `aria-current="page"`. Scroll hairline and wordmark art stay host-owned. |
| 2 | segmented tool switcher with link semantics | `SegmentedControl` + `SegmentedControlItem` | covered with addition | The pill group contract is right, but items render `<button type="button">` only, so tool URLs lose link semantics (open-in-new-tab, href hover, crawler reachability). Addition: optional `href` on `SegmentedControlItem` renders `<a>` with `aria-current` when picked. |
| 3 | pill button set | `Button` + `buttonClassName` (`src/controls/`) | covered with addition | Variants (primary/secondary/ghost/text), sizes (sm/md), icon-only with enforced label, and pending/done morphs are all present; shape is driven by `--cieo-radius-control`, which Forma cannot turn pill-shaped without re-skinning every control. Addition: `shape: "pill"` on `Button` and `buttonClassName` (also covers link-styled actions). |
| 4 | icon button | `IconButton` | covered | Square icon-only button with mandatory `label`, native props pass-through, full hit target. Forma's 36 px circle is a theme size, not a new component. |
| 5 | drop zone (Choose button, drag-over, error) | `FileInput` | gap → `DropZone` | `FileInput` is a wrapping `<label>` + native input and its README explicitly disowns drag-and-drop ("that is a dropzone organism, not a FileInput"). No dropzone organism exists. Forma's contract needs an explicit `<button>` that calls `input.click()` (never implicit label activation), `dragenter/dragover/drop` handling, drag-over and error states, and a page-level navigation guard note. |
| 6 | file input | `FileInput` | covered | Native input, label-wrapped, `accept`/`multiple`/native form participation. |
| 7 | illustration tool card | `ClickableCard` + `AspectRatio` + `Thumbnail` | covered | Article card whose stretched link makes the whole card navigate; `AspectRatio` pins the 4:3 box; illustration art stays host-owned (crosshair marks included). |
| 8 | feature card | `ClickableCard` | covered | Same stretched-link card at 2-column span; "featured" sizing is grid placement, not a component. |
| 9 | settings panel and field | `FormLayout` + `Field` + `Section` | covered | Field grid, label + control + help/error row with `role="alert"`, titled sections. Mode segmented controls and native selects compose inside. |
| 10 | segmented control | `SegmentedControl` | covered | Controlled/uncontrolled single-select pill group with required accessible name. |
| 11 | native select styling | `Select` (`src/controls/Select.tsx`) | covered | Styled native select; becomes combobox/listbox with arrows, Home/End, type-ahead after hydration while the native select stays the form value source. |
| 12 | toggle | `Switch` (`src/controls/Toggles.tsx`) | covered | Native checkbox-role input with full form/keyboard/no-JS behavior. |
| 13 | slider | `Slider` (re-export of `Range`) | covered | Native range with drawn fill, spring follow on keyboard/track steps, `showValue` rolling readout via `Digits`. |
| 14 | number input with unit | `NumberInput` | covered with addition | Controlled/uncontrolled numeric input with null-on-empty, but no unit affordance; Forma pairs every range with an exact-value box plus unit (`WorkspaceRange`). Addition: optional `unit` prop rendering a suffix span. |
| 15 | before/after compare (curtain) | atom `194-compare` (recipe only) | gap → `CompareCurtain` | No React primitive owns a curtain: the recipe is blocks-runtime demo code, not a token-styled component. Forma needs a `slider`-role divider with `aria-valuetext`, keyboard arrows/Home/End, pointer drag, and reduced-motion jump. |
| 16 | image preview stage (checkerboard/backdrop, zoom, fit) | `Lightbox` / `Thumbnail` | gap → `PreviewStage` | `Lightbox` is a modal viewer; `Thumbnail` is a fixed-ratio `<img>`. Neither owns backdrop switching, zoom control, or fit/pan. Forma's stage needs backdrop variants, zoom in/out/reset/fit, and native-scroll panning. |
| 17 | result summary (size delta, dims) | `MetadataList` + `MetadataListItem` | covered | `<dl>` grid of term/description pairs; delta text and dimensions are host copy with `Digits`-ready values. |
| 18 | progress with label | `ProgressBar` | covered | Native `<progress>` with required `label`; inline text label is host copy next to it. |
| 19 | toast | `layer-toast` token only (+ recipe atoms `039-toast`, `374-undotoast`) | gap → `Toast` | No transient notification component exists: `Banner` is a persistent `role="status"` bar with no dismiss/exit contract, and the toast atoms are catalogue recipes, not token-styled React. Forma needs auto-dismiss with `onDone`, an optional recovery action, and enter/exit springs that collapse under reduced motion. |
| 20 | error banner with recovery action | `Banner` | covered | `role="status"` bar with title/body slots; host renders the recovery `<button>` (or pill `Button`) inside. |
| 21 | empty state | `EmptyState` | covered | Centered title + description + action slot with optional icon slot for the tool illustration. |
| 22 | footer | `LayoutFooter` | covered | Footer landmark, unstyled by design; content is host-owned. |
| 23 | disclosure menu ("More") | `MoreMenu` | covered | IconButton-triggered `DropdownMenu`; label defaults to "More actions". |
| 24 | dialog (agent sheet) | `Dialog` + `BottomSheet` | covered | Controlled modal with scrim, focus trap, Escape/scrim dismiss, enter/exit springs; sheet variant covers the mobile agent sheet. |
| 25 | video trim/clip range picker (start + length) | `Range` (single value only) | gap → `ClipRange` | No dual-value range exists. Forma's GIF trim needs labelled start + length sliders with a live duration readout; two native ranges keep keyboard, form, and AT behavior free. |
| 26 | color palette swatch row (vectorize colors) | `LegendItem` (single swatch + words) | gap → `PaletteSwatches` | `LegendItem` describes one swatch; no selectable multi-swatch row exists (atom `042-palette` is a recipe). Forma's recolor panel needs a radiogroup of fill swatches with per-swatch names/values. Native radios keep arrow-key behavior free. |
| 27 | batch list with per-item status | `List` + `ListItem` + `StatusDot` (+ `ProgressBar`) | covered | Rows with dividers compose with status dots and per-row progress; queue actions are host buttons. |
| 28 | kbd / shortcut help | `Kbd` | covered | One key/chord per `Kbd`; the help panel is host `<details>` + `<dl>` composition (as in Forma's `ShortcutHelp`). |
| 29 | hero illustration card | `Card` + `AspectRatio` | covered | Tinted ground with host line art; no component needed beyond the surface + ratio box. |

Expected result holds: 20 covered, 3 covered-with-addition, 6 gaps.

## Build plan (this branch)

New primitives (web React + CSS on Cieo motion + semantic tokens; no hardcoded colors):
`DropZone`, `CompareCurtain`, `PreviewStage`, `Toast`, `ClipRange`, `PaletteSwatches`.
Additions: `Button`/`buttonClassName` `shape: "pill"`; `SegmentedControlItem` `href`; `NumberInput` `unit`.
Forma theme: new `forma` brand preset (ink accent seeds) + documented `createTheme` recipe with audited overrides for surfaces, focus, font, and radii; audit recorded in `docs/forma-theme.md`.

Per-component requirements: `src/primitives/<Name>/<Name>.tsx` (`'use client'`, `slotProps`/`customizePart`, `MotionProps` where animated), `manifest.json`, `README.md`, `design/styles/primitives/<kebab>.css` (tokens only, hover guards, focus/disabled tokens, reduced-motion rule), `site/components/<Name>.html` doc page, registry + barrel + package-export regeneration via `wire-primitives` / `build-registry` / `build-component-pages` / `build-component-index`, behavior/keyboard/reduced-motion tests in `test/`, package.json export entry.

## Swift twin parity (follow-up, not this branch)

CieoUI carries Swift twins of several web molecules (e.g. web `SegmentedControl` ↔ `SegmentedControl.swift`, `LegendItem` ↔ `LegendItem.swift`). The six new web primitives have no Swift counterparts yet. If Forma's Apple clients need them, port in dependency order (`PaletteSwatches` → `SelectionChip`-style pills; `Toast` → `Notice`; `ClipRange` → dual `Slider`; `DropZone`/`PreviewStage`/`CompareCurtain` are pointer-heavy and need native gesture design first). No Swift twins are built here: the repo's web-addition path does not require them, and unsigned-simulator acceptance for six gesture components belongs in its own wave.
