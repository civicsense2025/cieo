# Apple component foundation

Cieo owns the reusable Swift source. `CieoUI` depends only on the existing Cieo motion engine; the complete 550-recipe native catalogue remains in the separate `CieoAtoms` product. `CieoGallery` exposes both that catalogue and the reusable controls without changing authentication.

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

The optional `CieoGallery` product contains local fixtures and no authentication dependency. Its opening screen searches all 550 recipes and filters by category. Each detail instantiates one recipe, offers replay and compact/wide previews, and unmounts while inactive. Foundations & controls opens motion replay, atoms, molecules and composed patterns. The production `CieoUI` product now includes ActionButton, ProgressRing, SelectionChip, SearchField, PreferenceRow, ExpandablePanel and TaskPanel alongside the original eight components. Hosts own bindings, asynchronous work and cancellation.

Spring tracks use the shared Snap/Base/Soft presets. The Metal highlight accepts finite progress and remains opt-in in production. The gallery opts in explicitly; system accessibility, scene inactivity and Low Power Mode still disable effects. There are no continuous animation loops. The demo provides a reduced-motion preview in Rendering settings.

## Soft surfaces

Gallery specimens and production atoms have no decorative exterior outlines. Neutral recipe outlines use filled surfaces. Control selection and error outlines use translucent state fills. Focus indicators, progress arcs, charts and illustration geometry retain meaningful drawing strokes. The source inventory and generated index are tested as an exact union, including ten formerly unindexed Chrome recipes. Shared hardware-keyboard adapters use the iOS 17/macOS 14 key-press API.

The complete portable export includes CieoAtoms and its registry tests. Native source inclusion and compilation do not establish visual or performance acceptance for every recipe.
