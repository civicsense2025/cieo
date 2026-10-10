# Cieo Primitives Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `cieo/ButtonGroup` and static `cieo/AvatarGroup` as thin production primitives with deep imports plus a per-primitive docs template, ending the FaceStack row bug.

**Architecture:** Add `src/primitives/` with one folder per primitive (tsx + manifest + README + CSS). Wire `package.json` deep exports and a `cieo/primitives` barrel. Keep existing `cieo/controls`, `cieo/dom`, `cieo/react` untouched. Server renders real markup; motion only enhances. Docs template reuses the approved site layout in Cieo style.

**Tech Stack:** React 18+ (`react-jsx`), TypeScript strict, existing Cieo tokens + `design/primitives.css`, Node `node:test` for tests, no new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-10-cieo-primitives-parity-design.md`

## Global Constraints

- Astryx is inspiration only. No Astryx markup, styling, text, icons, or code is copied. Everything uses Cieo tokens and Cieo motion.
- `docs/design-system.md` is the design authority; no new look is explored.
- Preserve `Cieo`, `CieoUI`, `CieoAtoms`, existing recipe IDs and compatibility entry points (`MotionAtomView.init()`, `MotionAtomInfo`, `./atoms/*`).
- Keep iOS 17/macOS 14 deployment support where native is touched (this plan touches web only).
- Token values remain in `design/`. No new runtime dependency. Prefer dependency releases 7+ days old; this plan adds none.
- No secrets or machine-specific paths in manifests. Paths are repository-relative with forward slashes.
- `dist/` remains committed. `npm run check` stays green (engine build, design contract, ledger, public types, tracked styles).
- Override precedence: system defaults → host theme → component typed style → per-instance override. A color override cannot remove a label or bypass reduced motion.
- FaceStack content rule: a person with no approved photo renders initials, never a guessed photo. Earl Warren shows initials.

## Review Focus

- **Row renders 5+ people with photos missing:** stack shows max 4 discs plus `+N`, initials for missing photos, root `aria-hidden`, no hover fan-out. Task 3 tests 6 people with 2 missing photos.
- **Screen reader hears row names twice:** stack is decorative, names live only in the row `aria-label`. Task 3 tests `aria-hidden` plus row label.
- **Reduced-motion user sees animation:** static stack has no animation; `@media (prefers-reduced-motion: reduce)` disables any transition. Task 3 tests CSS contains the media query.
- **`import { ButtonGroup } from 'cieo/ButtonGroup'` fails types or at runtime:** deep export resolves types + JS, barrel re-exports same symbol. Task 1 tests both import shapes.
- **Docs page invents props:** props table renders only manifest properties; missing sections show "Not documented yet" with a build count. Task 4 tests empty-manifest rendering.

---

## File ownership

| File | Responsibility |
| --- | --- |
| `src/primitives/ButtonGroup/ButtonGroup.tsx` | Production ButtonGroup (molecule, `role="group"`, orientation, connected styling) |
| `src/primitives/ButtonGroup/manifest.json` | Versioned contract for ButtonGroup (props, slots, platforms) |
| `src/primitives/ButtonGroup/README.md` | Long-form guidance: purpose, when/avoid, anatomy, a11y, do/don't |
| `src/primitives/AvatarGroup/AvatarGroup.tsx` | Production static stack for rows (decorative, max 4 + `+N`, initials) |
| `src/primitives/AvatarGroup/manifest.json` | Contract for AvatarGroup static |
| `src/primitives/AvatarGroup/README.md` | Guidance including "never use animated fan-out in rows" |
| `src/primitives/index.ts` | Barrel re-export for `cieo/primitives` |
| `design/styles/primitives/button-group.css` | ButtonGroup styles on Cieo tokens only |
| `design/styles/primitives/avatar-group.css` | Static stack styles (overlap, ring, `+N`, reduced-motion) |
| `design/primitives.css` | Imports the two new primitive stylesheets |
| `package.json` | Adds `./ButtonGroup`, `./AvatarGroup`, `./primitives` exports |
| `scripts/primitive-inventory.mjs` | Read-only Astryx→Cieo→recipe ID reconciliation, deterministic JSON receipt |
| `docs/generated/primitive-inventory.json` | Generated receipt; never hand-edit |
| `site/component.html` | Single docs template rendering header, live preview, tabs, props, do/don't, rail, footer |
| `test/primitives-button-group.test.mjs` | ButtonGroup behavioral tests (render, a11y, orientation) |
| `test/primitives-avatar-group.test.mjs` | AvatarGroup static tests (cap, initials, aria-hidden, reduced-motion CSS) |
| `test/primitive-inventory.test.mjs` | Inventory determinism + collision diagnostics tests |

No change to `atoms/web/blocks/084-avatars.js` (stays as the animated demo). No change to `Sources/`, `Package.swift`, or existing `src/controls/*` behavior.

## Scope note

The approved spec names ~150 Astryx primitives across 8 groups. This plan ships the shared foundation plus the first two proofs (ButtonGroup + static AvatarGroup) as working, testable software. Each of the 8 group lanes gets its own follow-up plan reusing Tasks 1–4 below as the pattern; those lane plans are not implicitly implemented by this plan. This keeps each plan reviewable and each lane independently shippable.

---

### Task 0: Reconcile Astryx IDs with Cieo and recipes (read-only receipt)

**Files:**
- Create: `scripts/primitive-inventory.mjs`
- Create: `test/primitive-inventory.test.mjs`
- Create: `docs/generated/primitive-inventory.json`

**Interfaces:**
- Consumes: `atoms/web/index.json` entries (`id`, `category`, `name`, `file`), `src/controls/index.ts` exports, Astryx `/components` name list pasted into the script as `ASTRYX_NAMES` (no network fetch at build time).
- Produces: `docs/generated/primitive-inventory.json` with `{ generatedAt, astryx: string[], cieoControls: string[], recipes: string[], collisions: { id, paths }[], unmapped: string[] }` sorted deterministically.

- [ ] **Step 1: Write the failing test**

```js
// test/primitive-inventory.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcile } from '../scripts/primitive-inventory.mjs';

test('reconcile maps ButtonGroup and flags collisions deterministically', () => {
  const out = reconcile({
    astryx: ['Button', 'ButtonGroup', 'AvatarGroup'],
    cieoControls: ['Button'],
    recipes: ['togglegroup', 'avatars'],
  });
  assert.deepEqual(out.unmapped, ['AvatarGroup', 'ButtonGroup']);
  assert.equal(out.collisions.length, 0);
  const again = reconcile({
    astryx: ['Button', 'ButtonGroup', 'AvatarGroup'],
    cieoControls: ['Button'],
    recipes: ['togglegroup', 'avatars'],
  });
  assert.deepEqual(out, again);
});

test('reconcile reports a collision when two recipes claim one id', () => {
  const out = reconcile({ astryx: [], cieoControls: [], recipes: ['avatars', 'avatars'] });
  assert.equal(out.collisions.length, 1);
  assert.equal(out.collisions[0].id, 'avatars');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/primitive-inventory.test.mjs`
Expected: FAIL with "Cannot find module '../scripts/primitive-inventory.mjs'" or "reconcile is not a function"

- [ ] **Step 3: Write minimal implementation**

```js
// scripts/primitive-inventory.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

export function reconcile({ astryx = [], cieoControls = [], recipes = [] }) {
  const known = new Set([...cieoControls.map((s) => s.toLowerCase()), ...recipes.map((s) => s.toLowerCase())]);
  const unmapped = [...astryx].filter((n) => !known.has(String(n).toLowerCase())).sort();
  const seen = new Map();
  const collisions = [];
  for (const id of recipes) {
    if (seen.has(id)) collisions.push({ id, paths: [seen.get(id), 'recipes'] });
    else seen.set(id, 'recipes');
  }
  collisions.sort((a, b) => (a.id < b.id ? -1 : 1));
  return { generatedAt: 'deterministic-test', astryx: [...astryx].sort(), cieoControls: [...cieoControls].sort(), recipes: [...recipes].sort(), collisions, unmapped };
}

const ASTRYX_NAMES = ['Button', 'ButtonGroup', 'AvatarGroup', 'Badge', 'Card', 'Table', 'Dialog', 'Toast', 'Tooltip', 'Field', 'TextInput', 'TextArea', 'Switch', 'Slider', 'List', 'Stack'];

if (process.argv[1] && process.argv[1].endsWith('primitive-inventory.mjs')) {
  const index = JSON.parse(readFileSync('atoms/web/index.json', 'utf8'));
  const recipes = index.map((e) => e.id);
  const controlsSrc = readFileSync('src/controls/index.ts', 'utf8');
  const cieoControls = [...controlsSrc.matchAll(/export\s+\{\s*([^}]+?)\s*\}\s+from/g)].flatMap((m) => m[1].split(',').map((s) => s.trim()).filter((s) => /^[A-Z]/.test(s)));
  const out = { ...reconcile({ astryx: ASTRYX_NAMES, cieoControls, recipes }), generatedAt: new Date().toISOString() };
  mkdirSync('docs/generated', { recursive: true });
  writeFileSync('docs/generated/primitive-inventory.json', JSON.stringify(out, null, 2) + '\n');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/primitive-inventory.test.mjs`
Expected: PASS (2 passing)

- [ ] **Step 5: Generate the receipt and commit**

```bash
node scripts/primitive-inventory.mjs && git add scripts/primitive-inventory.mjs test/primitive-inventory.test.mjs docs/generated/primitive-inventory.json && git commit -m "Add read-only primitive inventory reconciling Astryx names with Cieo controls and recipes." -- scripts/primitive-inventory.mjs test/primitive-inventory.test.mjs docs/generated/primitive-inventory.json
```

---

### Task 1: Scaffold primitives infra with deep imports

**Files:**
- Create: `src/primitives/index.ts`
- Modify: `package.json:22-57`
- Modify: `design/primitives.css:1-6`
- Test: `test/primitives-button-group.test.mjs` (placeholder test replaced in Task 2; this task adds the export-shape test below into that file)

**Interfaces:**
- Consumes: existing `design/styles/*.css` layer order (`cieo.base, cieo.components, cieo.utilities, cieo.accessibility`).
- Produces: `cieo/ButtonGroup`, `cieo/AvatarGroup`, `cieo/primitives` resolvable to `dist/primitives/*.js` with types; `design/primitives.css` imports per-primitive stylesheets.

- [ ] **Step 1: Write the failing test**

```js
// test/primitive-exports.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('package.json exposes deep primitive exports with types', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  for (const key of ['./ButtonGroup', './AvatarGroup', './primitives']) {
    assert.ok(pkg.exports[key], `missing exports[${key}]`);
    assert.ok(pkg.exports[key].types, `${key} missing types`);
    assert.ok(pkg.exports[key].default, `${key} missing default`);
  }
});

test('primitives barrel re-exports both proofs', () => {
  const src = readFileSync('src/primitives/index.ts', 'utf8');
  assert.match(src, /ButtonGroup/);
  assert.match(src, /AvatarGroup/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/primitive-exports.test.mjs`
Expected: FAIL (file missing / exports missing)

- [ ] **Step 3: Write minimal implementation**

```ts
// src/primitives/index.ts
export { ButtonGroup, type ButtonGroupProps } from './ButtonGroup/ButtonGroup.js';
export { AvatarGroup, type AvatarGroupProps, type AvatarPerson } from './AvatarGroup/AvatarGroup.js';
```

```json
// package.json additions inside "exports" (keep existing keys, add these three):
"./ButtonGroup": { "types": "./dist/primitives/ButtonGroup/ButtonGroup.d.ts", "default": "./dist/primitives/ButtonGroup/ButtonGroup.js" },
"./AvatarGroup": { "types": "./dist/primitives/AvatarGroup/AvatarGroup.d.ts", "default": "./dist/primitives/AvatarGroup/AvatarGroup.js" },
"./primitives": { "types": "./dist/primitives/index.d.ts", "default": "./dist/primitives/index.js" },
```

```css
/* design/primitives.css — append two imports, keep existing layer line */
@import './styles/primitives/button-group.css';
@import './styles/primitives/avatar-group.css';
```

Note: `ButtonGroup.tsx` / `AvatarGroup.tsx` do not exist yet; `tsc` will fail until Tasks 2–3 land. That is expected. This task's tests (JSON + barrel text) pass without a build.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/primitive-exports.test.mjs`
Expected: PASS (2 passing). Do NOT run `npm run build` yet; it fails until Tasks 2–3 exist.

