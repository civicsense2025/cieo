# Cieo

Calm, critically damped spring motion for the web (plain DOM and React) and SwiftUI, plus the Motion Atoms library as recipes on both platforms. At-rest steps use non-bouncy curves; explicit release velocity can still carry a value past its target. The optional design foundation adds a visual identity without coupling the motion engine to a framework.

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

## Develop

```bash
npm install && npm test             # builds dist/ and runs the spring tests
swift build && swift test           # Swift package and tests
node scripts/build-catalogue.mjs    # rebuild docs/catalogue.html from atoms/web
node scripts/gen-swift-index.mjs    # relist Swift atoms after adding one
```

`dist/` remains committed. `npm run check` verifies the engine build, the design contract, the improvement ledger, public types, and tracked generated styles. `npm run build:design` regenerates portable assets. No runtime dependency or license change accompanies the design layer.
