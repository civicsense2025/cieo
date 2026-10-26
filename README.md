# Cieo

Calm, critically damped spring motion for the web (plain DOM and React) and SwiftUI, plus the Motion Atoms library as recipes on both platforms. At-rest steps use non-bouncy curves; explicit release velocity can still carry a value past its target. The optional design foundation adds a visual identity without coupling the motion engine to a framework.

## Install

Web (from this private repo; pin a tag):

```bash
npm install github:civicsense2025/cieo#v0.6.4
```

SwiftUI: in Xcode, File → Add Package Dependencies → `https://github.com/civicsense2025/cieo`, then add `Cieo` (and `CieoAtoms` for the reference atoms).

For reusable production controls, add the separate `CieoUI` product. Its [Apple foundation](docs/apple-components.md) organizes foundations, atoms, molecules and organisms independently of the recipe catalogue. Native Button/TextField semantics remain intact; host-owned state and actions stay outside the design layer. Install `.renderingPreferences()` at the host root, and opt into the bounded Metal decoration only where useful.

## Use

```ts
import { Track, S } from 'cieo';                  // spring math, no DOM
import { enter, exit, swap, flip, digits, edges, track, scrollTo } from 'cieo/dom';
import { useSpring, SwapText, Digits, useEdges, useFlip, usePresence } from 'cieo/react';
import 'cieo/tokens.css';                          // --motion-duration-*, --motion-ease-spring
```

```swift
import Cieo
withMotion(.base, reduceMotion: reduce) { selected = tab }
Text(label).motion(.snap, value: isOn)
SwapText(status)            // old text out, new text in
RollingDigits(count)        // only changed digits roll
view.transition(.motionPresence)
```

## Design foundation

Open the [design studio](docs/studio/index.html), read the [integration guide](docs/design-system.md), or inspect the [source-mapped improvements](docs/improvements.json). The [review](docs/review.md) records the baseline and the remaining integration boundaries.

```sh
npm run studio                 # Modular preview, served on loopback
npm run studio:standalone      # Generate Cieo-studio.html for offline use
npm run test:design            # Dependency-free design and native-export tests
npm run test:design:types      # Public TypeScript consumer contract
```

```js
import { createTheme, applyTheme, toDTCG, toNative } from 'cieo/design';
import 'cieo/design.css';
import 'cieo/primitives.css';
const theme = createTheme({ brand: 'iris', scheme: 'dark', radius: 'soft' });
const controller = applyTheme(document.documentElement, theme);
// Dispose at the host framework's unmount boundary.
controller.destroy();
```

The design layer has six brand starting points, 73 semantic tokens, explicit color-pair audits, scoped theming, a CLI, typed JSON, and Swift/Rust/Kotlin/Dart/Python/C constant generators. Native hosts still supply their own components, rendering, accessibility, and text scaling. The existing Motion Atoms catalogue and its recipe runtime remain unchanged.

Pin a reviewed commit or release containing this change. Older tags don't acquire new files when this branch changes. `prepare` and `prepack` generate portable token artifacts using only Node built-ins; the checked-in spring engine still needs no consumer-side TypeScript compilation.

## Springs

| Preset | w (rad/s) | Settles (99%) | Use for |
| --- | --- | --- | --- |
| snap | 34 | 200 ms | presses, checks, knobs, chevrons, exits |
| base | 22 | 300 ms | indicators, swaps, overlays, list reflow |
| soft | 15 | 440 ms | progress, size morphs, scrolling |
| lazy | 9 | 740 ms | ambient decoration only |

Shared rules: content leaves in 100 ms before new content enters; a sliding indicator's trailing edge follows 60 ms behind; group stagger never exceeds 300 ms; new list items arrive from 0.45 opacity, never from 0. In SwiftUI, `.motion(preset)` is `interpolatingSpring(stiffness: w², damping: 2w)`, the same curve as the web.

## Atoms

- `atoms/web/index.json`: every atom (id, category, name, summary, file). The recipe code is in `atoms/web/blocks/` (agent identity in `atoms/web/identity/`). The recipes run on the catalogue's own runtime (`atoms/web/runtime.core.js`); port the pattern into your app with `cieo/dom` or `cieo/react`.
- `atoms/swift/<Category>/`: one SwiftUI view per atom, same id, built on Cieo. Browse them with `MotionAtoms.all`.
- `docs/catalogue.html`: the full interactive catalogue (open in a browser). `docs/agent-identity.html`: agent icons and characters.