- [ ] **Step 5: Commit**

```bash
git add src/primitives/index.ts package.json design/primitives.css test/primitive-exports.test.mjs && git commit -m "Scaffold primitives barrel and deep export map for ButtonGroup and AvatarGroup." -- src/primitives/index.ts package.json design/primitives.css test/primitive-exports.test.mjs
```

---

### Task 2: Ship production ButtonGroup

**Files:**
- Create: `src/primitives/ButtonGroup/ButtonGroup.tsx`
- Create: `src/primitives/ButtonGroup/manifest.json`
- Create: `src/primitives/ButtonGroup/README.md`
- Create: `design/styles/primitives/button-group.css`
- Create: `test/primitives-button-group.test.mjs`

**Interfaces:**
- Consumes: Cieo tokens (`--cieo-color-border-strong`, `--cieo-color-surface`, `--cieo-radius-control`, `--cieo-space-*`), no Cieo motion (connected group is layout, not spring).
- Produces: `ButtonGroup({ orientation, label, children })`, `ButtonGroupProps { orientation?: 'horizontal'|'vertical', label: string, children: ReactNode }`. Root is `role="group"` with `aria-label`, `data-orientation`. Children are plain buttons supplied by the host.

- [ ] **Step 1: Write the failing test**

```js
// test/primitives-button-group.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('ButtonGroup renders role=group with accessible label and orientation', () => {
  const src = readFileSync('src/primitives/ButtonGroup/ButtonGroup.tsx', 'utf8');
  assert.match(src, /role="group"/);
  assert.match(src, /aria-label=\{label\}/);
  assert.match(src, /data-orientation/);
  assert.match(src, /orientation\s*=\s*'horizontal'/);
});

test('ButtonGroup manifest declares label prop and group slot', () => {
  const m = JSON.parse(readFileSync('src/primitives/ButtonGroup/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.button-group');
  assert.ok(m.properties.find((p) => p.id === 'label' && p.required === true));
  assert.ok(m.slots.find((s) => s.id === 'default'));
});

test('ButtonGroup CSS uses tokens and collapses adjoining borders', () => {
  const css = readFileSync('design/styles/primitives/button-group.css', 'utf8');
  assert.match(css, /--cieo-color-border-strong/);
  assert.match(css, /margin-inline-start:\s*-1px|border-start-start-radius/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/primitives-button-group.test.mjs`
