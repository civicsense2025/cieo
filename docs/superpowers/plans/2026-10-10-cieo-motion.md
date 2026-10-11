# Motion in Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every primitive honors motion tokens + reduced motion, twelve animated components take closed motion props, and six move on real springs — with zero new dependencies.

**Architecture:** Task 0 (controller-native) lands the shared contract: `src/primitives/motion.ts` (MotionProps/MotionChoice/motionAttrs), `design/styles/primitives/motion.css` (entering keyframes + kill-switch), `usePresence`/`useEdges` disabled options, and the token gate script. Wave 1 (10 parallel family agents) audits all 154 and adds props where things animate. Wave 2 (8 agents) implements the six springs plus docs-regen and a verify sweep.

**Tech Stack:** React 18+ (`react-jsx`), TypeScript strict, existing Cieo spring engine (`src/core/spring.ts`, `src/controls/motion.ts`, `cieo/react`, `cieo/dom`), Node `node:test`. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-10-cieo-motion-design.md`

## Global Constraints

- No new runtime dependency. No raw milliseconds: durations live in `var(--motion-…)` tokens or their fallbacks only.
- Critically-damped character is preserved: no overshoot, no bounce curves, no new easing tokens.
- Reduced motion (OS setting or `data-motion="reduced"`) forces end states in CSS *and* JS. `data-motion="full"` remains the only override.
- Static components get no motion props. Props exist only where something animates.
- Host owns open state, persistence, filtering, positioning-flip, and drag. Components own structure, semantics, and springs.
- `dist/` remains committed. `npm run check` stays green throughout.
- Agents never run `npm run build` / `npm test` (both rebuild `dist/`) and never touch `dist/`; type proof is `npx tsc -p tsconfig.json --noEmit`. Only the integrator builds.
- Lanes touch only their own component dirs + their own test file + their components' doc pages. Shared files (barrel, package.json, primitives.css, exports test, generators, `src/react/index.tsx` except Task 0, engine files except Task 0) are integrator-owned.

## Review Focus

1. **Reduced-motion user sees a JS spring animate** — engine settles instantly when disallowed, but only if the component routes through `allowed()`/`run()`/helpers. Pinned: each spring task asserts disallowed → end state via `setMotionState` + `Track`/`Driver` in node (Task 11–16 step style below).
2. **`motion={false}` still transitions** — the CSS kill-switch must catch every property the component animates. Pinned: Task 0 tests the `[data-motion='off']` rule exists; each wave-1 prop test asserts `motionAttrs` spread on the root.
3. **Dialog closed mid-exit never unmounts (or unmounts twice)** — exit must always settle exactly once. Pinned: Task 13 asserts rapid open→close→open settles mounted with one `done` (node `Track` retarget test in that task's step style).
4. **Retarget mid-flight jumps instead of continuing** — indicator/scroll springs must be continuous across retargets. Pinned: Task 11 asserts `Track.at()` continuity across `set()` (node, no DOM).
5. **Enter animation flashes on first paint** — CSS entering runs pre-paint only if attributes are in SSR HTML with `both` fill. Pinned: Task 0 asserts fill mode + attribute-in-initial-JSX markers.

---

### Task 0: Motion foundation (controller-native, before any wave)

**Files:**
- Create: `src/primitives/motion.ts`
- Create: `design/styles/primitives/motion.css`
- Create: `scripts/check-motion-tokens.mjs`
- Create: `test/motion-foundation.test.mjs`
- Modify: `src/react/index.tsx` (add `disabled` to `usePresence` + `useEdges` only)
- Run: `node scripts/wire-primitives.mjs` (picks up motion.css import; expect no other diff)

**Interfaces:**
- Consumes: `S`, `Track`, `allowed`, `run`, `setMotionState` from `../core/spring.js`; `--motion-duration-snap/base`, `--motion-ease-spring`, `--motion-drift` tokens.
- Produces (exact names wave tasks import): `MotionChoice`, `MotionProps`, `MotionAttrs`, `motionAttrs(o)` from `'../motion.js'` (one level up from any component dir); CSS contract `[data-motion]`, `[data-entering]`, `[data-exiting]`; `usePresence(open, opts & {disabled?})`; `useEdges(ref, key, opts?: {disabled?})`.

- [ ] **Step 1: Write `src/primitives/motion.ts`**

```ts
/* Shared motion contract for primitives. Components that animate set data attributes
   (or take MotionProps); design/styles/primitives/motion.css owns every rule. */
