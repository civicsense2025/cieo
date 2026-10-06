# Catalogue UI: the original atoms, refined

## What changes

`docs/library.html` is the primary entry. It now browses the same 345 registered atoms using a quiet sidebar, searchable collections, pocket-like category previews, favorites, motion-family filters and explicit contextual inspection. The redesign does not depend on the separate design-token workbench in PR #1.

The original `atoms/web/runtime.core.js`, the published motion engines under `src/`, and the Swift package are unchanged. The library builder includes that exact runtime and the same 212 ordered recipe source scripts. New panel entrances use its `Track` and `S.base`, rather than another spring equation.

The source edits directly refine 27 recipe files: tabs, accordion, stepper, notification badge, chip, counter, progress, email field, rubber-band slider, switch, toast stack, dropdown, bottom sheet, command palette, morphing surface, copy button, checklist, toggle group, color picker, side-detail sheet, binder, focus line, scrivenings, lede, style painter, headline comparison and outline. The side-detail source also contains nine other patterns; those nine are not counted as rewritten components.

Examples of behavioral changes accompany the visual work. Tabs have roving keyboard focus. Dropdowns move focus into their menu and return it after selection. The switch activates once with Space. The sheet has a real close control. The slider supports Home and End. Copy buttons report success only after clipboard completion. The palette reuses its swap layers instead of accumulating a new layer for every command. Shared recipe styles carry surface, typography, accent and control refinements into the real catalogue.

## Visual references

[Recollect](https://recollect.so/) and its [official iPad app image](https://recollect.so/images/recollect-ipad-hero.png) informed the quiet chrome, content-first gallery, soft translucent collection pockets and restrained pops of color. The pockets and icons here are original CSS/SVG, not extracted product artwork or trademarks.

[Figma's navigation documentation](https://help.figma.com/hc/en-us/articles/360039831974-Explore-the-navigation-bar-and-left-sidebar) and [properties-panel documentation](https://help.figma.com/hc/en-us/articles/360039832014-Design-prototype-and-explore-layer-properties-in-the-right-sidebar) informed the separation of browsing from explicit inspection. [Graphical](https://www.graphicalui.com/) informed the cohesive presentation of component states, type and spacing rather than isolated demos.

The current Gesso [StudioEditorFrame implementation](https://github.com/civicsense2025/forma-gesso/blob/61008112fadbecfcc64e4b79b387277c39a88543/apple/Gesso/Studio/Shell/StudioEditorFrame.swift) informed docked/nonmodal desktop inspection and modal touch panels. Its [computed-token inventory](https://github.com/civicsense2025/forma-gesso/blob/61008112fadbecfcc64e4b79b387277c39a88543/design-system/plan/handoffs/inv-tokens.md) was read rather than assuming the older token file represented the rendered application. This change does not modify Gesso.

## Layout and ownership

The new shell uses an 8px rhythm for major padding, gaps, panel dimensions and touch targets. Hairlines, type sizes, icon strokes and inherited canvas geometry have optical or behavioral exceptions. This is not a claim that every numeric literal in all 345 legacy recipes is an 8px multiple.

Desktop inspection is a nonmodal side panel above 1279px. Below that width the same inspector content moves into a native HTML dialog. Browsing becomes a drawer below 960px. On phones, search gets its own 48px row, collection previews scroll horizontally, and view settings become a bottom-positioned dialog. Pointer-coarse catalogue actions have 48px targets. Native platform apps are not rewritten by this web change.

Expanded previews move the original tile into a dialog, retain the atom's ID and all existing event handlers, and restore the original tile and opener on close. They never clone or reinitialize the selected recipe. The new inspector opens only through a deliberate action, not on scroll.

Offscreen recipe markup and initializers are deferred until first visibility. After first mounting, the original state remains intact. Only visible recipes run through the page's render loop. The loop itself still requests frames; this is not a claim of a new zero-idle scheduler. Reduced-motion and pause preferences freeze preview time and settle feedback after input. The original runtime's math is not altered.

Search and filters support shareable fragments and the old category/atom hashes. Favorites and view settings use two narrowly named local-storage keys. Unavailable storage produces a visit-only fallback. Recipe download returns the actual definition; copy falls back to selected text when clipboard permission is unavailable. Exported recipes still require the catalogue runtime and shared styles; they are not advertised as standalone production components.

## Verification

Run `npm ci && npm test`, `node scripts/build-library.mjs`, and `node scripts/build-catalogue.mjs`. The browser harness is `python3 test/catalogue-ui/smoke.py`; it uses an HTTP origin by default. `--offline` renders the exact generated document with Playwright `set_content` when a local HTTP origin is unavailable. `test/catalogue-ui/integrity.py` initializes and renders every original recipe once in a separate, stable viewport.

The harness checks search, reset, saved filters, real-origin persistence, tab keys, Space activation, menu focus, field validation, sheet closure, slider endpoints, real recipe download, expanded-preview state, inspector migration, settings, motion preferences, phone drawers and page overflow at 320, 390, 599, 768, 959, 1024, 1279, 1440 and 1920px. It saves screenshots and structured results as review artifacts. A first-frame pass is not a full behavioral audit of all 345 recipes.

Safari, Firefox, assistive technologies, real mobile hardware, every legacy drag surface and actual clipboard grants still require device testing. Colors and semantics in untouched recipes are not declared accessibility-certified. The existing React controls and SwiftUI atom implementations are preserved, not claimed to have received the same visual revision. No runtime dependency versions, product licensing, repository visibility or main-branch release settings change.

The existing brand-name scan also misclassified Swift’s `.linear(duration:)` call as a brand word. Its allow-list now recognizes that specific API spelling; the scan stays enabled.