## Controls

Form controls on the same springs, for React 18+ (`cieo/controls`, styles in `cieo/controls.css`). Every control renders a real native element on the server, so a GET form submits the right `name=value` pairs with no JavaScript at all; scripts only add motion and the custom listbox.

```tsx
import { Button, Select, TextField, TextArea, SearchField, Checkbox, RadioGroup, Radio, Switch, Range, buttonClassName } from 'cieo/controls';
import 'cieo/tokens.css';
import 'cieo/controls.css';

<form method="get">
  <SearchField name="q" label="Search bills" />
  <Select name="sort" label="Sort" options={[{ value: 'new', label: 'Newest' }, { value: 'old', label: 'Oldest' }]} autoSubmit />
  <Checkbox name="voted" label="Only bills with votes" />
  <Button type="submit" variant="primary">Apply</Button>
</form>
<a href="/bills" className={buttonClassName({ variant: 'secondary' })}>All bills</a>
```

| Component | Key props |
| --- | --- |
| `Button` | `variant` primary, secondary (default), ghost, text; `size` sm, md; `icon`; icon-only needs `aria-label` (enforced by the types); `block`; `state` idle, pending, done with `pendingLabel` and `doneLabel` morphs in place |
| `buttonClassName(opts)` | the same classes for an `<a>` or `<Link>`; plain function, callable from a server component |
| `Select` | `label` (required), `hideLabel`, `name`, `options` (strings or `{ value, label, disabled }`), `value` or `defaultValue`, `onValueChange`, `autoSubmit`, `form`, `size`, `description` |
| `TextField` | `label` (required), `type` text, email, search, url, number, tel, password; `description`, `error`, `validate(value)` returns a message, `status`, `prefix`, `suffix` |
| `TextArea` | the field props plus `minRows`, `maxRows`, `showCount` (with `maxLength`) |
| `SearchField` | `label` (required, hidden unless `showLabel`), `onSearch`, `onClear`, `clearLabel`, `collapsible` |
| `Checkbox`, `Switch` | `label` (required), `hideLabel`, `description`; `Checkbox` also `indeterminate`. Native input props pass through |
| `RadioGroup`, `Radio` | group: `label` (legend), `name`, `value` or `defaultValue`, `onValueChange`, `orientation`; radio: `value`, `label` |
| `Range` | `label` (required), `min`, `max`, `step`, `showValue`, `formatValue` |

Select reserves its indicator at inline-end in both LTR and RTL. Open option labels
wrap within the list at enlarged text sizes; long words break without horizontal
scrolling. The closed trigger retains its single-line value and the native form
control remains the value source. Popup visibility is owned by the control; hosts
only need the documented token and control stylesheets.

Text inputs and textareas retain native `value`/`defaultValue`, forwarded refs,
form names and browser validity. In the current local source, `TextField` and
`TextArea` call the host's `onChange` once before internal validation in the
change bubble. Validation does not update React state during input capture,
which could restore a controlled value before React reads the edit. Native
`onInput` remains available; `TextArea` also uses it for count and height.
`onBlur` performs the field transition and preserves the host callback. Explicit
`status` takes precedence over the field machine, and host `error` supplies the
message. Hosts own asynchronous submission, errors, cancellation and persistence.

The controlled/uncontrolled regression fixtures are
[test/browser/inputs.tsx](test/browser/inputs.tsx) and
[test/browser/inputs.py](test/browser/inputs.py). These callback repairs are
unpublished local source changes, not a claim about installed version 0.3.0.
On an uncancelled native form reset, SearchField refreshes its filled/clear
affordance and TextArea refreshes count and bounded height after the browser
restores defaultValue. Cancelled resets preserve values, status and presentation;
controlled fields retain host-owned values. Reset does not invoke search/clear or
change callbacks. Current local browser fixtures pass 109 checks with actual
control CSS in Chromium 153 at 900px and reduced motion, covering edits, callback
order, validation/recovery, controlled updates, native reset and cancelled reset.
That receipt does not establish localization or assistive-technology acceptance.

