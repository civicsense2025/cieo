# Cieo component architecture and Swift integration

Recommendation: keep one Cieo repository, one manifest owner per component, a reusable native core, and optional domain extensions physically nested inside CieoUI. Preserve every existing recipe ID while recording its actual maturity. This is a researched proposal, not an implemented architecture or native acceptance receipt.

Contents: [Composition and folders](#how-should-components-compose-and-where-should-writing-live) · [Manifest ownership](#what-should-each-manifest-own-and-how-should-consumers-read-it) · [Migration and acceptance](#how-should-cieo-migrate-and-integrate-with-tessera-without-overstating-readiness)

## How should components compose and where should Writing live?

### Takeaway

Separate purpose, behavior, styling, and sample data. Make atoms reusable contracts, molecules meaningful assemblies of atoms, and organisms assemblies of atoms/molecules. Atomic taxonomy describes the public design model; it does not require recreating SwiftUI's private view hierarchy or wrapping a native control solely to satisfy a diagram.

### Cited Findings

- ChimeKit audits existing patterns and reviews states, use cases and flexibility before code publication. [ChimeKit](https://www.designsystems.com/building-chimekit-with-atomic-design-and-a-collaborative-process/)
- Thumbtack layers tokens, styling and components, separating modal usability from visual treatment. [Thumbtack](https://www.designsystems.com/how-thumbtack-structures-their-design-system/)
- The Forge supports finished assemblies or rearranged subcomponents, including structural customization. [The Forge](https://www.designsystems.com/the-forge-harrys-approach-to-multi-brand-design-systems/)
- Zendesk separates interaction from visuals, but consumers still must attach references and properties correctly; headless composition needs integration checks. [React containers](https://www.designsystems.com/react-containers-some-assembly-required/)
- The inspected Swift package already separates `Cieo`, `CieoUI`, and `CieoAtoms`; CieoUI's `ActionButtonStyle` styles a native Button while `LabeledField` uses a native TextField. This is a suitable starting boundary, not proof of full customizability. [Package.swift](../../../Package.swift), [ActionButtonStyle](../../../Sources/CieoUI/Atoms/ActionButtonStyle.swift), [LabeledField](../../../Sources/CieoUI/Molecules/LabeledField.swift)

### Inferences

**Proposed folder contract — new names are conceptual, not files created by this research:**

```text
Cieo/
  Package.swift                         # Existing sole Swift package root
  schemas/
    component.schema.json               # One versioned component contract
    pack.schema.json                    # Pack references; no component duplicates
  Sources/
    Cieo/                               # Existing motion engine
    CieoUI/
      Foundations/                      # Theme, metrics, policy, native adaptation
      Styles/                           # Explicit visual policies and native styles
      Atoms/
        Input/
          Input.swift
          manifest.json
          README.md
      Molecules/
        LabeledField/
          LabeledField.swift
          manifest.json
          README.md
      Organisms/
        StatePanel/
          StatePanel.swift
          manifest.json
          README.md
      Extensions/
        Writing/                        # Optional Swift target at explicit path
          pack.json                     # IDs/references only
          Atoms/<Component>/            # Source + manifest.json + README.md
          Molecules/<Component>/
          Organisms/<Component>/
      Resources/                        # Core resources only
  Examples/
    Writing/                            # Demos, text fixtures, sample host, screenshots
  atoms/swift/                          # Existing recipe API retained during migration
  design/                               # Existing canonical token/theme source
  docs/                                 # Decisions and generated usage navigation
```

The existing directory is lowercase `examples/`: choose and migrate casing deliberately rather than create both spellings on a case-insensitive Mac.

**Dependency direction:** tokens/theme contracts → platform styling/adaptation → core atoms → core molecules → core organisms. Writing depends on public core APIs and lower components in its own pack. Core never imports Writing. Example hosts depend on selected products; production targets never depend on examples or recipe stages. A molecule's manifest lists its actual atomic dependencies; an organism lists actual atoms/molecules. Direct native Text/Label/Button usage is permitted and recorded as a native primitive adaptation, without inventing a redundant reusable wrapper. Utility types and style policies do not become fictitious UI atoms simply because they have files.

**Writing resolution:** reusable author controls belong in `Sources/CieoUI/Extensions/Writing`; manuscripts, mocked compilation, demo toggles, hard-coded characters, and preview staging belong in `Examples/Writing`. Generic inputs, fields, labels, progress, buttons, selection and status components remain core. Domain names are justified for optional domain contracts; generic shared symbols must retain reusable names. A selection toolbar is reusable; simulated manuscript compilation is an example until it accepts real host state/events and owns a documented production contract.

**Swift target trap:** physical nesting does not imply optional compilation. Declare the core target with `path: "Sources/CieoUI"` and `exclude: ["Extensions"]`; declare a separate optional target/product at `Sources/CieoUI/Extensions/Writing` that depends on CieoUI. The excluded directory is relative to the core target. Give each target explicit source/resource membership; exclude README/manifests from compilation unless deliberately bundled. The Swift 5.9 PackageDescription source documents `path`, recursive `sources`, and `exclude` precedence. This proposal uses existing mechanisms rather than a new runtime feature flag. [Swift 5.9 target API](https://raw.githubusercontent.com/swiftlang/swift-package-manager/swift-5.9-RELEASE/Sources/PackageDescription/Target.swift)

**Two meanings of default-off:** an app depending only on CieoUI must not link/import Writing; the workbench must also omit Writing entries unless its pack is enabled. SwiftPM may still resolve package-level dependencies, and broad package test/build commands may include optional targets. Do not promise download isolation or that directory nesting alone keeps a pack out of every build. Graph checks must prove disjoint source membership, no core-to-extension import, and selected product closure before claiming optionality.

**Customization boundary:** provide semantic default styles, typed overrides, documented slots, and composition. Keep visual layout/typography/color/radius/motion policy out of business-state handling; keep validation, focus, accessibility, and cancellation obligations with their accountable primitive/host owners. Expose a lower-level part only when it has a coherent contract. Avoid a universal arbitrary-modifier or dictionary-of-any API that makes each consumer rebuild behavior. The current hard-coded red error in LabeledField and fixed Metrics demonstrate work still required for complete semantic styling; no refactor is performed here.

### Gaps

- Full customization requires component-by-component contracts and state/slot audits; 11 source files do not establish them.
- No Swift package graph, build, interaction, accessibility, resource or native rendering check was run. The Apple foundation document separately requires Xcode 16+ for its back-deployed `@Entry` use despite the 5.9 manifest declaration. The final spec must distinguish manifest API level, compiler/SDK requirement, and deployment target. [Apple foundation contract](../../../docs/apple-components.md)

## What should each manifest own and how should consumers read it?

### Takeaway

A strict `manifest.json` beside each component owns its portable component identity and contract. Generated indexes, Swift discovery metadata, docs tables, and Tessera adapters derive from it. A build-file mirror proves bytes and provenance; a capability manifest describes behavior and evidence. They are different records.

### Cited Findings

- Purpose-led definitions distinguish visual look-alikes through rationale, usage, alternatives and limits; the modal terminology is illustrative. [Collaborative definitions](https://www.designsystems.com/a-collaborative-approach-to-defining-components-and-their-features/)
- Stack mirroring aligns names, composition, properties and dependencies between design and code. [Stack mirroring](https://www.designsystems.com/stack-mirroring-designing-for-code-and-coding-for-design/)
- Semantic tokens separate decisions from implementation; variables, modes and references express context. [Semantic systems](https://www.designsystems.com/the-future-of-design-systems-is-semantic/)
- White-labeling combines defaults and constrained configuration; its CSS escape hatch acknowledges injection risk. [White-labeling](https://www.designsystems.com/white-labeling-putting-the-design-system-in-users-hands/)
- Tessera's current contract makes `library-manifest.js` its discovery owner, validates renderer kinds, and separates discover/preview/edit/export/generate. It explicitly says inventory is roadmap until implementation and optional domain organisms are extensions. Cieo metadata must enter through this adapter boundary, not create a second handwritten Tessera catalog. [Prototype contract](/Users/tanho/GitHub_non_cloud/tessera/docs/specs/2026-10-07-prototype-contract.md), [Catalog owner](/Users/tanho/GitHub_non_cloud/tessera/site/dist/library-manifest.js)

### Inferences

**Proposed fields and ownership:**

| Group | Required contract |
| --- | --- |
| Identity | `schemaVersion`, immutable `id`, `componentVersion`, `name`, `layer`, `packId`, `status`, source references, compatibility aliases |
| Composition | `parts` with stable part IDs, `slots` with cardinality/allowed content, dependency IDs/version compatibility, native primitive adaptations |
| Inputs and behavior | typed `properties`, defaults, required/nullability rules, bounds/enums; states, transitions, host-owned vs internal ownership; typed events and event payloads |
| Visual contract | variants, semantic token references, style hooks/override points, layout/text/motion constraints, supported contexts and override precedence |
| Platform and proof | platform/renderer entries, implementation status, supported properties/states/parts/events, capability actions, verification status and evidence references |

Each component's documentation must include these exact sections: `purpose`, `useWhen`, `avoidWhen`, `anatomy`, `behavior`, `keyboard/accessibility`, `customization`, `limitations`, `related alternatives`, `evidence`. Put concise identity/purpose and documentation path in the manifest; the colocated README owns long explanations. Do not manually copy paragraphs into several catalogs. Document slot safety, focus ownership, state-control rules, validation/recovery, reading order and minimum supported contexts under those sections.

**JSON rules:** one checked-in schema version with explicit required fields and unknown-field policy; one ID registry generated from manifests; finite numbers; bounded IDs/strings/collections; bounded nesting; no dangling dependency/part/slot/token references, cycles, duplicate IDs, executable strings or absolute private paths. Properties must agree with state/event types. Validate at import before use, return structured diagnostics with source location, and preserve original document/draft bytes on failure. Pack metadata references component IDs; it does not redefine components. Schema version, component contract version, package release version and document version are independent. An incompatible contract change needs migration or a new major component version, not silent reinterpretation of an ID. A future schema produces an unsupported-version result with recovery, not ignored fields.

**No duplicated authority:** existing `MotionAtomInfo` and generated indexes become compatibility projections of recipe manifests; they cannot remain independent handwritten identity sources. The existing `design/` token/theme system retains token-value ownership. Component manifests reference tokens; they do not copy palettes. Tessera maintains its validated adapter/catalog owner but consumes Cieo exports rather than copying mutable Cieo definitions. Swift public initializers remain implementation contracts checked against the manifest; generated metadata does not magically create or validate native behavior.

**Capabilities need two axes:** record `implemented` separately from `verified`, per platform/renderer/action/property/state. `not-run` is distinct from failed and unsupported. A recipe may have a Swift preview implementation while edit/export/generate remain unsupported or unverified. A declared iOS/macOS deployment target does not prove either platform rendered the component. Attach receipt version, source revision, runtime/SDK, OS/device, window/viewport, fixture, theme/text size/locale/motion settings and result. Generated export may be structurally valid while native runtime acceptance remains not run.

**Missing packs and documents:** default selection contains core only. Disabled packs are hidden from new insertion but existing references survive unchanged with a clear unavailable-pack placeholder. Permit read/inspect/export-original/re-enable recovery; do not replace missing organisms with unrelated core nodes, drop unknown properties, auto-enable/download code, or silently claim render/export/generate support. Validate known fields without destructively normalizing unknown future content. Duplicate pack or component IDs produce diagnostics while valid core stays available, matching Tessera's present core-first collision behavior. Registry availability, enabled status and executable capability remain separate.

### Gaps

- Exact JSON field names and schema choice above are recommendations for the architectural spec, not an existing standard or deployed contract.
- The full cross-language converter and manifest generation do not exist merely because current exports include token/portable theme JSON. Renderer-specific coverage needs an inventory before capabilities can be filled truthfully.

## How should Cieo migrate and integrate with Tessera without overstating readiness?

### Takeaway

Preserve existing IDs and entry points, promote real reusable contracts incrementally, and keep recipes honestly labeled until promotion. Cieo library work can precede Tessera native UI; Tessera's own prototype and sandbox gates remain prerequisites for its native implementation.

### Cited Findings

- Lyft aligns naming and feasibility, permits native sheet differences, and withholds readiness until platform work is complete. [Parity](https://www.designsystems.com/a-system-built-on-parity-how-to-treat-all-of-your-users-equally/)
- Spotify shares foundations while preserving researched platform differences and limiting concurrent component work. [Spotify](https://www.designsystems.com/how-spotifys-design-system-goes-beyond-platforms/)
- The complexity article balances subcomponents and local systems against excessive rigidity. [Complicated systems](https://www.designsystems.com/the-future-of-design-systems-is-complicated/)
- The automation article describes repetitive-work tooling while noting input quality and generated-code correction requirements. [Automated systems](https://www.designsystems.com/the-future-of-design-systems-is-automated/)
- At inspected revision `9d2574f32498207db6d1141ec62ee130c1bbf68a`, source counting found 540 public `MotionAtomView` declarations across 567 Swift files, including 45 declarations across 42 Writing files. `MotionAtomView` requires `init()` and returns catalog previews via AnyView. `CompileRunAtom` owns simulated timer progress and manuscript copy, demonstrating a recipe rather than a real compiler service. [Catalog.swift](../../../atoms/swift/Catalog.swift), [CompileRunAtom](../../../atoms/swift/Writing/CompileRunAtom.swift)

### Inferences

**Migration sequence:**

1. Freeze and reconcile the existing recipe ID set across web/Swift/catalogs. Assign every ID a manifest, taxonomy, maturity and source mapping. Keep every legacy ID addressable; duplicate declarations/aliases need explicit diagnostics. Full coverage means no silent drop, not calling every recipe production-ready.
2. Promote shared behavior first: host-bound input/action/value APIs, semantic styling and documented parts. Recipes adapt those controls with sample content. Keep old Swift types, `init()`, `MotionAtomInfo`, CieoAtoms product and web `./atoms/*` imports through compatibility wrappers or retained recipe implementations until a reviewed deprecation window.
3. Extract Writing reusable assemblies only where a real host contract exists. Keep `CompileRunAtom` and similar simulated operations in examples/recipe status. Do not expose fake provider success, persistence, networking or file access as production capability.
4. Generate catalog/docs/export projections deterministically, preserving stable IDs and explicit aliases. A promotion can point a recipe to a reusable component while retaining its original recipe identity; they are not automatically the same artifact.
5. Integrate through Tessera's pinned Cieo adapter after its contract is accepted. The inspected Tessera submodule pins `68b50267b59d433fbc5080f3cf59b65ec9c46f0e`; it does not already consume this branch's production additions. No submodule edit is included in this research.

**Portable export:** the existing exporter copies all files recursively under `Sources/CieoUI`, so adding optional Writing there would export it unintentionally unless the export selection changes. Its generated Package.swift separately needs the same core exclusion and optional product declarations. Replace directory-wide inclusion with a deterministic selected-product closure, including only required source/resources/contracts and selected tests. Derive export package membership from an authoritative package/selection specification; avoid divergent handwritten target graphs. Require a committed input revision, canonical ordering/encoding, exact content hashes, destination containment and reviewed update sets; preserve consumer-edited mirror files. [Current exporter](../../../scripts/export-apple.py)

Keep `mirror.json` as provenance: source revision, selected products/packs, input schema/tool version, package identity, relative file paths and hashes. Keep generated component manifests as capability contracts: supported behavior and evidence. A matching hash proves faithful copying, not compilation, accessibility, performance or platform parity. Preserve existing dirty-input, symlink, edited-mirror and file-set safeguards while enabling reviewed additions/removals.

**Acceptance gates for later implementation:**

| Gate | Evidence required before claiming completion |
| --- | --- |
| Inventory/contract | Every legacy ID reconciled; strict schema validation; dependency and token/part references valid; no fabricated production statuses |
| Architecture/compatibility | Disjoint Swift target source/resource graphs; core-only consumer excludes Writing; default-off registry; all public changed-symbol consumers reread; existing Swift/web import compatibility fixtures |
| Export | Selected-product closure and exact-byte mirror checks; deterministic repeat generation; dirty-input, drift, missing/disabled pack, unknown-version and edited-destination recovery fixtures |
| Library quality | Project-required full gates after refactor, native control interaction, state rejection/isolation, dynamic text, locale/RTL, keyboard/VoiceOver, dark/contrast and reduced-motion observations on named supported runtimes |
| Tessera native | Accepted prototype reference plus separate signed sandbox host/helper spike; Rust-owned validation and parity fixtures; fresh native receipts before any native parity claim |

These are proposed acceptance requirements; none was executed in this research pass. Tessera's native parity contract explicitly delays Swift UI until prototype acceptance and requires a signed sandbox folder-capability spike before implementation planning. Standalone Cieo controls do not require that workbench-specific filesystem mechanism, so library design and bounded implementation may proceed separately. [Tessera native contract](/Users/tanho/GitHub_non_cloud/tessera/docs/native/PARITY.md)

### Gaps

- Local source inspection establishes declarations and intent only. No implementation, tests, builds, launches, installations, publishing or Tessera mutation occurred.
- Articles provide practitioner mechanisms and case narratives, not controlled evidence that this Cieo architecture improves user outcomes, adoption, retention, revenue or engineering time. Treat those as hypotheses for later observation.
- Source text was read from the coordinator's cached extraction; linked illustrations, videos, external talks and historical dependencies were not audited. Each assigned source's exact URL and content hash are recorded in `component-sources.json`.