export type MotionChoice = 'none' | 'fade' | 'rise' | 'scale';
export interface MotionProps {
  /** False renders the end state instantly. Defaults to true. */
  motion?: boolean;
  /** Entering behavior. Default is set per component. */
  entering?: MotionChoice;
  /** Exiting behavior. Defaults to the entering value. */
  exiting?: MotionChoice;
}
export interface MotionAttrs {
  'data-motion': 'on' | 'off';
  'data-entering'?: MotionChoice;
  'data-exiting'?: MotionChoice;
}
export function motionAttrs(o: MotionProps = {}): MotionAttrs {
  if (o.motion === false) return { 'data-motion': 'off' };
  const attrs: MotionAttrs = { 'data-motion': 'on' };
  if (o.entering !== undefined) attrs['data-entering'] = o.entering;
  if (o.exiting !== undefined) attrs['data-exiting'] = o.exiting;
  return attrs;
}
```

- [ ] **Step 2: Write `design/styles/primitives/motion.css`**

```css
@layer cieo.components {
  :where(.cieo)[data-motion='off'], :where(.cieo)[data-motion='off'] * { animation: none !important; transition: none !important; }
  :where(.cieo)[data-entering='fade'] { animation: cieo-enter-fade var(--motion-duration-snap, 200ms) var(--motion-ease-spring, cubic-bezier(.2,.15,.2,1)) both; }
  :where(.cieo)[data-entering='rise'] { animation: cieo-enter-rise var(--motion-duration-base, 300ms) var(--motion-ease-spring, cubic-bezier(.2,.15,.2,1)) both; }
  :where(.cieo)[data-entering='scale'] { animation: cieo-enter-scale var(--motion-duration-snap, 200ms) var(--motion-ease-spring, cubic-bezier(.2,.15,.2,1)) both; }
  :where(.cieo)[data-entering='none'] { animation: none; }
  @keyframes cieo-enter-fade { from { opacity: 0; } }
  @keyframes cieo-enter-rise { from { opacity: 0; transform: translateY(var(--motion-drift, 4px)); } }
  @keyframes cieo-enter-scale { from { opacity: 0; transform: scale(0.96); } }
  @media (prefers-reduced-motion: reduce) {
    :root:not([data-motion='full']) :where(.cieo)[data-entering] { animation: none; }
  }
}
```

The single sanctioned `!important` is the explicit off switch; it beats component transitions by design, documented here.

- [ ] **Step 3: Add `disabled` to `usePresence` + `useEdges` in `src/react/index.tsx`**

```tsx
export function useEdges(indicator: RefObject<Element | null>, key: unknown, opts?: { disabled?: boolean }): void {
  const last = useRef<{ left: number; right: number } | null>(null);
  useIso(() => {
    const el = indicator.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const prev = last.current;
    last.current = { left: r.left, right: r.right };
    if (prev && !opts?.disabled) return edges(el, prev, undefined);
  }, [key]);
}
```

```tsx
export function usePresence<T extends HTMLElement>(open: boolean, opts: PresenceOptions & { disabled?: boolean } = {}): { mounted: boolean; ref: RefObject<T | null> } {
  const [mounted, setMounted] = useState(open);
  const ref = useRef<T>(null);
  const cancel = useRef<Cancel | null>(null);
  if (opts.disabled) {
    if (mounted !== open) setMounted(open);
  } else if (open && !mounted) setMounted(true);
  useIso(() => {
    if (opts.disabled) return;
    const el = ref.current;
    if (!el) return;
    cancel.current = open ? enter(el, opts) : exit(el, { ...opts, done: () => setMounted(false) });
  }, [open, mounted]);
  useIso(() => () => cancel.current?.(), []);
  return { mounted, ref };
}
```

- [ ] **Step 4: Write `scripts/check-motion-tokens.mjs`** (fails on raw durations outside token fallbacks)

```js
// Fails on raw durations (12ms, 0.8s) in primitive CSS/tsx, except inside
// var(--motion-…) fallbacks, comments, and non-time units (px, deg, rem).
import { readdirSync, readFileSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
function stripTokenFallbacks(s) {
  let prev = '';
  while (prev !== s) {
    prev = s;
    s = s.replace(/var\(--motion-[\w-]+\s*,\s*[^()]*\)/g, 'var(--motion-x)');
  }
  return s;
}
let failures = 0;
function scan(path, text) {
  const clean = stripTokenFallbacks(stripComments(text));
  for (const m of clean.matchAll(/(?<![\w.-])(\d+(?:\.\d+)?)(ms|s)\b/g)) {
    const line = clean.slice(0, m.index).split('\n').length;
    console.error(`${path}:${line}: raw duration ${m[0]}`);
    failures += 1;
  }
}
function walk(dir, exts) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p, exts);
    else if (exts.some((x) => p.endsWith(x))) scan(p, readFileSync(p, 'utf8'));
  }
}
walk(`${root}/design/styles/primitives`, ['.css']);
walk(`${root}/src/primitives`, ['.css', '.tsx']);
if (failures) process.exit(1);
console.log('motion tokens: clean');
```

- [ ] **Step 5: Write `test/motion-foundation.test.mjs`**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { motionAttrs } from '../dist/primitives/motion.js';
import { Track, run, setMotionState } from '../dist/core/spring.js';

test('motionAttrs defaults to on with no keys', () => {
  assert.deepEqual(motionAttrs(), { 'data-motion': 'on' });
});
test('motionAttrs(false) kills everything with no behavior keys', () => {
  assert.deepEqual(motionAttrs({ motion: false }), { 'data-motion': 'off' });
});
test('motionAttrs passes entering/exiting through', () => {
  assert.deepEqual(motionAttrs({ entering: 'rise', exiting: 'fade' }),
    { 'data-motion': 'on', 'data-entering': 'rise', 'data-exiting': 'fade' });
});
test('kill-switch rule exists with fill-mode entering rules', () => {
  const css = readFileSync('design/styles/primitives/motion.css', 'utf8');
  assert.match(css, /\[data-motion='off'\]/);
  assert.match(css, /both/);
  assert.match(css, /prefers-reduced-motion/);
});
test('disallowed engine work finishes at end state (Review Focus 1)', () => {
  setMotionState(() => ({ reduced: true }));
  let finished = false;
  run({ kind: 'feedback', step: () => true, finish: () => { finished = true; } });
  assert.equal(finished, true);
  setMotionState(null);
});
test('retargeted Track stays continuous (Review Focus 4)', () => {
  const tr = new Track(0);
  tr.set(100, { w: 22 }, 0);
  const mid = tr.at(0.1);
  tr.set(200, { w: 22 }, 0.1);
  assert.ok(Math.abs(tr.at(0.1) - mid) < 1e-9);
  assert.equal(tr.at(1000), 200);
});
```

