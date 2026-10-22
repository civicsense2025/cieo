# Apple component foundation

Cieo owns the reusable Swift source. `CieoUI` depends only on the existing Cieo motion engine; the complete 550-recipe native catalogue remains in the separate `CieoAtoms` product. `CieoGallery` exposes both that catalogue and the reusable controls without changing authentication.

The [catalogue migration receipt](catalogue-inventory.md) records current recipe identities and source hashes; it does not establish production component readiness.

## Contents

- [Implementation contract](#implementation-contract)
- [Rendering and acceptance](#rendering-and-acceptance)
- [Interactive gallery](#interactive-gallery)
- [Soft surfaces](#soft-surfaces)
- [Host configuration and semantic copy](#host-configuration-and-semantic-copy)
- [Display type, colour blocks and cuts](#display-type-colour-blocks-and-cuts)
- [Slots, not hard-coded styling](#slots-not-hard-coded-styling)
- [Consumer rollout boundary](#consumer-rollout-boundary)
- [Documentation ownership](#documentation-ownership)

## Implementation contract

1. Foundations own semantic palette, spacing and the rendering policy.
2. Atoms style native controls and provide a decorative, optional Metal surface.
3. Molecules combine labels, controls and truthful status messages.
4. Organisms compose state panels and content sections, leaving data and actions with the host.
5. A portable runtime snapshot mirrors the exact core/UI sources into the Apple starter, with revision and content hashes checked before builds.

Keep iOS 17/macOS 14 support, system text scaling, native keyboard/focus behavior and stable identities. Building CieoUI requires Xcode 16 or later for the back-deployed `@Entry` macro; verification uses Xcode 27. Reduce Motion disables movement. Background, Low Power Mode, increased contrast and reduced transparency constrain optional graphics. Production controls own no display links, perpetual animation, full-screen blur, forced rasterization or authentication. Selected reference recipes can demonstrate ongoing motion; metadata rows never create those views and inactive detail views unmount their content.

## Rendering and acceptance

Use SwiftUI transforms and narrow Cieo springs for interaction. An opt-in, bounded Metal color effect highlights decorative geometry only; it never processes text, controls or identity content. Its static fallback carries the same meaning. Apple documents [shader effects](https://developer.apple.com/documentation/swiftui/shader), [bundle lookup](https://developer.apple.com/documentation/swiftui/shaderlibrary/bundle(_:)) and [offscreen drawing costs](https://developer.apple.com/documentation/swiftui/view/drawinggroup(opaque:colormode:)). Native rendering is not a frame-rate guarantee.

Acceptance requires the Cieo full package and web gates, policy regression tests, exact mirror verification, the starter's existing auth gate, and an unsigned simulator build including Metal resources. Rendered compact/large-text/dark-mode and Reduce Motion observations are separate from compilation. Physical-device GPU, energy and hitch measurements remain separate evidence; do not invent them from simulator or source checks.

## Interactive gallery

The optional `CieoGallery` product contains local fixtures and no authentication dependency. Its opening screen searches all 550 recipes, filters by searchable category and provides Saved and Recent collections. Each detail instantiates one recipe on a stationary, vertically scrolling canvas. Pause/Resume and Replay remain outside scrolling content, and recipe notes open separately. Inactive or paused details unmount their preview. Native Liquid Glass styles preview controls on iOS/macOS 26+, with an opaque fallback for Reduce Transparency and older systems. Foundations & controls opens motion replay, atoms, molecules and composed patterns. The production `CieoUI` product now includes ActionButton, ProgressRing, SelectionChip, SearchField, PreferenceRow, ExpandablePanel and TaskPanel alongside the original eight components. Hosts own bindings, asynchronous work and cancellation.

Spring tracks use the shared Snap/Base/Soft presets. The Metal highlight accepts finite progress and remains opt-in in production. The gallery opts in explicitly; system accessibility, scene inactivity and Low Power Mode still disable effects. There are no continuous animation loops. The demo provides a reduced-motion preview in Rendering settings.

## Soft surfaces

Gallery specimens and production atoms have no decorative exterior outlines. Neutral recipe outlines use filled surfaces. Control selection and error outlines use translucent state fills. Focus indicators, progress arcs, charts and illustration geometry retain meaningful drawing strokes. The source inventory and generated index are tested as an exact union, including ten formerly unindexed Chrome recipes. Shared hardware-keyboard adapters use the iOS 17/macOS 14 key-press API.

The complete portable export includes CieoAtoms and its registry tests. Native source inclusion and compilation do not establish visual or performance acceptance for every recipe.

## Host configuration and semantic copy

[ComponentConfiguration](../Sources/CieoUI/Foundations/ComponentConfiguration.swift)
adds `ComponentTypography` (action, selection, field, fieldLabel), immutable
`ComponentMetrics` (compact, standard, corner, touchTarget), and per-control
`ControlAppearance`. Install `componentTypography`, `componentMetrics` and
`componentTheme` through [Theme](../Sources/CieoUI/Foundations/Theme.swift).
Defaults preserve existing callers. Geometry rejects nonfinite overrides,
normalizes negative dimensions and retains a 44-point minimum target.

[ActionButtonStyle](../Sources/CieoUI/Atoms/ActionButtonStyle.swift) accepts
`appearance`; [fieldChrome](../Sources/CieoUI/Molecules/FieldChrome.swift) styles
a host-owned native field without taking focus, submit, validation or text state.
Appearance overrides font, padding, minimum dimensions, radius and semantic
colors, including an optional host border. `borderPlacement` selects centered
or inset drawing; inset remains the default. `pressedOpacity`, `disabledOpacity`
and `pressedScale` accept finite 0...1 values, defaulting to .75/.5/.98. Hosts
can preserve steady existing interactions without disabling native semantics.
Hosts keep field input purpose and
platform keyboard/content configuration.

[ActionButton](../Sources/CieoUI/Atoms/ActionButton.swift) accepts emphasis,
appearance, readyAccessibilityValue and busyAccessibilityValue.
[SelectionChip](../Sources/CieoUI/Atoms/SelectionChip.swift) accepts selected and
unselected accessibility values; [SearchField](../Sources/CieoUI/Molecules/SearchField.swift)
accepts clearAccessibilityLabel. These `LocalizedStringKey` defaults remain
compatible; hosts supply interface copy and resolved strings through the native
localization API. Host actions and asynchronous lifetimes remain outside Cieo.

These additive contracts shipped in PR #9. They are unreleased and are not part of consumer 0.3.0. Unit/build and consumer UI
receipts must identify their actual candidate; source inspection alone does not
establish localization, focus or VoiceOver acceptance.

## Display type, colour blocks and cuts

These foundations carry an editorial look built from flat colour blocks, heavy type and geometric cuts in place of boxes and rules. They hold no brand values: the host installs its palette and fonts once at the root.

- [Theme](../Sources/CieoUI/Foundations/Theme.swift) adds `onAccent`, `tint` (defaults to the accent at 18%), `track` (the unfilled part of bars and connectors), and `block`, `onBlock`, `onBlockSecondary` for a dark panel that holds live state.
- [DisplayTypography](../Sources/CieoUI/Foundations/DisplayTypography.swift) has six roles: `display`, `title`, `headline` and three numeral sizes. Defaults are sized for a phone (30, 22 and 20 points; numerals 64, 44 and 28) with black or heavy weights and tracking written as a fraction of the size, like CSS `em`. Every role scales with Dynamic Type relative to its text style, stops at `maximumSize`, and never shrinks below half its size. Numerals use monospaced digits. Install `displayTypography` with larger values on wide layouts, then use `.displayText(.title)`.
- [CutShape](../Sources/CieoUI/Foundations/CutShape.swift) has nine cuts: `arch`, `invertedArch`, `circle`, `leadingPill`, `square` and `quarter(corner)`. Curves meet the frame's edges, so a cut fills any frame. Corners are named by reading direction, and the shape mirrors in right-to-left layouts.

Atoms built on them:

- [CutSurface](../Sources/CieoUI/Atoms/CutSurface.swift) cuts a photo or colour block into a `CutShape`. With no content it is a decorative block hidden from VoiceOver.
- [BigNumber](../Sources/CieoUI/Atoms/BigNumber.swift) sets a numeral in a numeral role with its label inline or stacked, read as one phrase.
- [ShareBar](../Sources/CieoUI/Atoms/ShareBar.swift) draws shares of a whole as one bar and draws nothing unless every share is a positive number, so a missing figure never shows as a fake split.
- [SegmentedProgress](../Sources/CieoUI/Atoms/SegmentedProgress.swift) draws one segment per step, from 1 to 60, and reads "4 of 10".
- [BlockPanel](../Sources/CieoUI/Atoms/BlockPanel.swift) is a flat block, surface or accent panel for the one thing a section's reader is working in, with an optional circle bleeding 30% past a corner. Its text keeps out of the circle's visible width, so words never sit on the accent.

[AtomTests](../Tests/CieoUITests/AtomTests.swift) pin those rules and draw every atom at 390 points in light and dark. Set `CIEO_RENDER_DIR` to save the drawings for review. macOS does not apply Dynamic Type, so text scaling is checked on the iOS simulator by the consumer.

Molecules built on the atoms:

- [SectionHeader](../Sources/CieoUI/Molecules/SectionHeader.swift): a display title with an optional trailing action, "See all" by default. When the width is too narrow it stacks the action under the title instead of truncating.
- [IndexRow](../Sources/CieoUI/Molecules/IndexRow.swift): a ranked row with a two-digit rank ("01"), a title, a muted note, an optional bar that carries the row's figure, and a chevron. The host wraps it in a Button or NavigationLink.
- [NumberedSteps](../Sources/CieoUI/Molecules/NumberedSteps.swift): a short ordered process led by large numerals, read as "Step 1 of 4".
- [InfoButton](../Sources/CieoUI/Molecules/InfoButton.swift): questions about a screen behind an ⓘ that opens a sheet, as an icon for a toolbar or a row for a list. It hides itself when there are no questions.

[MoleculeTests](../Tests/CieoUITests/MoleculeTests.swift) pin rank numbering, the bar bounds, the empty-sheet rule and the narrow-width header, and they draw every molecule in both schemes.

Organisms built on them:

- [Pathway](../Sources/CieoUI/Organisms/Pathway.swift): steps as round nodes joined by a curved line, dotted for learning paths and dashed for processes. Vertically, nodes step sideways in a repeating pattern (0, 36, 64, 36 points on compact widths; eight wider steps on regular widths and the Mac) joined by S-curves. Horizontally, they sit in a row joined by arches. Lines leaving finished steps take the accent; the current node inverts and carries a still halo, with no pulsing. At accessibility text sizes the vertical path straightens. VoiceOver reads each step as "Step 2 of 6, Committee, current". A host showing a window of a longer path passes `firstNumber` (the number on the first row, default 1) and `total` (the whole path's length, default the row count), so lessons 11 to 20 of 40 read "11" on the first circle and "Step 11 of 40" to VoiceOver. Impossible input is clamped: numbering never starts below 1, and the total is never smaller than the last number shown. The `label` closure still receives the row's position from 0.
- [ContentRail](../Sources/CieoUI/Organisms/ContentRail.swift): a sideways rail that snaps to each item. On the Mac, where there is no swipe, previous and next buttons page it and stop at the ends. It draws nothing when empty.

[OrganismTests](../Tests/CieoUITests/OrganismTests.swift) pin the offset pattern, the walked-line rule, the spoken states and the paging bounds, and they draw both pathway axes. `ImageRenderer` doesn't draw scroll view content, so the rail's cards are checked on the simulator by the consumer.

- [ComponentIcons](../Sources/CieoUI/Foundations/ComponentIcons.swift): the glyphs these pieces draw themselves (disclosure, info, check, previous, next). They default to SF Symbols; an app with its own icon set installs `componentIcons` once at the root.

[FoundationTests](../Tests/CieoUITests/FoundationTests.swift) pin the cuts' geometry, the phone sizes, the scaling bounds and the theme defaults. Rendered checks at large text sizes belong to the consumer.

## Slots, not hard-coded styling

Components choose a role and never a value. A host changes one value at the root and every component that uses that role follows.

| Slot | Where | Roles |
| --- | --- | --- |
| Colour | `componentTheme` | accent, onAccent, tint, surface, foreground, secondary, subtle, border, track, block, onBlock, onBlockSecondary, danger |
| Text | `componentTypography` | title, subtitle, heading, strongHeading, body, strongBody, detail, strongDetail, glyph, prominentGlyph, value, marker, plus the control roles action, selection, field, fieldLabel |
| Spacing and strokes | `componentMetrics` | tight 4, compact 8, medium 12, standard 16, loose 20, section 24; corner; touchTarget (44 floor); bar, thinBar, hairline |
| Glyphs | `componentIcons` | disclosure, info, check, previous, next, search, clear, error, selected, unselected (the host closure runs on the main actor, so a glyph may hold `@ScaledMetric` state) |
| Display type | `displayTypography` | display, title, subtitle and three numeral sizes |

Content goes in through `@ViewBuilder` slots or `Text`, never through styling flags. Molecules and organisms are built from atoms, never from raw `Text` and `Image` with their own fonts:

- `Heading(title, detail:, level:, isHeader:)` is the title-and-detail pair every row, notice, panel and section shares. Inside a row, button or toggle pass `isHeader: false`, so VoiceOver reads a list as rows, not as a run of headings.
- `StatusLabel(text, icon:, tone:)` is a glyph and a line of text in one tone, such as a field error.
- `IconButton(icon, label:, prominent:)` is a glyph-only button with a spoken label and a full touch target.
- `.componentBorder(color, width:, cornerRadius:, placement:)` is the one outline that controls and fields share.
- `FlowStack(spacing:)` fills rows and starts a new one when the next item doesn't fit, so a group of chips stacks at large text sizes instead of breaking words.
- SelectionChip, BlockPanel, CutSurface, ShareBar and ActionButton read every style from the slots. A share bar's seam is the `hairline` width.
- IndexRow, NumberedSteps, InfoButton and SectionHeader read every style from the slots.
- ActionRow, PreferenceRow, Notice, ExpandablePanel, LabeledField and SearchField read every style from the slots. Setting rows and notices label their control, so their headings pass `isHeader: false`.
- ContentSection, StatePanel, TaskPanel, Pathway and ContentRail read every style from the slots.
- ProgressRing, SegmentedProgress, BigNumber, HighlightSurface and SymbolMark read every style from the slots.

`scripts/check-swift-literals.sh` fails on a font, glyph, colour, spacing step, stroke width or opacity written inside a component. Foundations hold the defaults and are exempt. A line that truly needs a literal says why with `// literal-ok: <reason>`. CI runs it in the `swift` job, and also proves it still catches every line in `scripts/fixtures/hard-coded-styling.swift.fixture`.

## Consumer rollout boundary

Principle's current native consumer uses published Cieo 0.3.0 Theme,
renderingPreferences and renderPolicy with host-owned native brand styles.
The additive configuration APIs above remain unreleased draft producer APIs; they
are not a release blocker or dependency of that repaired consumer.

Consumer review closes three bounded waves: input reliability, native search
and filter rendering policy, and web Library forms; state/empty/error and
form controls; navigation and reader details. Consumer references record
implemented bridges, retained platform/domain controls and incompatible
installed API boundaries rather than treating every surface as a replacement. Consumers document
exact adapter/feature/test ownership in their existing adoption references and
source maps. A stock Cieo visual style does not replace platform behavior or
Principle brand geometry. Native focus, submit, selection identity and roles,
and web input/textarea/select/button/link semantics remain explicit contracts.
Each wave records locale/RTL, focus, disabled/busy, accessibility and constrained
rendering observations; producer tests alone do not establish consumer acceptance.

## Documentation ownership

[Maintenance process](documentation-maintenance.md) records same-PR and after-merge checks. [Source map](source-map.json) assigns current API documentation ownership.
