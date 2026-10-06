# cieo

Calm, critically damped spring motion for the web (plain DOM and React) and SwiftUI, plus the Motion Atoms library as recipes on both platforms. Nothing overshoots or bounces, interrupted motion never jumps, and reduced motion makes everything instant.

## Install

Web (from this private repo; pin a tag):

```bash
npm install github:civicsense2025/cieo#v0.1.0
```

SwiftUI: in Xcode, File → Add Package Dependencies → `https://github.com/civicsense2025/cieo`, then add `Cieo` (and `CieoAtoms` for the reference atoms).

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

## Develop

```bash
npm install && npm test             # builds dist/ and runs the spring tests
swift build && swift test           # Swift package and tests
node scripts/build-catalogue.mjs    # rebuild docs/catalogue.html from atoms/web
node scripts/gen-swift-index.mjs    # relist Swift atoms after adding one
```

`dist/` is committed so a git install needs no build step; `npm run check` fails if it is stale.