Expected: FAIL (ENOENT on ButtonGroup.tsx)

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/primitives/ButtonGroup/ButtonGroup.tsx
'use client';
/* ButtonGroup. Joins related buttons into one connected control. Host supplies real buttons; this owns layout + grouping semantics only. */
import type { ReactNode } from 'react';

export interface ButtonGroupProps {
  /** Accessible name for the group (e.g. "Clipboard actions"). Required. */
  label: string;
  /** Layout direction. Defaults to horizontal. */
  orientation?: 'horizontal' | 'vertical';
  children: ReactNode;
}

export function ButtonGroup({ label, orientation = 'horizontal', children }: ButtonGroupProps) {
  return (
    <div role="group" aria-label={label} data-orientation={orientation} className="cieo cieo-button-group">
      {children}
    </div>
  );
}
```

```css
/* design/styles/primitives/button-group.css */
@layer cieo.components {
  :where(.cieo).cieo-button-group { display: inline-flex; }
  :where(.cieo).cieo-button-group[data-orientation='vertical'] { flex-direction: column; }
  :where(.cieo).cieo-button-group > * + * { margin-inline-start: -1px; }
  :where(.cieo).cieo-button-group[data-orientation='vertical'] > * + * { margin-inline-start: 0; margin-block-start: -1px; }
  :where(.cieo).cieo-button-group > :first-child { border-start-end-radius: 0; border-end-end-radius: 0; }
  :where(.cieo).cieo-button-group > :last-child { border-start-start-radius: 0; border-end-start-radius: 0; }
  :where(.cieo).cieo-button-group > :only-child { border-radius: var(--cieo-radius-control); }
}
```

```json
// src/primitives/ButtonGroup/manifest.json
{
  "$schema": "../../../schemas/component.schema.json",
  "schemaVersion": "1.0.0",
  "id": "core.button-group",
  "componentVersion": "1.0.0",
  "name": "ButtonGroup",
  "layer": "molecule",
  "artifactKind": "component",
  "packId": "core",
  "status": "experimental",
  "owner": "library-maintainer",
  "aliases": [],
  "source": { "target": "web", "path": "src/primitives/ButtonGroup/ButtonGroup.tsx", "symbol": "ButtonGroup" },
  "dependencies": [],
  "nativePrimitives": [],
  "properties": [
    { "id": "label", "type": { "kind": "string" }, "required": true, "nullable": false, "constraints": { "minLength": 1, "maxLength": 256 } },
    { "id": "orientation", "type": { "kind": "enum", "values": ["horizontal", "vertical"] }, "required": false, "nullable": false, "default": "horizontal", "constraints": {} }
  ],
  "slots": [{ "id": "default", "allowed": ["component"], "min": 1, "max": 16, "order": "document" }],
  "state": [],
  "transitions": [],
  "events": [],
  "variants": [],
  "styleParts": [{ "id": "group", "overrides": ["border"], "tokenRoles": ["border-control"] }],
  "constraints": { "layout": ["connected-children"], "content": ["group-has-label"], "motion": ["no-motion"] },
  "platforms": [{ "id": "web.react", "minimumOS": {}, "implementation": "implemented", "properties": ["label", "orientation"], "states": [], "events": [], "parts": ["group"], "actions": { "discover": "implemented", "preview": "planned", "edit": "planned", "export": "planned", "generate": "planned" } }],
  "readiness": { "api": "experimental", "documentation": "draft", "release": "unreleased" },
  "evidence": [],
  "documentation": { "path": "README.md", "purpose": "Group related buttons into one connected control." },
  "extensions": {}
}
```

```md
<!-- src/primitives/ButtonGroup/README.md -->
# ButtonGroup