- [ ] **Step 6: Wire the gate into `package.json` check script** — append `&& node scripts/check-motion-tokens.mjs` after the pages check so the token gate runs in CI. Exact edit: in the `"check"` script string, replace `node scripts/build-component-pages.mjs --check && git diff` with `node scripts/build-component-pages.mjs --check && node scripts/check-motion-tokens.mjs && git diff`.
- [ ] **Step 7: Run `node scripts/wire-primitives.mjs` (expect only motion.css import added), then `npm run build`, then `node --test test/motion-foundation.test.mjs` — expect PASS, then commit pathspec-limited (motion.ts, motion.css, gate script, react/index.tsx, package.json, test file, dist/primitives/motion.*, dist/react/index.*).**

## Wave 1 shared pattern (repeated verbatim in Tasks 1–10)

Full-trio component (Tooltip, HoverCard, DropdownMenuSubMenu, Dialog, BottomSheet, Lightbox):

```tsx
import { motionAttrs, type MotionProps } from '../motion.js';
export interface TooltipProps extends MotionProps {
  text: string;
  children: ReactNode;
}
export function Tooltip({ text, children, motion, entering = 'fade', exiting = 'fade' }: TooltipProps) {
  return (<span className="cieo cieo-p-tooltip" {...motionAttrs({ motion, entering, exiting })}>…
```

Motion-only component (Spinner, Skeleton, TabList, TabMenu, Pagination, Carousel — `motion` only, no entering/exiting):

```tsx
export function Spinner({ label = 'Loading', size = 'md', motion }: SpinnerProps & { motion?: boolean }) {
  return (<span role="status" aria-label={label} data-size={size} data-motion={motion === false ? 'off' : undefined} className="cieo cieo-p-spinner">…
```

Manifest additions (animated components only):

```json
{ "id": "motion", "type": { "kind": "boolean" }, "required": false, "nullable": false, "default": true, "constraints": {} },
{ "id": "entering", "type": { "kind": "enum", "values": ["none", "fade", "rise", "scale"] }, "required": false, "nullable": false, "default": "fade", "constraints": {} },
{ "id": "exiting", "type": { "kind": "enum", "values": ["none", "fade", "rise", "scale"] }, "required": false, "nullable": false, "default": "fade", "constraints": {} }
```

Plus `platforms[0].properties` gains the new ids, `constraints.motion` gains behavior strings (e.g. `["fade-on-snap", "honor-render-policy"]`). Motion-only components list just `motion`.

README Motion section (fill in the behavior + token):

```md
## Motion
Animates on <token> via the `entering` behavior; `motion={false}` renders the end state instantly. Reduced motion (OS setting or `data-motion="reduced"`) always resolves end states.
```

Family audit test (exact shape, dirs filled per task):

```js
test('<family> animations are token-driven and guarded', () => {
  for (const dir of [<dirs>]) {
    const cssPath = `design/styles/primitives/${dir.toLowerCase()}.css`;
    if (!existsSync(cssPath)) continue;
    const css = readFileSync(cssPath, 'utf8');
    if (/(animation|transition|@keyframes)/.test(css)) {
      assert.ok(css.includes('var(--motion-') || css.includes('prefers-reduced-motion'), `${dir} animates without token or guard`);
    }
  }
});
```

Contract test per animated component (exact shape, names filled per task):

```js
test('<Name> exposes motion contract (Review Focus 2)', () => {
  const src = readFileSync('src/primitives/<Name>/<Name>.tsx', 'utf8');
  assert.match(src, /motionAttrs\(\{ motion/);
  const m = JSON.parse(readFileSync('src/primitives/<Name>/manifest.json', 'utf8'));
  assert.ok(m.properties.find((p) => p.id === 'motion'));
});
```