The local [Radio implementation](src/controls/Toggles.tsx) forwards a standalone
native `name`. Uncontrolled RadioGroup uses native defaultChecked ownership;
reset restores its initial choice and cancelled reset preserves the current
choice through unrelated host rerenders, without selection callbacks. Controlled
groups retain host-owned checked values and prop updates. The
[Radio fixture](test/browser/radio.tsx) and [browser checks](test/browser/radio.py)
pass 31 checks with actual CSS in Chromium 153 at 900px and reduced motion,
including ref/label/description, Space/arrows, disabled fieldsets, FormData and
independent names. These are unpublished source repairs. Existing controlled
consumer usage against installed 0.3.0 remains a distinct boundary.

The reconciled local producer package receipt records 771 passing tests and
two skips, alongside 140 browser checks (109 text-input/reset and 31 Radio).
These checks apply to the local source candidate; the original draft PR #9 at
`f7319de` remains a separate reviewed source identity. No merge, release or
consumer dependency update is implied.

How they behave without scripts: `Select` is a styled native select (after hydration it becomes a combobox and listbox with arrows, Home, End, Page keys, type-ahead, Enter, Space, Escape and Tab; the native select stays in the form, invisible and hidden from assistive tech, and receives every pick as a real `change` event). Field labels float with CSS alone, a server `error` shows its message, and `Range` draws its fill at the initial value. `autoSubmit` needs scripts, so keep a submit button in the form.

Next.js: the components are client modules (`'use client'` per file); a server component can render them with serialisable props (`options`, `autoSubmit`), but not `onValueChange`. The listbox is positioned inside the control, so an ancestor with `overflow: hidden` clips it.

Theme with these variables (all optional; the fallbacks are system colours, so dark mode follows `color-scheme` until you set your own):

| Variable | Default | Used for |
| --- | --- | --- |
| `--cieo-control-bg`, `--cieo-control-fg` | `Field`, `FieldText` | control surface and text |
| `--cieo-control-muted` | fg at 62% | labels at rest, placeholders, descriptions |
| `--cieo-control-border`, `--cieo-control-border-strong` | fg at 24%, 48% | borders, hover borders |
| `--cieo-control-raised` | fg at 8% | hover fills, the listbox highlight |
| `--cieo-control-accent`, `--cieo-control-accent-fg` | `CanvasText`, `Canvas` | primary button, checked fills, switch track |
| `--cieo-control-danger`, `--cieo-control-success`, `--cieo-control-success-fg` | red, green, `Canvas` | invalid and valid states, done buttons |
| `--cieo-control-popover-bg`, `--cieo-control-shadow`, `--cieo-popover-z` | bg, soft shadow, 50 | the listbox |
| `--cieo-control-knob` | bg | switch knob, range thumb |
| `--cieo-radius` | 10px | corner radius |
| `--cieo-control-height-sm`, `--cieo-control-height-md`, `--cieo-field-height` | 32px, 40px, 52px | control heights |
| `--cieo-focus-ring`, `--cieo-focus-offset` | 2px solid accent, 2px | focus outline |
| `--cieo-control-font` | inherit | font family |
| `--cieo-search-width`, `--cieo-search-radius` | 100% (16rem collapsible), pill | search field |

On touch screens (`pointer: coarse`) every control has at least a 44px hit area. `docs/controls.html` shows every control in light and dark; rebuild it with `node scripts/build-controls-demo.mjs`.

## Agents

`cieo/agent` folds an agent host's ordered event log (run and agent status, streamed messages, tool calls, approvals, anchored drafts, artifacts) into bounded, render-ready state. It also follows a server-sent event stream that resumes from the last applied event. It has no DOM and no dependencies. `cieo/agent/react` adds `useAgentStore` and `useAgentStream`. Approvals are never optimistic: the host reports every decision. See [docs/agent.md](docs/agent.md).

## Develop

```bash
npm install && npm test             # builds dist/ and runs the spring tests
swift build && swift test           # Swift package and tests
node scripts/build-catalogue.mjs    # rebuild docs/catalogue.html from atoms/web
node scripts/gen-swift-index.mjs    # relist Swift atoms after adding one
```

`dist/` remains committed. `npm run check` verifies the engine build, the design contract, the improvement ledger, public types, and tracked generated styles. `npm run build:design` regenerates portable assets. No runtime dependency or license change accompanies the design layer.