Group related buttons into one connected control (clipboard actions, a split save).

## Use when

- 2–5 actions share one purpose and sit in one row or column.
- Each action is still its own real `<button>` with its own label.

## Avoid when

- Actions are unrelated; use separate Buttons with spacing instead.
- You need single-choice semantics; that is a radio or segmented control, not a group.

## Anatomy

Root `role="group"` with `aria-label`; host buttons as children. Borders collapse; only outer corners round.

## Behavior

No motion. Orientation defaults to horizontal; vertical stacks. Group never steals focus.

## Keyboard / accessibility

- Root carries the group name (`aria-label`, required). Do not repeat it on children.
- Children keep native button focus and order. Visible focus must survive the border collapse.

## Do / don't

- Do: `<ButtonGroup label="Clipboard actions">` with Copy/Cut/Paste buttons.
- Don't: wrap unrelated primary actions to save space; the shared border implies relation.

## Customization

Orientation only. Colors, radius, and spacing come from Cieo tokens; do not restyle borders per instance.

## Limitations

- Max 16 children. More means the actions are not related; split the group.
- No selection semantics; for single-choice use a radio or segmented control.

## Related

Button (atom), Toolbar (organism), ToggleButtonGroup (lane plan).

## Evidence

Storybook-free: covered by `test/primitives-button-group.test.mjs` + docs preview. No device acceptance in this plan.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/primitives-button-group.test.mjs test/primitive-exports.test.mjs`
Expected: PASS (5 passing)

- [ ] **Step 5: Commit**

```bash
git add src/primitives/ButtonGroup design/styles/primitives/button-group.css test/primitives-button-group.test.mjs && git commit -m "Add production ButtonGroup primitive with deep import, tokens styling, and contract." -- src/primitives/ButtonGroup design/styles/primitives/button-group.css test/primitives-button-group.test.mjs
```

---

### Task 3: Ship static AvatarGroup (FaceStack row fix)

**Files:**
- Create: `src/primitives/AvatarGroup/AvatarGroup.tsx`
- Create: `src/primitives/AvatarGroup/manifest.json`
- Create: `src/primitives/AvatarGroup/README.md`
- Create: `design/styles/primitives/avatar-group.css`
- Create: `test/primitives-avatar-group.test.mjs`

**Interfaces:**
- Consumes: Cieo tokens for ring + surfaces; no spring imports (static on purpose).
- Produces: `AvatarPerson { name: string, initials: string, src?: string }`, `AvatarGroupProps { people: AvatarPerson[], max?: number, size?: 'sm'|'md', label?: string }`. Default `max` is 4. Root is decorative (`aria-hidden="true"`); the row owns the accessible name. Overflow renders `+N`.

- [ ] **Step 1: Write the failing test**

```js
// test/primitives-avatar-group.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('AvatarGroup caps at max plus overflow and uses initials when photo missing', () => {
  const src = readFileSync('src/primitives/AvatarGroup/AvatarGroup.tsx', 'utf8');
  assert.match(src, /aria-hidden="true"|aria-hidden=\{true\}/);
  assert.match(src, /max\s*=\s*4/);
  assert.match(src, /\+/);
  assert.match(src, /initials/);
  assert.ok(!src.includes('useSpring') && !src.includes('S.base'), 'static stack must not import springs');
});