Each wave-1 task also updates its components' `site/components/<Name>.html` props tables (one row per new prop) and runs `test/motion-<family>.test.mjs` green before committing (≤3 commits, pathspec-limited to family dirs + family test + family pages).

### Task 1: content family (24 dirs)

Dirs: Avatar, AvatarGroup, AvatarGroupOverflow, AvatarStatusDot, Badge, Text, AvatarGroup? No — AvatarGroup lives in its own dir. Full list: Avatar, AvatarGroup, AvatarGroupOverflow, AvatarStatusDot, Badge, Text, Icon, Kbd, Code, CodeBlock, Heading, Blockquote, Citation, Markdown, Thumbnail, Token, StatusDot, EmptyState, Banner, Timer, Timestamp, Skeleton, AvatarGroup? Count check: wave-3 content lane had 19 (Avatar, AvatarGroupOverflow, AvatarStatusDot, Icon, Kbd, Code, CodeBlock, Heading, Blockquote, Citation, Markdown, Thumbnail, Token, StatusDot, EmptyState, Banner, Timer, Timestamp, Skeleton) + leftovers AvatarGroup, Badge, Text = 22. (Spinner/ProgressBar belong to stage-b — see Task 10.) So 22 dirs.
Prop work: Skeleton only (motion-only pattern) plus one exact fix — `design/styles/primitives/skeleton.css` line 7 `animation: cieo-p-skeleton-pulse 1.5s ease-in-out infinite` becomes `animation: cieo-p-skeleton-pulse calc(var(--motion-duration-lazy, 740ms) * 2) ease-in-out infinite` (preserves ~period, gains global retiming; zeroes under reduced motion via tokens). Fix nothing else unless audit test fails.
Test file: `test/motion-content.test.mjs` (audit test with the 22 dirs + Skeleton contract test).

### Task 2: form family (18 dirs)

Dirs: CheckboxInput, CheckboxList, CheckboxListItem, RadioList, RadioListItem, FileInput, NumberInput, Calendar, DateInput, DateRangeInput, DateTimeInput, TimeInput, InputGroup, InputGroupText, FieldStatus, PowerSearch, Field, Slider. All audit-only (no animated components expected; if audit test names one, add motion-only prop + contract test and note it in the report).
Test file: `test/motion-form.test.mjs`.

### Task 3: layout family (18 dirs)

Dirs: Section, Center, AspectRatio, FormLayout, Grid, GridSpan, Layout, LayoutContent, LayoutHeader, LayoutFooter, LayoutPanel, HStack, VStack, StackItem, ScrollableArea, AppShell, Stack, Divider. All audit-only.
Test file: `test/motion-layout.test.mjs`.

### Task 4: menus family (19 dirs)

Dirs: ToggleButton, ToggleButtonGroup, DropdownMenu, DropdownMenuItem, DropdownMenuGroup, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuDivider, DropdownMenuSubMenu, MoreMenu, SegmentedControl, SegmentedControlItem, Tab, TabList, TabMenu, ButtonGroup, IconButton, Toolbar.
Prop work: DropdownMenuSubMenu (full trio, defaults fade/fade — its CSS hover-reveal gains data attrs; keep existing reveal CSS, add data-entering hook only if missing), TabList (motion-only). TabMenu is audit-only (no animation exists to configure — a motion prop there would be decorative).
Test file: `test/motion-menus.test.mjs` (audit + 3 contract tests).

### Task 5: command family (17 dirs)

Dirs: CommandPalette, CommandPaletteInput, CommandPaletteList, CommandPaletteItem, CommandPaletteGroup, CommandPaletteEmpty, CommandPaletteFooter, Popover, HoverCard, Selector, SelectorOption, MultiSelector, ComplexSelector, Typeahead, TypeaheadItem, Tokenizer, OverflowList.
Prop work: HoverCard (full trio, defaults fade/fade).
Test file: `test/motion-command.test.mjs`.

### Task 6: table family (16 dirs)

Dirs: Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell, TableFooter, TableSelectionToolbar, MetadataList, MetadataListItem, TreeList, ResizeHandle, Collapsible, CollapsibleGroup, List, ListItem. All audit-only.
Test file: `test/motion-table.test.mjs`.

### Task 7: nav-a family (9 dirs)

Dirs: TopNav, TopNavItem, TopNavHeading, TopNavMenu, TopNavMegaMenu, TopNavMegaMenuItem, TopNavMegaMenuFeaturedCard, Breadcrumbs, BreadcrumbItem. All audit-only.
Test file: `test/motion-nav-a.test.mjs`.

### Task 8: nav-b family (13 dirs)

Dirs: SideNav, SideNavItem, SideNavHeading, SideNavSection, SideNavCollapseButton, MobileNav, MobileNavToggle, NavIcon, NavHeadingMenu, Outline, Stepper, Step, Pagination.
Prop work: Pagination (motion-only).
Test file: `test/motion-nav-b.test.mjs` (audit + Pagination contract test).

