# Cieo collection UI refinement

This updates the existing `docs/library.html` and `docs/catalogue.html`, not a parallel theme studio. Both build from the same registered recipes and the existing catalogue motion runtime. The reviewed main commit is `353abc97e90fdabed8161d06eb6553e6926fc4ea`.

## What changes on screen

The full-screen jump menu becomes a compact collection rail on desktop and a native browsing dialog on smaller screens. The actual recipes occupy the main canvas. Four collection folders provide entry points without removing the 45 original categories. Search, family filters, saved atoms, appearance, speed and pause act on the real registry. All 345 catalogue atoms remain registered; the source index additionally includes identity records that aren't catalogue tiles.

The new presentation uses subdued lilac, blue, mint, peach and butter preview grounds, softer white surfaces, clearer labels, reduced chrome and consistently placed inspection controls. An 8px layout unit governs chrome spacing, gaps, panel padding and principal control geometry; type sizes, hairline borders and optical icon offsets are exceptions. This isn't a claim that every dimensional value inside every legacy recipe has been rewritten.

The inspector moves the existing live stage into a native dialog. It doesn't clone the atom, initialize another renderer or reset its state. A same-height placeholder keeps the gallery from collapsing behind the dialog. Escape, explicit close, backdrop dismissal, focus containment and focus restoration are implemented. The exact recipe source is linked, and copying the recipe snippet reports clipboard failures honestly.

At desktop widths the collection rail stays visible. At tablet widths it becomes a browsing sheet. Phone layouts use a single preview column, scrollable motion-family controls, a compact bottom navigation dock and bounded inspectors. Safe-area insets and 48px navigation targets protect touch use. The gallery is tested at 320, 375, 390, 768, 1024, 1440 and 1920 CSS pixels. A breakpoint test is not a guarantee for every device or browser.

## Actual recipe changes

Twenty-five existing recipe files receive direct visual or interaction refinements:

| Recipe | Change |
| --- | --- |
| Tabs with panel | Actual panel composition, readable typography, roving keyboard selection, preserved edge/Swap animation and resize-aware layout. |
| Accordion | Roomier rows, consistent inset, expanded/controlled-panel semantics. |
| Notification badge | Composed surface, readable badge, live status. |
| Morph button/chip | More comfortable geometry, spacing and accent treatment. |
| Floating-label field | Larger field, aligned label, error relationship. |
| Rubber-band slider | Composed surface, accessible value and keyboard adjustment. |
| Switch | Real settings row, 8px-aligned track geometry and one state change per pointer/keyboard activation. |
| Toast stack | Clearer hierarchy, status semantics and keyboard dismiss control. |
| Dropdown | Larger trigger/rows, directional keyboard navigation, Escape and focus return. |
| Command palette | Bounded scrollable list, spacious input, active-option semantics and existing command filtering. |
| Copy button | Comfortable target and truthful clipboard feedback. |
| Select | Trigger/row sizing and explicit selected-option state. |
| Combobox | Aligned input/list spacing and input naming. |
| Popover | Better padding and copy feedback. |
| Dialog | Readable typography, spacing and stage-local focus behavior. |
| Drawer | Panel width matches its animation travel, hidden navigation is inert and Escape dismisses. |
| Radio group | Composed surface, larger selection geometry and row rhythm. |
| Checkbox group | Consistent box/row dimensions and retained mixed-state behavior. |
| Tag input | Comfortable field/chips and clear remove controls. |
| File drop zone | Real drop handling, bounded list and image object-URL cleanup. |
| Selection toolbar | Larger actions, clearer text and constrained toolbar positioning. |
| Color picker | Repaired preset-row layout, hue/saturation keyboard access and honest copy feedback. |
| Layer tree | Row rhythm, wrapping controls and keyboard selection/collapse. |
| Writing goal ring | Composed progress surface around the original ring/Digits implementation. |
| Bare writing page | Improved reading surface and keyboard-operable Write action. |

The other atoms receive shared catalogue presentation and style isolation, not an individually certified redesign. No new fake cards replace their live renderers.

## The cross-recipe style defect

Recipes embed ordinary `<style>` elements. Those selectors were global: the pricing preview's `.ps` rule repositioned the color picker's `.ps` preset row. `catalogue/isolation.js` parses each recipe stylesheet and scopes selectors to its stable `data-atom` boundary. The same boundary travels with the live stage into the inspector. A regression checks both the picker's static positioning and horizontal preset layout. Global animation names remain legacy behavior and aren't claimed to be a complete shadow-DOM sandbox.

## Motion retained

`atoms/web/runtime.core.js`, `src/`, `dist/`, `Sources/` and `Tests/` are unchanged by this UI refinement. The catalogue and refined recipes use the original Track, edges and Swap primitives. Overlay entry also uses Track. There is no replacement spring formula. Registry metadata records each recipe's original file. Initializers run lazily as previews enter the viewing area. A map replaces repeated registry searches in intersection callbacks.

Pause stops advancement of the shared preview clock; hidden tabs stop the catalogue frame loop. Reduce Motion renders settled snapshots after interactions. Some legacy recipes own independent timers, so this isn't a guarantee that all 345 recipes have no independent motion or an accessibility conformance certificate.

## Reference evidence

The public reference pages were captured at 1440px during this review, including a second viewport position and Recollect's published product image. They informed the hierarchy and surface treatment; their logos, product screenshots and font files aren't shipped as Cieo assets.

- [Recollect](https://recollect.so/): small folder collections, quiet sidebar, content-led browsing, soft surfaces and colorful saved material.
- [Figma Design](https://www.figma.com/design/): canvas-first composition and restrained contextual controls.
- [Graphical](https://www.graphicalui.com/): playful graphic forms within a quiet interface.
- [Current Gesso dock surfaces](https://github.com/civicsense2025/forma-gesso/blob/61008112fadbecfcc64e4b79b387277c39a88543/gesso-web/features/editor/dock/DockSurfaces.module.css): bounded popovers, layered panel hierarchy, mobile sheets and focus treatment.

This is an original Cieo adaptation, not a pixel-identical clone or work performed by an Apple design team.

## Build and validation

```sh
npm ci
npm run check
node scripts/build-library.mjs
node scripts/build-catalogue.mjs
node --test test/catalogue/build.test.mjs
python -m pip install playwright==1.55.0
python -m playwright install chromium
python test/catalogue/ui_smoke.py
```

Both documents are self-contained. The optional `--linked` build is for source debugging and requires the complete checkout; it isn't the delivered standalone file. The local restricted browser run uses `CIEO_DOCUMENT_ONLY=1` and verifies the actual inline document without claiming an HTTP navigation. The branch workflow runs the same browser suite over HTTP and publishes private review artifacts.

The browser suite checks the full registry's initialization and sampled render frames, then selected interactions, keyboard paths, the moving inspector, stylesheet isolation, appearance, seven widths, reduced motion and forced colors. It doesn't substitute for testing every state of every legacy atom, Safari/Firefox or assistive technologies. The patch does not modify native SwiftUI component visuals, publish a release, deploy publicly or merge into main.
