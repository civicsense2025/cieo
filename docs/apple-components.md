# Apple component foundation

Cieo owns the reusable Swift source. `CieoUI` depends only on the existing Cieo motion engine; the complete 550-recipe native catalogue remains in the separate `CieoAtoms` product. `CieoGallery` exposes both that catalogue and the reusable controls without changing authentication.

The [catalogue migration receipt](catalogue-inventory.md) records current recipe identities and source hashes; it does not establish production component readiness.

## Contents

- [Implementation contract](#implementation-contract)
- [Rendering and acceptance](#rendering-and-acceptance)
- [Interactive gallery](#interactive-gallery)
- [Soft surfaces](#soft-surfaces)
- [Host configuration and semantic copy](#host-configuration-and-semantic-copy)
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