### Task 9: stage-a family (8 dirs)

Dirs: Dialog, DialogHeader, AlertDialog, BottomSheet, BottomSheetSwitcher, Lightbox, Tooltip, Overlay.
Prop work: Tooltip (full trio, fade/fade), Dialog, BottomSheet, Lightbox (full trio, rise/rise — wave 2 implements springs behind these props; wave 1 adds props + manifest + tests + docs only, behavior unchanged).
Test file: `test/motion-stage-a.test.mjs` (audit + 4 contract tests).

### Task 10: stage-b family (14 dirs)

Dirs: ChatMessage, ChatMessageBubble, ChatMessageList, ChatMessageMetadata, ChatSystemMessage, ChatComposer, ChatComposerInput, ChatLayout, Card, ClickableCard, SelectableCard, Carousel, Spinner, ProgressBar.
Prop work: Carousel (motion-only), Spinner (motion-only; replace `0.8s` with `var(--motion-duration-lazy, 740ms)` — preserves period, gains global retiming).
Test file: `test/motion-stage-b.test.mjs` (audit + 2 contract tests).

## Wave 2: springs (Tasks 11–16 parallel, disjoint files) + docs + verify

### Task 11: TabList indicator spring

**Files:** Modify `src/primitives/TabList/TabList.tsx`, `src/primitives/Tab/Tab.tsx`; Test `test/motion-spring-tablist.test.mjs`; docs pages for TabList.
**Interfaces:** Consumes `useEdges(ref, key, {disabled})`, `useReducedMotion()` from `'../../react/index.js'`; `TabContext` (extended with `registerTab`); produces sliding indicator other tabs observe.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Track, setMotionState } from '../dist/core/spring.js';

test('indicator tracks selection through context registration', () => {
  const src = readFileSync('src/primitives/TabList/TabList.tsx', 'utf8');
  assert.match(src, /useEdges\(indicatorRef, current/);
  assert.match(src, /registerTab/);
  const tab = readFileSync('src/primitives/Tab/Tab.tsx', 'utf8');
  assert.match(tab, /registerTab\(value, el\)/);
});
test('retarget mid-flight continues without jumping (Review Focus 4)', () => {
  const tr = new Track(0);
  tr.set(100, { w: 22 }, 0);
  const mid = tr.at(0.05);
  tr.set(40, { w: 22 }, 0.05);
  assert.ok(Math.abs(tr.at(0.05) - mid) < 1e-9);
  assert.equal(Math.round(tr.at(1000)), 40);
});
test('disallowed motion resolves end state (Review Focus 1)', () => {
  setMotionState(() => ({ reduced: true }));
  const tr = new Track(0);
  tr.jump(100);
  assert.equal(tr.at(999), 100);
  setMotionState(null);
});
```

- [ ] **Step 2: Run to verify it fails** — `node --test test/motion-spring-tablist.test.mjs`, expect FAIL (no useEdges/registerTab).
- [ ] **Step 3: Implement** — extend `TabContextValue` with `registerTab?: (value: string, el: HTMLButtonElement | null) => void`; TabList keeps `tabsRef = useRef(new Map())`, measures selected tab in layout effect (offsetLeft/offsetWidth → indicator style state), listens resize to re-measure, renders `<span ref={indicatorRef} className="cieo-tab-indicator" style={{ left, width }} />`, calls `useEdges(indicatorRef, current, { disabled: motion === false })`; Tab registers its button when selected (`registerTab(value, el)` in layout effect, unregister on unmount); TabList takes `motion?: boolean` (motion-only pattern). Resize listener re-measures selected tab.
- [ ] **Step 4: Run test — expect PASS.** Then `npm run build` (tsc proves types).
- [ ] **Step 5: Commit** pathspec-limited to TabList/, Tab/, test file, TabList page.

### Task 12: Pagination digit roll

**Files:** Modify `src/primitives/Pagination/Pagination.tsx`; Test `test/motion-spring-pagination.test.mjs`.
**Interfaces:** Consumes `Digits` from `'../../react/index.js'`; produces rolling current-page numeral.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('current page rolls on change', () => {
  const src = readFileSync('src/primitives/Pagination/Pagination.tsx', 'utf8');
  assert.match(src, /<Digits value=\{page\} kind="feedback" \/>/);
  assert.match(src, /key="current-page"/);
});
test('motion=false renders a plain numeral', () => {
  const src = readFileSync('src/primitives/Pagination/Pagination.tsx', 'utf8');
  assert.match(src, /motion === false \? p : <Digits/);
});
```

- [ ] **Step 2: Run to verify it fails** — expect FAIL.
- [ ] **Step 3: Implement** — add `motion?: boolean` prop; current-page button gets `key="current-page"` (stable identity across pages so React reuses the element) rendering `motion === false ? p : <Digits value={page} kind="feedback" />`; other buttons unchanged. Manifest + README Motion section + page update.
- [ ] **Step 4: Run test — expect PASS**, plus `npx tsc -p tsconfig.json --noEmit` for type proof (never `npm run build` / `npm test` — both rebuild `dist/`, which is integrator-owned; parallel agents must not race on it).
- [ ] **Step 5: Commit** pathspec-limited.

### Task 13: Dialog enter/exit springs (pattern owner for 14–15)

**Files:** Modify `src/primitives/Dialog/Dialog.tsx`; Test `test/motion-spring-dialog.test.mjs`.
**Interfaces:** Consumes `usePresence(open, {disabled})` from `'../../react/index.js'`, `motionAttrs` from `'../motion.js'`; produces mounted/panel-ref contract BottomSheet/Lightbox copy (Tasks 14–15 read this task's diff, not its files).

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Track } from '../dist/core/spring.js';

test('dialog stays mounted through exit (Review Focus 3)', () => {
  const src = readFileSync('src/primitives/Dialog/Dialog.tsx', 'utf8');
  assert.match(src, /const \{ mounted, ref \} = usePresence\(open \?\? false, \{ disabled: motion === false \}\)/);
  assert.match(src, /if \(!mounted\) return null/);
  assert.match(src, /ref=\{ref\}/);
});
test('rapid toggle settles exactly once', () => {
  const tr = new Track(0);
  tr.set(1, { w: 22 }, 0);
  tr.set(0, { w: 34 }, 0.05);
  tr.set(1, { w: 22 }, 0.1);
  assert.equal(Math.round(tr.at(1000)), 1);
  assert.ok(tr.prune(1000) === 0);
});
test('entering choice selects presence origin', () => {
  const src = readFileSync('src/primitives/Dialog/Dialog.tsx', 'utf8');
  assert.match(src, /from: entering === 'fade' \? \{[^}]*y: 0/s);
});
```

- [ ] **Step 2: Run to verify it fails** — expect FAIL.
- [ ] **Step 3: Implement** — exact replacement component:

```tsx
// src/primitives/Dialog/Dialog.tsx
'use client';
/* Dialog. Controlled modal panel over a scrim. Springs in on open; plays the exit spring before unmounting on close. Host owns open state. */
import type { KeyboardEvent, ReactNode } from 'react';
import { usePresence } from '../../react/index.js';
import { Overlay } from '../Overlay/Overlay.js';
import { motionAttrs, type MotionProps } from '../motion.js';

export interface DialogProps extends MotionProps {
  /** Accessible name for the dialog (e.g. "Rename file"). Required. */
  label: string;
  /** Whether the dialog is open. Plays exit before unmounting when closed. */
  open?: boolean;
  /** Called on Escape or host close affordances. Optional. */
  onClose?: () => void;
  children: ReactNode;
}

const ORIGINS = {
  fade: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
  rise: { x: 0, y: 4, scale: 1, opacity: 0, blur: 0 },
  scale: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 },
} as const;

