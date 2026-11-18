# Primitive customization

All 254 catalogue exports have an explicit customization contract: 242 expose named presentation slots directly, and twelve delegate to an existing owning API. Pure, hook-free layout, typography, and display primitives ship as React Server Components without `'use client'`. The [inventory](generated/primitive-customization.json) records each component, layer, named parts, and content slots.

## Presentation and composition

Use `className` to add a root class. Use `slotProps` to style a named part without querying an internal class or copying the component. Parts accept `className`, `style`, `title`, and non-reserved `data-*` attributes. Built-in classes remain; library inline geometry wins where it carries positioning, progress, or animation state.

Keep existing composition props such as `children`, `trigger`, `title`, `actions`, `nav`, and `renderItem`. EmptyState additionally accepts icon/title/description/action content slots. Authentication cards accept beforeForm/afterForm/footer slots while retaining the library-owned credential form; an explicit null footer suppresses the default footer.

Slots deliberately cannot replace native elements, handlers, refs, roles, ARIA, values, sanitized destinations, disabled states, or library data-state markers. The shared presentation helper enforces that boundary at runtime as well as in TypeScript. This is a customization boundary for trusted host code, not a sanitizer for untrusted CSS or React content.

## Delegated APIs

Button, TextField, TextArea, Switch, RadioGroup, CheckboxInput, CheckboxListItem, RadioListItem, PowerSearch, Selector, and Slider remain aliases of Cieo's production controls (`Button`, `TextField`, `TextArea`, `Switch`, `RadioGroup`, `Checkbox`, `Radio`, `SearchField`, `Select`, and `Range`). Because every control in `cieo/controls` exposes typed `slotProps` (`ControlPartProps`), these eleven delegated primitives inherit their owning control's named presentation parts directly without introducing duplicate control implementations. VStack delegates to Stack and inherits its named `root` presentation slot.

Decorative motion internals and hidden assistive text are not replacement content slots. A host can customize their surrounding named surface, while semantic text and movement remain library-owned.

## Verification and maintenance

`npm test` includes rendered customization tests for all 81 non-Popover/TabList molecules, all 25 organisms, representative native atoms, executable-prop rejection, protected form values, and dynamic geometry. A catalogue test typechecks all 215 named root contracts and verifies that click handlers are rejected from presentation slots. A data-attribute scan guards every owned catalogue marker against runtime replacement.

Run `node scripts/check-primitive-customization.mjs --write` when a public contract changes. The non-writing invocation verifies inventory drift. `scripts/build-component-pages.mjs` synchronizes missing property rows from manifests while preserving authored rows; generated rows update when their contract changes.

These checks establish source, types, and server-rendered markup. They do not certify every primitive's keyboard, focus, motion, or assistive-technology behavior on a real device. The Popover integration has a separate browser gate; other interaction changes require their owning browser tests.
