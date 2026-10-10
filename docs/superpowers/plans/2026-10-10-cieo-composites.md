# Composites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship four whole product screens built only from Cieo primitives — dashboard, storefront, chat, booking — as static pages with vanilla JS.

**Architecture:** Each composite is one static HTML page plus one vanilla JS module under `site/composites/`, reusing shipped primitive markup and tokens with zero new dependencies. Pages render real content with scripts disabled; JS enhances (switching, recalculating, appending). A shared browser harness proves every page loads console-error-free and every key interaction works.

**Tech Stack:** Static HTML, vanilla JS (no framework, no build step — files committed directly, following `atoms/web` recipe precedent), Python Playwright harness following `test/browser/smoke.py`, Node `node:test` for static checks.

**Spec:** `docs/superpowers/specs/2026-10-09-design-system-site-design.md` (Composites section) — Astryx templates are structural inspiration only; no Astryx markup, styling, text, icons, or code is copied.

## Global Constraints

- No Astryx markup, styling, text, icons, or code. Everything from Cieo tokens, primitives, and original sample content below.
- Built only from shipped library parts: every primitive used must resolve in `docs/generated/primitive-exports.json`. No new primitives, no new CSS files, no new dependencies.
- Static-first: core content readable with scripts disabled. JS enhances; never the only path to content.
- Reduced motion honored (token durations, guarded keyframes). No raw durations.
- Tokens only (`--cieo-*`, `--motion-*`). No hardcoded colors, fonts, or timings.
- Lanes touch only their own page + JS + test. Shared files (package.json except Task 5's one script line, indexes, harness) are integrator-owned unless the task says otherwise.
- `npm run check` stays green. `dist/` untouched by all tasks in this plan.

## Review Focus

1. **Page is blank or broken with scripts disabled/failed** — content must be in static markup, not JS-rendered. Pinned: each task asserts key content strings exist in the raw HTML file (its step style below).
2. **Storefront total doesn't follow quantity/variant/delivery changes** — buyer can't trust the price. Pinned: Task 2 browser test clicks stepper + delivery and asserts total text (exact asserts below).
3. **Chat send duplicates on double-click or Enter-spam** — duplicate messages. Pinned: Task 3 browser test double-submits and asserts exactly one new message (exact asserts below).
4. **Booking confirms with no day or slot** — invalid reservation. Pinned: Task 4 browser test asserts confirm disabled until day+slot+name, then success panel (exact asserts below).
5. **Dashboard settings vanish on reload / sections don't switch** — dead controls. Pinned: Task 1 browser test toggles, reloads, asserts persisted + panel switch (exact asserts below).

---

### Task 1: Admin dashboard with settings

**Files:**
- Create: `site/composites/dashboard.html`
- Create: `site/composites/dashboard.js`
- Test: `test/composites-dashboard.test.mjs`

**Interfaces:**
- Consumes: shipped primitives (names below, all in `primitive-exports.json`); `localStorage` key `cieo-dashboard-settings` (JSON `{store, notify, threshold}`).
- Produces: standalone page; nothing downstream imports it.

**Parts (exact `data-parts` list for the page):** AppShell, SideNav, SideNavItem, Card, Badge, Table, TableHeader, TableBody, TableRow, TableCell, Field, Switch, Slider, Button, Banner, Heading, Text.

**Page sections (static HTML, real content):**
1. AppShell: nav slot = SideNav labelled "Store sections" with items Overview / Orders / Settings (first has `aria-current="page"`); main slot = three `<section>` panels, only Overview visible (others `hidden`).
2. Overview: four Cards — Revenue "$48,210" Badge success "+12%", Orders "1,284" Badge success "+4%", Refunds "23" Badge warning "+8%", Active carts "312" Badge info "live". Followed by Heading "Recent orders" + Table with 5 rows: `#1041 Amara Okafor $148.00 Paid`, `#1040 Liam Chen $296.00 Paid`, `#1039 Sofia Reyes $74.00 Refunded`, `#1038 Noah Kim $212.00 Pending`, `#1037 Ava Patel $148.00 Paid` (status in Badge: success/success/danger/warning/success).
3. Orders panel: same Table reused statically (duplicate markup, documented as demo data).
4. Settings panel: Field store name (TextField-style label + input with `data-setting="store"`, value "Drift Goods"), Switch email notifications (checked, `data-setting="notify"`), Slider low-stock threshold (value 12, readout "12 units", `data-setting="threshold"`), Button Save ("Save settings", `data-save`). Hidden Banner region for "Settings saved." confirmation (`data-saved`).
5. Built-from section (`<section data-built-from>`) listing every data-parts entry as a link to `../components/<Name>.html`.

**JS (`dashboard.js`, vanilla, ~40 lines):** nav buttons switch panels (toggle `hidden`, move `aria-current`); on load, read localStorage key and apply to the three controls; Save writes the key and unhides the Banner with "Settings saved." text. All queries by `data-` hooks (`data-panel`, `data-nav`, `data-setting`, `data-save`, `data-saved`). No frameworks, no network.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

test('dashboard renders content with scripts disabled', () => {
  const html = readFileSync('site/composites/dashboard.html', 'utf8');
  for (const s of ['$48,210', '#1041', 'Amara Okafor', 'Drift Goods', 'Settings saved.']) {
    assert.ok(html.includes(s), `static markup missing: ${s}`);
  }
});
test('dashboard uses only shipped parts', () => {
  const html = readFileSync('site/composites/dashboard.html', 'utf8');
  const names = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names;
  const parts = [...html.matchAll(/data-parts="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
  assert.ok(parts.length > 10, 'data-parts list missing');
  for (const p of parts) assert.ok(names.includes(p), `unshipped part: ${p}`);
  const built = [...html.matchAll(/data-built-from[\s\S]*?<\/section>/g)];
  assert.ok(built.length === 1, 'built-from section missing');
  for (const p of parts) assert.ok(html.includes(`../components/${p}.html`), `built-from missing link: ${p}`);
  for (const bad of ['astryx', 'tailwind', 'bootstrap', 'stylex']) {
    assert.ok(!html.toLowerCase().includes(bad), `foreign marker: ${bad}`);
  }
});
test('dashboard JS has no framework and wires panels plus settings', () => {
  const js = readFileSync('site/composites/dashboard.js', 'utf8');
  assert.ok(!js.includes('import ') || js.includes('import {'), 'no framework imports expected');
  for (const s of ['data-panel', 'data-nav', 'cieo-dashboard-settings', 'localStorage']) {
    assert.ok(js.includes(s), `JS missing hook: ${s}`);
  }
  assert.ok(existsSync('site/composites/dashboard.js'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/composites-dashboard.test.mjs`
Expected: FAIL with ENOENT on `site/composites/dashboard.html`.

- [ ] **Step 3: Write the page + JS per sections above (exact parts, exact sample data, exact JS hooks).**
- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/composites-dashboard.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/composites/dashboard.html site/composites/dashboard.js test/composites-dashboard.test.mjs
git commit -m "Add admin dashboard composite with settings persistence."
```

### Task 2: Storefront product page with checkout

**Files:**
- Create: `site/composites/storefront.html`
- Create: `site/composites/storefront.js`
- Test: `test/composites-storefront.test.mjs`

**Interfaces:**
- Consumes: shipped primitives below. Produces: standalone page.
- Pricing math (exact, mirrored in JS + tests): base $148; express delivery +$12, standard +$0; total = 148 × qty + delivery. Order total never trusts the DOM — JS recomputes from state on every change.

**Parts:** Thumbnail, RadioList, RadioListItem, Stepper, Step, Button, Field, Card, Collapsible, Badge, Banner, MetadataList, Heading, Text, Divider.

**Page sections:**
1. Product Card: main image (`alt="Drift Wool Runner in Fog"`, id `data-main-image`) + 3 Thumbnail buttons (Fog/Oak/Ink, each with img alt + `data-src`/`data-alt`); Heading "Drift Wool Runner"; Badge success "In stock"; Text price `$148.00` (id `data-price`); rating Text "4.8 (312 reviews)".
2. Variant RadioList labelled "Color" (Fog/Oak/Ink, Fog checked); qty Stepper (minus button `data-qty-minus`, readout `data-qty` starting 1, plus `data-qty-plus`); line total Text (id `data-line-total`, "$148.00"); Button "Add to bag" (`data-add`).
3. Cart Card (id `data-cart`, initially shows EmptyState-ish Text "Your bag is empty."): on add, renders MetadataList row (product, variant, qty) + cart total (id `data-cart-total`).
4. Checkout Card: contact Field email (`data-email`); address Fields street/city/postcode; delivery RadioList (`data-delivery`: standard $0 / express $12); order total Text (id `data-order-total`); Button "Place order" (`data-place`); hidden Banner success region (`data-order-ok`, text starts "Order confirmed. Reference ").
5. Collapsible "Specifications" + "Shipping & returns" with two static paragraphs each.
6. Built-from section (`<section data-built-from>`) listing every data-parts entry as a link to `../components/<Name>.html`.

**JS:** gallery switching (thumbnail click swaps main src/alt); stepper (qty 1–9 clamp, line total = 148×qty); add-to-bag renders cart row + total; delivery change recomputes order total = cart total + fee; place order validates email contains "@" + non-empty street/city/postcode (invalid → error Banner `data-order-error` "Check the highlighted fields." + `aria-invalid` on bad inputs); valid → success Banner with `Order confirmed. Reference DG-<qty><variant-initial><fee>` (e.g. DG-2F12) + clears form errors.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('storefront renders product with scripts disabled', () => {
  const html = readFileSync('site/composites/storefront.html', 'utf8');
  for (const s of ['Drift Wool Runner', '$148.00', '4.8 (312 reviews)', 'Specifications', 'Your bag is empty.']) {
    assert.ok(html.includes(s), `static markup missing: ${s}`);
  }
});
test('storefront uses only shipped parts and documents pricing', () => {
  const html = readFileSync('site/composites/storefront.html', 'utf8');
  const names = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names;
  const parts = [...html.matchAll(/data-parts="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
  assert.ok(parts.length > 10, 'data-parts list missing');
  for (const p of parts) assert.ok(names.includes(p), `unshipped part: ${p}`);
  assert.ok(html.includes('<section data-built-from>'), 'built-from section missing');
  for (const p of parts) assert.ok(html.includes(`../components/${p}.html`), `built-from missing link: ${p}`);
  const js = readFileSync('site/composites/storefront.js', 'utf8');
  for (const s of ['data-qty', 'data-line-total', '148', 'data-delivery', 'data-order-total', 'DG-']) {
    assert.ok(js.includes(s), `JS missing pricing hook: ${s}`);
  }
  for (const bad of ['astryx', 'tailwind', 'bootstrap', 'stylex']) {
    assert.ok(!html.toLowerCase().includes(bad), `foreign marker: ${bad}`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/composites-storefront.test.mjs`
Expected: FAIL with ENOENT.

- [ ] **Step 3: Write the page + JS per sections above.**
- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/composites-storefront.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/composites/storefront.html site/composites/storefront.js test/composites-storefront.test.mjs
git commit -m "Add storefront composite with live cart and checkout totals."
```

### Task 3: AI chat workspace

**Files:**
- Create: `site/composites/chat.html`
- Create: `site/composites/chat.js`
- Test: `test/composites-chat.test.mjs`

**Interfaces:**
- Consumes: shipped primitives below. Produces: standalone page. No backend: replies are canned and local (stated in the UI).

**Parts:** ChatLayout, ChatMessage, ChatMessageBubble, ChatMessageList, ChatMessageMetadata, ChatSystemMessage, ChatComposer, ChatComposerInput, Button, Token, Code, CodeBlock, Heading, Text.

**Page sections (seeded transcript, static):**
1. ChatLayout: main slot = ChatMessageList (aria-label "Conversation") containing: ChatSystemMessage "Demo replies locally — no messages leave this page."; user ChatMessage (author "You", time "09:41") bubble "How do I theme the buttons?"; assistant ChatMessage (author "Cieo", time "09:41") bubble with Text + CodeBlock (`import { Button } from 'cieo/Button';`) + Tokens "theme" "tokens"; each message carries ChatMessageMetadata (author + time).
2. Rail slot: Card "Run details" with MetadataList (Model: cieo-demo, Replies: local, History: kept on page).
3. Composer: ChatComposerInput textarea (label "Message", id `data-input`, placeholder "Ask something…") + Button Send (`data-send`).
4. Built-from section (`<section data-built-from>`) listing every data-parts entry as a link to `../components/<Name>.html`.

**JS:** send on button click or Enter without Shift (Shift+Enter newline); ignore empty/whitespace input; disable send while appending (double-submit guard + `aria-disabled`); append user bubble then, after 400ms, assistant bubble "Logged — demo replies stay on this page." with fresh timestamp; clear input; scroll list to bottom (`scrollTop = scrollHeight`); Escape clears a non-empty draft? No — keep minimal: no Escape behavior.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('chat renders transcript with scripts disabled', () => {
  const html = readFileSync('site/composites/chat.html', 'utf8');
  for (const s of ['How do I theme the buttons?', "cieo/Button", 'Demo replies locally', 'Run details', 'Ask something']) {
    assert.ok(html.includes(s), `static markup missing: ${s}`);
  }
});
test('chat uses only shipped parts and guards sends', () => {
  const html = readFileSync('site/composites/chat.html', 'utf8');
  const names = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names;
  const parts = [...html.matchAll(/data-parts="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
  assert.ok(parts.length > 8, 'data-parts list missing');
  for (const p of parts) assert.ok(names.includes(p), `unshipped part: ${p}`);
  assert.ok(html.includes('<section data-built-from>'), 'built-from section missing');
  for (const p of parts) assert.ok(html.includes(`../components/${p}.html`), `built-from missing link: ${p}`);
  const js = readFileSync('site/composites/chat.js', 'utf8');
  for (const s of ['data-input', 'data-send', 'aria-disabled', 'scrollHeight', '400']) {
    assert.ok(js.includes(s), `JS missing send hook: ${s}`);
  }
  for (const bad of ['astryx', 'tailwind', 'bootstrap', 'stylex', 'fetch(', 'XMLHttpRequest']) {
    assert.ok(!html.toLowerCase().includes(bad) && !js.includes(bad), `foreign/network marker: ${bad}`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/composites-chat.test.mjs`
Expected: FAIL with ENOENT.

- [ ] **Step 3: Write the page + JS per sections above.**
- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/composites-chat.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/composites/chat.html site/composites/chat.js test/composites-chat.test.mjs
git commit -m "Add chat workspace composite with local replies."
```

### Task 4: Scheduling and booking flow

**Files:**
- Create: `site/composites/booking.html`
- Create: `site/composites/booking.js`
- Test: `test/composites-booking.test.mjs`

**Interfaces:**
- Consumes: shipped primitives below. Produces: standalone page.
- Reference code (exact, mirrored in JS + browser test): `BK-<YYYYMMDD>-<HHMM>-<initials>` from selected date, slot, and name initials (uppercase, e.g. day 2026-10-21, 10:30, "Amara Okafor" → `BK-20261021-1030-AO`).

**Parts:** Stepper, Step, Calendar, RadioList, RadioListItem, Field, Button, Card, MetadataList, EmptyState, Banner, Heading, Text.

**Page sections:**
1. Stepper (3 Steps: Day current, Time todo, Details todo; `data-stepper`, steps update `aria-current` as flow advances — advancing = completing prior input, single page, no separate URLs).
2. Calendar October 2026 (`data-calendar`, year 2026 month 10, `data-day` buttons; Sundays disabled with title "No slots Sundays").
3. Slot RadioList (`data-slots`, labelled "Times"): populated by JS per weekday from this exact table — Mon–Fri `09:00, 10:30, 13:00, 15:30`; Sat `10:00, 11:30`; Sun none → EmptyState "No slots on Sundays — pick another day."
4. Details Fields: name (`data-name`), email (`data-email`).
5. Summary rail Card: MetadataList (`data-summary`) with Day/Time/Name rows, "—" placeholders, updating live.
6. Confirm Button (`data-confirm`, disabled until day + slot + non-empty name + email containing "@"); success Card (`data-success`, hidden) with Banner "Booked." + reference Text (`data-reference`).
7. Built-from section (`<section data-built-from>`) listing every data-parts entry as a link to `../components/<Name>.html`.

**JS:** day click (ignore disabled Sundays) → render slots → highlight step 2; slot change → update summary + step 3; name/email input → update summary live; confirm enabled check on every change; confirm → hide form sections, show success with computed reference; invalid email on confirm attempt → error Banner `data-book-error` "Add a valid email." All queries by `data-` hooks.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('booking renders flow with scripts disabled', () => {
  const html = readFileSync('site/composites/booking.html', 'utf8');
  for (const s of ['Day', 'Time', 'Details', 'October 2026', 'No slots on Sundays', 'Booked.']) {
    assert.ok(html.includes(s), `static markup missing: ${s}`);
  }
});
test('booking uses only shipped parts and encodes the reference', () => {
  const html = readFileSync('site/composites/booking.html', 'utf8');
  const names = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names;
  const parts = [...html.matchAll(/data-parts="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
  assert.ok(parts.length > 8, 'data-parts list missing');
  for (const p of parts) assert.ok(names.includes(p), `unshipped part: ${p}`);
  assert.ok(html.includes('<section data-built-from>'), 'built-from section missing');
  for (const p of parts) assert.ok(html.includes(`../components/${p}.html`), `built-from missing link: ${p}`);
  const js = readFileSync('site/composites/booking.js', 'utf8');
  for (const s of ['data-day', 'data-slots', 'data-confirm', 'data-reference', 'BK-']) {
    assert.ok(js.includes(s), `JS missing flow hook: ${s}`);
  }
  for (const bad of ['astryx', 'tailwind', 'bootstrap', 'stylex']) {
    assert.ok(!html.toLowerCase().includes(bad), `foreign marker: ${bad}`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/composites-booking.test.mjs`
Expected: FAIL with ENOENT.

- [ ] **Step 3: Write the page + JS per sections above (exact slot table, exact reference format).**
- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/composites-booking.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/composites/booking.html site/composites/booking.js test/composites-booking.test.mjs
git commit -m "Add booking flow composite with live summary."
```

### Task 5: Index, browser harness, and wiring

**Files:**
- Create: `site/composites/index.html`
- Create: `test/browser/composites.py`
- Create: `test/composites-index.test.mjs`
- Modify: `package.json` (append `"test:composites": "python3 test/browser/composites.py"` after the `"test:browser"` line — read the file, keep every other line identical)

**Interfaces:**
- Consumes: the four pages from Tasks 1–4 (run this task only after all four are merged); `test/browser/smoke.py` serving pattern (http.server on 127.0.0.1, playwright chromium, pageerror listener).
- Produces: browsable index + runnable browser gate + node meta-tests.

- [ ] **Step 1: Write `site/composites/index.html`** — Heading "Composites", Text "Whole screens built only from the parts above — each doubles as proof the parts fit together.", four Cards (Admin dashboard with settings → `./dashboard.html`; Storefront product page with checkout → `./storefront.html`; AI chat workspace → `./chat.html`; Scheduling and booking flow → `./booking.html`), each card one-sentence summary + link. Static, tokens only, no JS.
- [ ] **Step 2: Write `test/browser/composites.py`** — exact harness:

```python
import json, subprocess, sys, time, pathlib
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parents[2]
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '4799', '--bind', '127.0.0.1'], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
checks = {}
try:
    time.sleep(0.6)
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page()
        errors = []; pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto('http://127.0.0.1:4799/site/composites/dashboard.html')
        pg.click('text=Settings'); pg.fill('input[data-setting="store"]', 'Drift Goods 2')
        pg.click('text=Save settings'); pg.reload()
        checks['settings-persist'] = pg.input_value('input[data-setting="store"]') == 'Drift Goods 2'
        checks['settings-panel'] = pg.locator('text=Settings saved.').is_visible()
        pg.goto('http://127.0.0.1:4799/site/composites/storefront.html')
        pg.click('[data-qty-plus]'); pg.click('[data-qty-plus]')
        pg.check('input[value="express"]')
        checks['cart-total'] = pg.text_content('[data-order-total]').strip() == '$456.00'
        pg.goto('http://127.0.0.1:4799/site/composites/chat.html')
        before = pg.locator('.cieo-chat-message').count()
        pg.fill('[data-input]', 'Hello'); pg.click('[data-send]'); pg.fill('[data-input]', 'Again')
        pg.dblclick('[data-send]')
        pg.wait_for_timeout(900)
        checks['chat-single-append'] = pg.locator('.cieo-chat-message').count() == before + 2
        pg.goto('http://127.0.0.1:4799/site/composites/booking.html')
        checks['confirm-gated'] = pg.locator('[data-confirm]').is_disabled()
        pg.click('[data-day="2026-10-21"]'); pg.check('input[value="10:30"]')
        pg.fill('[data-name]', 'Amara Okafor'); pg.fill('[data-email]', 'a@example.com')
        pg.click('[data-confirm]')
        checks['booking-ref'] = (pg.text_content('[data-reference]') or '').strip() == 'BK-20261021-1030-AO'
        checks['no-errors'] = (errors == [])
        b.close()
    print(json.dumps(checks, indent=1))
    ok = all(checks.values()) and len(checks) == 6
    print('COMPOSITES', 'PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
finally:
    srv.terminate()
```

Notes the implementer must honor (not placeholders — structural requirements): dashboard inputs carry `data-setting="store"` etc. aligned with Task 1's `data-setting` hooks (if Task 1 named them differently, update THIS file to match Task 1's committed markup — read it first); storefront express radio has `value="express"` and totals start from the plan's pricing math (3 × 148 + 12 = 456); chat message count uses the `.cieo-chat-message` class Task 3 renders; booking day button carries `data-day="2026-10-21"` (a Wednesday) and slot radios carry time values. If any Task 1–4 markup differs, adapt this harness to the committed markup and say so in the report — do not edit their pages.

- [ ] **Step 3: Write `test/composites-index.test.mjs`**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('composites index links four existing pages', () => {
  const html = readFileSync('site/composites/index.html', 'utf8');
  for (const p of ['dashboard.html', 'storefront.html', 'chat.html', 'booking.html']) {
    assert.ok(html.includes(p), `index missing ${p}`);
    assert.ok(existsSync(`site/composites/${p}`), `page missing: ${p}`);
  }
});
test('every composite page lists shipped parts', () => {
  const names = JSON.parse(readFileSync('docs/generated/primitive-exports.json', 'utf8')).names;
  for (const p of ['dashboard', 'storefront', 'chat', 'booking']) {
    const html = readFileSync(`site/composites/${p}.html`, 'utf8');
    const parts = [...html.matchAll(/data-parts="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
    assert.ok(parts.length > 5, `${p} data-parts list missing`);
    for (const part of parts) assert.ok(names.includes(part), `${p} uses unshipped part: ${part}`);
  }
});
```

- [ ] **Step 4: Run `node --test test/composites-index.test.mjs` (expect PASS) and `python3 test/browser/composites.py` (expect COMPOSITES PASS).** If the browser run fails on markup mismatches vs Tasks 1–4, adapt the harness (never their pages) and re-run.
- [ ] **Step 5: Commit**

```bash
git add site/composites/index.html test/browser/composites.py test/composites-index.test.mjs package.json
git commit -m "Add composites index with browser gate for all four screens."
```

## Acceptance and execution handoff

- [ ] Tasks 1–4 green, reviewed, merged (each independently shippable; review in any order).
- [ ] Task 5 green (index + browser PASS + package script), reviewed, merged.
- [ ] Integrator runs full `npm run check` plus `python3 test/browser/composites.py`, pushes.
- [ ] Residual load-bearing findings surface; minors park with rulings.