export function Dialog({ label, open, onClose, children, motion, entering = 'rise', exiting = 'rise' }: DialogProps) {
  const origin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
  const { mounted, ref } = usePresence(open ?? false, { disabled: motion === false, from: origin });
  if (!mounted) return null;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose?.();
  };
  void exiting;
  return (
    <>
      <Overlay />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} onKeyDown={onKeyDown} className="cieo cieo-dialog" {...motionAttrs({ motion, entering, exiting })}>
        {children}
      </div>
    </>
  );
}
```

`void exiting` documents the CSS/data-attribute side; exiting still ships in data attributes for hosts. Manifest + README Motion section + page update.

- [ ] **Step 4: Run test — expect PASS**, plus `npx tsc -p tsconfig.json --noEmit` for type proof (never `npm run build` / `npm test` — both rebuild `dist/`, which is integrator-owned; parallel agents must not race on it).
- [ ] **Step 5: Commit** pathspec-limited to Dialog/, test file, Dialog page.

### Task 14: BottomSheet enter/exit springs

**Files:** Modify `src/primitives/BottomSheet/BottomSheet.tsx`; Test `test/motion-spring-bottomsheet.test.mjs`.
**Interfaces:** Consumes `usePresence(open, {disabled, from})` from `'../../react/index.js'`, `motionAttrs` from `'../motion.js'`; same contract shape as Task 13, owned markup (do not import from Dialog).

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Track } from '../dist/core/spring.js';

test('sheet stays mounted through exit', () => {
  const src = readFileSync('src/primitives/BottomSheet/BottomSheet.tsx', 'utf8');
  assert.match(src, /const \{ mounted, ref \} = usePresence\(open \?\? false, \{ disabled: motion === false/);
  assert.match(src, /if \(!mounted\) return null/);
  assert.match(src, /ref=\{ref\}/);
  assert.match(src, /data-side="bottom"/);
});
test('rapid toggle settles exactly once', () => {
  const tr = new Track(0);
  tr.set(1, { w: 22 }, 0);
  tr.set(0, { w: 34 }, 0.05);
  tr.set(1, { w: 22 }, 0.1);
  assert.equal(Math.round(tr.at(1000)), 1);
  assert.ok(tr.prune(1000) === 0);
});
test('entering choice selects presence origin', () => {
  const src = readFileSync('src/primitives/BottomSheet/BottomSheet.tsx', 'utf8');
  assert.match(src, /from: entering === 'fade' \? \{[^}]*y: 0/s);
});
```