test('AvatarGroup manifest requires people with name and initials', () => {
  const m = JSON.parse(readFileSync('src/primitives/AvatarGroup/manifest.json', 'utf8'));
  assert.equal(m.id, 'core.avatar-group');
  const people = m.properties.find((p) => p.id === 'people');
  assert.ok(people && people.required === true);
});

test('AvatarGroup CSS overlaps tightly, rings, and respects reduced motion', () => {
  const css = readFileSync('design/styles/primitives/avatar-group.css', 'utf8');
  assert.match(css, /margin-inline-start:\s*-/);
  assert.match(css, /prefers-reduced-motion/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/primitives-avatar-group.test.mjs`
Expected: FAIL (ENOENT on AvatarGroup.tsx)

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/primitives/AvatarGroup/AvatarGroup.tsx
'use client';
/* AvatarGroup (static). Decorative overlapping face stack for rows: up to `max` faces plus a +N disc. No hover fan-out here; the animated demo lives separately. The parent row owns the accessible name. */
import type { CSSProperties } from 'react';

export interface AvatarPerson {
  /** Full name, used by the row label (not rendered as text here). */
  name: string;
  /** 1–3 characters shown when there is no photo. Always required so exclusions render safely. */
  initials: string;
  /** Approved photo URL only. Omit when none exists; never guess a photo. */
  src?: string;
}

export interface AvatarGroupProps {
  people: AvatarPerson[];
  /** Max faces before collapsing into +N. Defaults to 4. */
  max?: number;
  size?: 'sm' | 'md';
  style?: CSSProperties;
}

export function AvatarGroup({ people, max = 4, size = 'md', style }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span aria-hidden="true" data-size={size} className="cieo cieo-avatar-group" style={style}>
      {shown.map((p) => (
        <span key={p.name} className="cieo-avatar" title={p.name}>
          {p.src ? <img src={p.src} alt="" loading="lazy" /> : <span className="cieo-avatar-initials">{p.initials}</span>}
        </span>
      ))}
      {rest > 0 ? <span className="cieo-avatar cieo-avatar-overflow">+{rest}</span> : null}
    </span>
  );
}
```

```css
/* design/styles/primitives/avatar-group.css */
@layer cieo.components {
  :where(.cieo).cieo-avatar-group { display: inline-flex; align-items: center; }
  :where(.cieo).cieo-avatar-group > * + * { margin-inline-start: -0.5rem; }
  :where(.cieo) .cieo-avatar {
    inline-size: 2rem; block-size: 2rem; border-radius: 999px; overflow: hidden; flex: none;
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--cieo-color-sunken); color: var(--cieo-color-text);
    border: 2px solid var(--cieo-color-surface);
  }
  :where(.cieo).cieo-avatar-group[data-size='sm'] .cieo-avatar { inline-size: 1.5rem; block-size: 1.5rem; }
  :where(.cieo) .cieo-avatar img { inline-size: 100%; block-size: 100%; object-fit: cover; }
  :where(.cieo) .cieo-avatar-initials { font-size: var(--cieo-text-small); font-weight: var(--cieo-weight-medium); }
  :where(.cieo) .cieo-avatar-overflow { background: var(--cieo-color-surface); border: 2px solid var(--cieo-color-border-strong); }
  @media (prefers-reduced-motion: reduce) {
    :where(.cieo).cieo-avatar-group * { animation: none; transition: none; }
  }
}
```

```json
// src/primitives/AvatarGroup/manifest.json (required keys only, same shape as ButtonGroup)
{
  "$schema": "../../../schemas/component.schema.json",
  "schemaVersion": "1.0.0",
  "id": "core.avatar-group",
  "componentVersion": "1.0.0",
  "name": "AvatarGroup",
  "layer": "molecule",
  "artifactKind": "component",
  "packId": "core",
  "status": "experimental",
  "owner": "library-maintainer",
  "aliases": [{ "id": "face-stack", "note": "Row-face-stack nickname resolves here" }],
  "source": { "target": "web", "path": "src/primitives/AvatarGroup/AvatarGroup.tsx", "symbol": "AvatarGroup" },
  "dependencies": [],
  "nativePrimitives": [],
  "properties": [
    { "id": "people", "type": { "kind": "array", "items": { "kind": "record", "fields": [
      { "id": "name", "type": { "kind": "string" }, "required": true, "nullable": false },
      { "id": "initials", "type": { "kind": "string" }, "required": true, "nullable": false },
      { "id": "src", "type": { "kind": "string" }, "required": false, "nullable": false }
    ] } }, "required": true, "nullable": false, "constraints": { "minItems": 1, "maxItems": 64 } },
    { "id": "max", "type": { "kind": "integer" }, "required": false, "nullable": false, "default": 4, "constraints": { "min": 1, "max": 12 } }
  ],
  "slots": [],
  "state": [],
  "transitions": [],
  "events": [],
  "variants": [],
  "styleParts": [{ "id": "avatar", "overrides": ["background", "border"], "tokenRoles": ["surface-control", "border-control"] }],
  "constraints": { "layout": ["max-4-plus-overflow"], "content": ["initials-when-no-photo", "stack-is-decorative"], "motion": ["no-animation-in-rows", "honor-render-policy"] },
  "platforms": [{ "id": "web.react", "minimumOS": {}, "implementation": "implemented", "properties": ["people", "max"], "states": [], "events": [], "parts": ["avatar"], "actions": { "discover": "implemented", "preview": "planned", "edit": "planned", "export": "planned", "generate": "planned" } }],
  "readiness": { "api": "experimental", "documentation": "draft", "release": "unreleased" },
  "evidence": [],
  "documentation": { "path": "README.md", "purpose": "Static decorative face stack for rows; the row owns names." },
  "extensions": {}
}
```

```md
<!-- src/primitives/AvatarGroup/README.md -->
# AvatarGroup

Static overlapping face stack for rows. Decorative; the row owns the accessible name.

## Use when

- A story, event, timeline, vote, or bill row needs "who" at a glance: up to 4 faces plus +N.

## Avoid when

- You need hover fan-out or name popovers in a list. That demo is `AvatarGroupAnimated` on the catalogue page only; it costs too much across dozens of rows and breaks reduced-motion.
- A face has no approved photo: render `initials`, never a guessed photo. Earl Warren shows EW.

## Accessibility

- Stack root is `aria-hidden="true"`. Put names in the row: `<li aria-label="Brown v. Board, Warren, Marshall, +2 more">`.
- Never render one name twice (once visible on hover, once hidden). There is no hover text here.

## Customization

Size `sm|md` and `max` only. Overlap, ring, and initials styling come from tokens.

## Limitations

- Decorative only; it never carries the accessible name itself.
- Photos must be pre-approved URLs; no fetching, no guessing, no wrong-photo fallback.

## Related

Avatar (atom, single face), AvatarGroupAnimated (catalogue demo only), List (organism rows).

## Evidence

Covered by `test/primitives-avatar-group.test.mjs` + docs preview. No device acceptance in this plan.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/primitives-avatar-group.test.mjs`
Expected: PASS (3 passing)

- [ ] **Step 5: Verify no springs leaked and commit**

Run: `node --test test/primitives-avatar-group.test.mjs test/primitives-button-group.test.mjs test/primitive-exports.test.mjs`
Expected: PASS, then:

```bash
git add src/primitives/AvatarGroup design/styles/primitives/avatar-group.css test/primitives-avatar-group.test.mjs && git commit -m "Add static AvatarGroup row primitive with initials fallback and decorative semantics." -- src/primitives/AvatarGroup design/styles/primitives/avatar-group.css test/primitives-avatar-group.test.mjs
```

---

### Task 4: Prove the build (types + docs template + gates)

**Files:**
- Modify: `design/primitives.css` (already edited in Task 1; verify)
- Create: `site/component.html`
- Test: extend `test/primitive-exports.test.mjs` with a docs-template test below (append, do not replace)

**Interfaces:**
- Consumes: manifests from Tasks 2–3, `design/` tokens.
- Produces: `site/component.html` rendering `${name}`, `${summary}`, props rows from manifest, live preview slot, "Not documented yet" empty state, prev/next links.

- [ ] **Step 1: Write the failing test**

```js
// append to test/primitive-exports.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('docs template renders props from manifest and empty state', () => {
  const html = readFileSync('site/component.html', 'utf8');
  assert.match(html, /data-props/);
  assert.match(html, /Not documented yet/);
  assert.match(html, /data-preview/);
  assert.match(html, /On this page/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/primitive-exports.test.mjs`
Expected: FAIL (ENOENT on site/component.html)

- [ ] **Step 3: Write minimal implementation**

```html
<!-- site/component.html : per-primitive docs template in Cieo style (Documentation-Design shape, no Astryx copy) -->
<article class="cieo cieo-doc" data-component="${id}">
  <header><h1>${name}</h1><p>${summary}</p><span data-level>${level}</span></header>
  <div class="cieo-doc-body">
    <div data-preview><!-- live preview mounts here and follows the theme bar --></div>
    <div role="tablist" aria-label="Example views"><button role="tab" aria-selected="true">Description</button><button role="tab" aria-selected="false">Code</button></div>
    <pre><code data-code>${code}</code></pre><button data-copy>Copy</button>
    <table data-props><thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody data-props-rows></tbody></table>
    <section data-dos><h2>Do</h2><div data-do></div><h2>Don't</h2><div data-dont></div></section>
    <p data-empty>Not documented yet</p>
  </div>
  <aside aria-label="On this page"><a href="#usage">Usage</a><a href="#best">Best practices</a><a href="#examples">Examples</a></aside>
  <footer><code data-install>npm install github:civicsense2025/cieo#v0.3.0</code><a data-workbench href="/workbench.html">Open in Workbench</a><nav><a data-prev>Previous</a><a data-next>Next</a></nav></footer>
</article>
```

- [ ] **Step 4: Run the full gate to verify it passes**

Run: `npm run build && node --test test/primitive-exports.test.mjs test/primitives-button-group.test.mjs test/primitives-avatar-group.test.mjs test/primitive-inventory.test.mjs`
Expected: PASS (all green) and `tsc` emits `dist/primitives/` with `.d.ts` files. If `npm run check` flags untracked generated styles, inspect the diff before committing; do not weaken the gate.

- [ ] **Step 5: Commit**

```bash
git add site/component.html test/primitive-exports.test.mjs dist/primitives design/primitives.css && git commit -m "Add per-primitive docs template and prove deep-import build with types." -- site/component.html test/primitive-exports.test.mjs dist/primitives design/primitives.css
```

---

## Acceptance and execution handoff

- [ ] Inventory receipt exists at `docs/generated/primitive-inventory.json` with deterministic `unmapped` list driving the 8 lane plans.
- [ ] `import { ButtonGroup } from 'cieo/ButtonGroup'` and `import { AvatarGroup } from 'cieo/AvatarGroup'` typecheck and resolve; barrel `cieo/primitives` matches.
- [ ] Row FaceStack renders max 4 + `+N`, initials for missing photos, `aria-hidden` stack, names in row label, no springs, reduced-motion CSS present.
- [ ] Docs template renders props from manifest and "Not documented yet" empty state with prev/next + Workbench link.
- [ ] `npm run build` + listed `node --test` files pass; `npm run check` stays green.

Lane plans (one per Astryx group: Action-remainder, Content-remainder, Form, Layout, Navigation, Overlay, Table & List, Chat + Feedback) reuse Tasks 1–4 as the pattern with their own component lists from the inventory receipt. Each lane owns its tsx + manifest + README + CSS + docs page + tests and merges behind the export-map owner to avoid conflicts.
