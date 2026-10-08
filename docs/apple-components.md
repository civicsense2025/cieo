# Apple component foundation

Cieo owns the reusable Swift source. `CieoUI` depends only on the existing Cieo motion engine; reference recipes remain in the separate `CieoAtoms` product. The initial scope is a small production foundation, not a new navigation or authentication implementation.

## Implementation contract

1. Foundations own semantic palette, spacing and the rendering policy.
2. Atoms style native controls and provide a decorative, optional Metal surface.
3. Molecules combine labels, controls and truthful status messages.
4. Organisms compose state panels and content sections, leaving data and actions with the host.
5. A portable runtime snapshot mirrors the exact core/UI sources into the Apple starter, with revision and content hashes checked before builds.

Keep iOS 17/macOS 14 support, system text scaling, native keyboard/focus behavior and stable identities. Building CieoUI requires Xcode 16 or later for the back-deployed `@Entry` macro; verification uses Xcode 27. Reduce Motion disables movement. Background, Low Power Mode, increased contrast and reduced transparency constrain optional graphics. No display links, perpetual animation, full-screen blur, forced rasterization or auth changes belong in this layer.

## Rendering and acceptance

Use SwiftUI transforms and narrow Cieo springs for interaction. An opt-in, bounded Metal color effect highlights decorative geometry only; it never processes text, controls or identity content. Its static fallback carries the same meaning. Apple documents [shader effects](https://developer.apple.com/documentation/swiftui/shader), [bundle lookup](https://developer.apple.com/documentation/swiftui/shaderlibrary/bundle(_:)) and [offscreen drawing costs](https://developer.apple.com/documentation/swiftui/view/drawinggroup(opaque:colormode:)). Native rendering is not a frame-rate guarantee.

Acceptance requires the Cieo full package and web gates, policy regression tests, exact mirror verification, the starter's existing auth gate, and an unsigned simulator build including Metal resources. Rendered compact/large-text/dark-mode and Reduce Motion observations are separate from compilation. Physical-device GPU, energy and hitch measurements remain separate evidence; do not invent them from simulator or source checks.