- [ ] **Step 2: Run to verify it fails** — `node --test test/motion-spring-bottomsheet.test.mjs`, expect FAIL.
- [ ] **Step 3: Implement** — exact replacement component:

```tsx
// src/primitives/BottomSheet/BottomSheet.tsx
'use client';
/* BottomSheet. Bottom-anchored dialog over a scrim. Springs in on open; plays the exit spring before unmounting on close. Host owns open state. */
import type { KeyboardEvent, ReactNode } from 'react';
import { usePresence } from '../../react/index.js';
import { Overlay } from '../Overlay/Overlay.js';
import { motionAttrs, type MotionProps } from '../motion.js';

export interface BottomSheetProps extends MotionProps {
  /** Accessible name for the sheet (e.g. "Share options"). Required. */
  label: string;
  /** Whether the sheet is open. Plays exit before unmounting when closed. */
  open?: boolean;
  /** Called on Escape or host close affordances. Optional. */
  onClose?: () => void;
  children: ReactNode;
}

const ORIGINS = {
  fade: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
  rise: { x: 0, y: 4, scale: 1, opacity: 0, blur: 0 },
  scale: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 },
} as const;

export function BottomSheet({ label, open, onClose, children, motion, entering = 'rise', exiting = 'rise' }: BottomSheetProps) {
  const origin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
  const { mounted, ref } = usePresence(open ?? false, { disabled: motion === false, from: origin });
  if (!mounted) return null;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose?.();
  };
  void exiting;
  return (
    <>
      <Overlay />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} data-side="bottom" onKeyDown={onKeyDown} className="cieo cieo-bottom-sheet" {...motionAttrs({ motion, entering, exiting })}>
        {children}
      </div>
    </>
  );
}
```

`void exiting` documents the CSS/data-attribute side; exiting still ships in data attributes for hosts. Manifest + README Motion section + page update.

- [ ] **Step 4: Run test — expect PASS**, plus `npx tsc -p tsconfig.json --noEmit` for type proof (never `npm run build` / `npm test` — both rebuild `dist/`, which is integrator-owned; parallel agents must not race on it).
- [ ] **Step 5: Commit** pathspec-limited to BottomSheet/, test file, BottomSheet page.

### Task 15: Lightbox enter/exit springs

**Files:** Modify `src/primitives/Lightbox/Lightbox.tsx`; Test `test/motion-spring-lightbox.test.mjs`.
**Interfaces:** Consumes `usePresence(open, {disabled, from})` from `'../../react/index.js'`, `motionAttrs` from `'../motion.js'`; same contract shape as Task 13, owned markup.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Track } from '../dist/core/spring.js';

test('viewer stays mounted through exit', () => {
  const src = readFileSync('src/primitives/Lightbox/Lightbox.tsx', 'utf8');
  assert.match(src, /const \{ mounted, ref \} = usePresence\(open \?\? false, \{ disabled: motion === false/);
  assert.match(src, /if \(!mounted\) return null/);
  assert.match(src, /ref=\{ref\}/);
  assert.match(src, /<img src=\{src\} alt=\{alt\} \/>/);
});
test('rapid toggle settles exactly once', () => {
  const tr = new Track(0);
  tr.set(1, { w: 22 }, 0);
  tr.set(0, { w: 34 }, 0.05);
  tr.set(1, { w: 22 }, 0.1);
  assert.equal(Math.round(tr.at(1000)), 1);
  assert.ok(tr.prune(1000) === 0);
});
test('images fade by default', () => {
  const src = readFileSync('src/primitives/Lightbox/Lightbox.tsx', 'utf8');
  assert.match(src, /entering = 'fade'/);
  assert.match(src, /from: entering === 'fade' \? \{[^}]*y: 0/s);
});
```

- [ ] **Step 2: Run to verify it fails** — `node --test test/motion-spring-lightbox.test.mjs`, expect FAIL.
- [ ] **Step 3: Implement** — exact replacement component:

```tsx
// src/primitives/Lightbox/Lightbox.tsx
'use client';
/* Lightbox. Image viewer dialog over a scrim. Fades in on open; plays the exit spring before unmounting on close. Host owns open state. */
import type { KeyboardEvent } from 'react';
import { usePresence } from '../../react/index.js';
import { Overlay } from '../Overlay/Overlay.js';
import { motionAttrs, type MotionProps } from '../motion.js';

export interface LightboxProps extends MotionProps {
  /** Image source. Required. */
  src: string;
  /** Image alternative text. Required. */
  alt: string;
  /** Whether the viewer is open. Plays exit before unmounting when closed. */
  open?: boolean;
  /** Called on Escape or host close affordances. Optional. */
  onClose?: () => void;
  /** Accessible name for the viewer dialog. Defaults to Image viewer. */
  label?: string;
}

const ORIGINS = {
  fade: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
  rise: { x: 0, y: 0, scale: 1, opacity: 0, blur: 0 },
  scale: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 },
} as const;

export function Lightbox({ src, alt, open, onClose, label = 'Image viewer', motion, entering = 'fade', exiting = 'fade' }: LightboxProps) {
  const origin = entering === 'none' ? { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 } : entering === 'fade' ? ORIGINS.fade : entering === 'scale' ? ORIGINS.scale : ORIGINS.rise;
  const { mounted, ref } = usePresence(open ?? false, { disabled: motion === false, from: origin });
  if (!mounted) return null;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose?.();
  };
  void exiting;
  return (
    <>
      <Overlay />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} onKeyDown={onKeyDown} className="cieo cieo-lightbox" {...motionAttrs({ motion, entering, exiting })}>
        <img src={src} alt={alt} />
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Close viewer">
            Close
          </button>
        ) : null}
      </div>
    </>
  );
}
```

Note: Lightbox ORIGINS.rise equals fade (images fade, they don't rise) — deliberate, documented here. Manifest + README + page update.

- [ ] **Step 4: Run test — expect PASS**, plus `npx tsc -p tsconfig.json --noEmit` for type proof (never `npm run build` / `npm test` — both rebuild `dist/`, which is integrator-owned; parallel agents must not race on it).
- [ ] **Step 5: Commit** pathspec-limited to Lightbox/, test file, Lightbox page.

### Task 16: Carousel scroll spring

**Files:** Modify `src/primitives/Carousel/Carousel.tsx`; Test `test/motion-spring-carousel.test.mjs`.
**Interfaces:** Consumes `scrollTo` from `'../../dom/scroll.js'`; produces sprung paging.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('paging rides the scroll spring', () => {
  const src = readFileSync('src/primitives/Carousel/Carousel.tsx', 'utf8');
  assert.match(src, /scrollTo\(track, track\.scrollLeft \+ direction \* track\.clientWidth\)/);
});
test('motion=false falls back to native paging', () => {
  const src = readFileSync('src/primitives/Carousel/Carousel.tsx', 'utf8');
  assert.match(src, /motion === false \? track\.scrollBy/);
});
```

- [ ] **Step 2: Run to verify it fails** — expect FAIL.
- [ ] **Step 3: Implement** — add `motion?: boolean` prop; replace `track.scrollBy({ left: direction * track.clientWidth })` with `motion === false ? track.scrollBy({ left: direction * track.clientWidth }) : scrollTo(track, track.scrollLeft + direction * track.clientWidth);` importing `scrollTo` from `'../../dom/scroll.js'`. Manifest + README + page update.
- [ ] **Step 4: Run test — expect PASS**, plus `npx tsc -p tsconfig.json --noEmit` for type proof (never `npm run build` / `npm test` — both rebuild `dist/`, which is integrator-owned; parallel agents must not race on it).
- [ ] **Step 5: Commit** pathspec-limited.

### Task 17: Motion docs regen

Regenerate every touched page: run `node scripts/build-component-pages.mjs` (banner import lines update where exports changed — none do here) and hand-update the 12 prop tables (motion/entering/exiting rows per the exact row template below, defaults per component) plus Motion do/don't lines where behavior changed (Dialog family, Carousel, Tabs). Row template: `<tr><td>motion</td><td>boolean</td><td>true</td><td>False renders the end state instantly.</td></tr>` and `<tr><td>entering</td><td>none | fade | rise | scale</td><td>{{default}}</td><td>Entering behavior.</td></tr>` (+ exiting twin, default mirrors entering). Verify with `node scripts/build-component-pages.mjs --check` and commit site/ pathspec-limited.

### Task 18: Verify sweep (reports, changes nothing)

Run in order, record exact outputs: `node scripts/wire-primitives.mjs --check`, `node scripts/build-component-pages.mjs --check`, `node scripts/check-motion-tokens.mjs`, `npm run build`, full `node --test test/*.test.mjs`, `npm run check`. Any failure → list file:line + failing command in the report, fix nothing, return BLOCKED with the list. All green → DONE with the tallies.

## Acceptance and execution handoff

- [ ] Task 0 merged (foundation + gate script + engine options).
- [ ] Wave 1: 10 family tasks green, reviewed, merged (review wave 1 fully before dispatching wave 2).
- [ ] Wave 2: 6 spring tasks + docs-regen green, reviewed, merged; verify sweep clean.
- [ ] Integrator regenerates (`build:pages`), runs full `npm run check`, pushes.
- [ ] Residual load-bearing findings surface; minors park with rulings.
