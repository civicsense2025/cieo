# Build Cieo around explicit component contracts

**Status: architectural proposal for written review; implementation has not begun.** The user approved the overall atomic direction and corrected Writing’s home. This specification makes that direction concrete: one Cieo repository/package, independently useful native controls, separated styling, complete catalogue accounting, optional domain packs and a generated Tessera adapter. Research reviewed 38 reachable editorial/event pages and seven indexes; audiovisual and interactive coverage remains incomplete. No build, native acceptance or measured usefulness is implied.

[Intent and ownership](#intent-and-authority) · [Source structure](#source-and-package-boundaries) · [Composition](#composition-state-and-customization) · [Manifest](#versioned-manifest-contract) · [Optional packs](#optional-packs-and-unavailable-content) · [Compatibility and export](#catalogue-compatibility-and-portable-export) · [Identity and usefulness](#visual-identity-and-usefulness-contract) · [Acceptance](#migration-acceptance-and-review-boundary)

## Intent and authority

Cieo serves people building interfaces who need to select, understand, compose and customize components without reconstructing their behavior. Tessera consumes Cieo; it is not the reusable library’s source owner. The design preserves `Cieo`, `CieoUI`, `CieoAtoms`, existing recipe IDs and compatibility entry points. No wholesale move of the Writing category is authorized by its name alone.

| Concern | Sole authority | Derived representations |
| --- | --- | --- |
| Motion runtime | `Sources/Cieo` | Platform adapters and examples |
| Token values/themes | Existing `design/` source | Generated Swift/web tokens |
| Component identity and portable contract | Colocated `manifest.json` | Registry, docs navigation, compatibility metadata, Tessera input |
| Executable native API/behavior | Swift implementation checked against contract | API documentation and conformance fixtures |
| Package membership | `Package.swift` target graph | Validated exporter selection graph |
| Consumer discovery/action gating | Tessera’s validated `library-manifest.js` adapter | Workbench UI |

The manifest does not generate correct native behavior by declaration. Native API agreement is checked separately. Long-form guidance has one colocated README owner; manifests link it rather than duplicate prose. `pack.json` lists component references and never repeats their definitions. This arrangement applies practitioner lessons about meaningful composition and naming alignment, without treating the articles as a formal interchange standard. ([Stack mirroring](https://www.designsystems.com/stack-mirroring-designing-for-code-and-coding-for-design/))

## Source and package boundaries

Recommended tree; names below describe proposed files, not implemented moves:

```text
Cieo/
  Package.swift
  schemas/
    component.schema.json
    pack.schema.json
  design/                              # Existing token/theme authority
  Sources/
    Cieo/                              # Existing motion engine
    CieoUI/
      Foundations/                     # Theme contracts, metrics, rendering policy
      Styles/                          # Native styles and visual policies
      Atoms/Input/{Input.swift,manifest.json,README.md}
      Molecules/LabeledField/{LabeledField.swift,manifest.json,README.md}
      Organisms/StatePanel/{StatePanel.swift,manifest.json,README.md}
      Resources/                       # Core resources only
      Extensions/
        Writing/                       # Explicit optional target path
          pack.json
          Atoms/<Component>/
          Molecules/<Component>/
          Organisms/<Component>/
          Resources/                   # Writing-owned resources only
  Examples/
    Writing/                           # Sample text, stories and demonstration hosts
  atoms/swift/                         # Existing recipe compatibility surface
  docs/
```

Keep each UI component’s source, manifest and documentation findable together. Foundations/styles/resources are not fictitious UI atoms. Existing lowercase `examples/` must migrate deliberately to `Examples/` with tracked case changes; do not create parallel directories on a case-insensitive filesystem.

`CieoUI` explicitly uses `path: "Sources/CieoUI"` and `exclude: ["Extensions"]`. A separate `CieoWriting` target/product uses `path: "Sources/CieoUI/Extensions/Writing"`, depending on public `CieoUI` APIs. Source and resource membership must be disjoint; exclude manifests/READMEs from compilation unless deliberately packaged as metadata. Core never imports Writing. The generated portable package must retain equivalent exclusions and selected target declarations. Swift’s recursive source behavior makes this exclusion essential. ([Swift 5.9 target API](https://raw.githubusercontent.com/swiftlang/swift-package-manager/swift-5.9-RELEASE/Sources/PackageDescription/Target.swift))

Default-off means a core-only product dependency does not import/link Writing and the workbench does not offer its components for insertion. It does not promise package-download isolation or exclusion from every broad package build/test command. Keep iOS 17/macOS 14 deployment support. The tools manifest remains 5.9 API syntax; the existing back-deployed `@Entry` usage requires Xcode 16+, a separate compiler/SDK constraint. [Current Apple foundation](../../apple-components.md) records those boundaries; platform tests must name their actual toolchain.

## Composition, state and customization

Dependencies flow from tokens/theme contracts through platform styling to core atoms, molecules and organisms. Writing can depend on core and lower components in its own pack. Components must not depend on examples or preview-stage scaffolding. Manifests list actual composition edges, including direct native primitive adaptations; the graph must remain acyclic.

An atom owns one coherent interaction or presentation responsibility. A molecule coordinates a small set of responsibilities, such as a label, native field and validation message. An organism composes a meaningful task region. Atomic classification describes the public composition model; it does not require wrapping every native Text, Button or Label. Prefer a native ButtonStyle when styling is the only missing responsibility. Thumbtack’s separation of styling and component behavior supports this boundary. ([Thumbtack](https://www.designsystems.com/how-thumbtack-structures-their-design-system/))

Four owners remain explicit:

- **Behavior:** focus, activation, selection semantics, cancellation and event emission belong to the responsible component/native primitive.
- **Content:** the host supplies real labels, values, section IDs and messages. Examples supply sample content.
- **Styles:** typed styles own layout, typography, color, radius and motion policy through named parts and semantic tokens.
- **Effects:** the host owns persistence, network requests, file access, parsing, authorization, real validation and durable operation identity.

Public values and selected IDs use controlled bindings or typed value/change events. Components request a change; they do not report committed success before host acceptance. Transient hover/press/focus or disclosure animation can remain internal where documented. A rejected host update must render the authoritative value without losing focus or announcing false success. Rapid repeated input must not multiply effects. Remote retry safety belongs to the host operation contract.

No universal `Any` dictionary or arbitrary executable modifier string is a customization interface. Override precedence is: system semantic defaults → host theme → component typed style → explicitly supported per-instance override. Rendering/accessibility policy can constrain decorative effects at every level. A color override cannot remove a label, alter event meaning or bypass reduced motion. Expose a lower-level part only when its responsibilities and safe composition rules are documented. Style replacement cannot silently replace the native focus/keyboard contract.

## Versioned manifest contract

Adopt JSON Schema Draft 2020-12 with a checked-in schema, `additionalProperties: false` on known records and explicit namespaced metadata only under `extensions`. Proposed `schemaVersion` is `1.0.0`; this is a Cieo contract, not an external standard. All records below are required, with empty arrays for genuinely inapplicable collections. The illustrative Input record is a proposed shape; it does not assert a currently implemented component or token.

```json
{
  "$schema": "../../../../schemas/component.schema.json",
  "schemaVersion": "1.0.0",
  "id": "core.input",
  "componentVersion": "1.0.0",
  "name": "Input",
  "layer": "atom",
  "artifactKind": "component",
  "packId": "core",
  "status": "proposed",
  "owner": "library-maintainer",
  "aliases": [],
  "source": {"target": "CieoUI", "path": "Input.swift", "symbol": "Input"},
  "dependencies": [],
  "nativePrimitives": [{"platform": "apple", "symbol": "SwiftUI.TextField"}],
  "properties": [
    {"id": "label", "type": {"kind": "string"}, "required": true,
     "nullable": false, "constraints": {"minLength": 1, "maxLength": 512}},
    {"id": "isDisabled", "type": {"kind": "boolean"}, "required": false,
     "nullable": false, "default": false, "constraints": {}}
  ],
  "slots": [],
  "state": [{"id": "value", "type": {"kind": "string"},
    "ownership": "host", "initialDefault": "", "changeEvent": "valueChanged"}],
  "transitions": [],
  "events": [{"id": "valueChanged", "payload": {"kind": "record", "fields": [
    {"id": "value", "type": {"kind": "string"}, "required": true, "nullable": false}
  ]}, "effectOwner": "host"}],
  "variants": [],
  "styleParts": [{"id": "control", "overrides": ["foreground", "background", "border"],
    "tokenRoles": ["text-primary", "surface-control", "border-control"]}],
  "constraints": {"layout": ["expand-for-text"], "content": ["persistent-visible-label"],
    "motion": ["honor-render-policy"]},
  "platforms": [{"id": "apple.swiftui", "minimumOS": {"iOS": "17", "macOS": "14"},
    "implementation": "not-implemented", "properties": ["label", "isDisabled"],
    "states": ["value"], "events": ["valueChanged"], "parts": ["control"],
    "actions": {"discover": "planned", "preview": "planned", "edit": "planned",
      "export": "planned", "generate": "planned"}}],
  "readiness": {"api": "proposed", "documentation": "draft", "release": "unreleased"},
  "evidence": [],
  "documentation": {"path": "README.md", "purpose": "Collect a short value with a visible label."},
  "extensions": {}
}
```

`layer` is `atom|molecule|organism`; `artifactKind` is `component|recipe|example|adapter`. Compatibility aliases retain exact old identifiers and resolve to one canonical record. They cannot shadow another current ID. `status` is `proposed|experimental|stable|deprecated`; it does not substitute for evidence.

Types are a closed recursive union: `boolean`, `string`, `integer`, `number`, `enum`, `array`, `record`, and `reference`. Enum values are typed literals; references name component, token, asset or host entity kinds. Nullability is explicit. Required properties have no implicit default; optional properties declare one. Defaults must satisfy their own type/constraints. String, number and collection constraints include lengths, bounds, item counts and uniqueness when relevant. Slots declare stable ID, allowed component/content kinds, minimum/maximum cardinality and reading-order behavior. Dependencies specify immutable component ID and compatible contract range; native adaptations are listed separately rather than fabricating atom dependencies.

State records declare host/internal ownership, type, initial semantics and change event. Transition records declare trigger, from/to state and guard references to documented typed conditions; guards are identifiers, never code. Event payloads are typed records; emission is a request or observation, not a promise of a remote outcome. Variants reference supported property values and style parts. Style parts allow only enumerated override keys and registered token roles. Token values remain in `design/`.

Platform entries list implemented property/state/event/part subsets explicitly. Each action uses `unsupported|planned|implemented`; verification is recorded independently. Evidence records contain `id`, action/scope, result (`passed|failed|not-run|blocked`), source revision, component version, receipt path/hash, toolchain/runtime, OS/device, viewport/window, fixture, locale/direction, theme, text size, motion setting and date. Missing evidence yields not-run, never inferred success. A build receipt cannot satisfy VoiceOver or device energy acceptance.

Validation rejects duplicate IDs, dangling references, cycles, invalid defaults, unsafe paths, nonfinite numbers, executable strings and incompatible schema versions with structured code/path/message diagnostics. Local import limits are project defaults: 1 MiB per manifest, 4,096 records per collection, 4,096 characters per ordinary string, 32 nesting levels and 64 MiB per registry import. Component content constraints can be tighter; these limits do not truncate host documents. Paths are repository-relative and contained; no secrets or machine-specific private paths enter manifests.

Schema version, component contract version, package release and host document version are independent. Backward-compatible additions increment minor versions; incompatible interpretation requires a major version and explicit migration. Migrations are deterministic, reviewable, retain original bytes and produce diagnostics. A future schema returns unsupported-version recovery; it is not normalized by dropping unfamiliar fields. The generated registry owns uniqueness enforcement; no second handwritten ID list survives migration.

## Optional packs and unavailable content

`pack.json` records schema version, immutable pack ID/version, product/target, component IDs, dependencies and documentation path. Enabling a pack changes available catalogue entries; it cannot grant file/network permissions or execute downloads. Build inclusion, registry availability, user enablement and renderer capability are distinct states.

When a saved document references a missing/disabled pack, preserve its original node ID, typed data, unknown fields and serialized bytes. Show an unavailable-pack placeholder with read/inspect, original export and re-enable recovery. New insertion stays disabled. Preview/edit/generate are unavailable unless independently supported; original export means retaining original data, not generating equivalent Swift. Never substitute an unrelated core node or silently enable code. Collisions produce diagnostics while valid core remains usable.

## Catalogue compatibility and portable export

The inspected `9d2574f` baseline contains 540 public `MotionAtomView` recipe declarations, including 45 Writing declarations, and 11 production CieoUI Swift files. These counts have different denominators. Inventory must reconcile IDs across Swift, web and catalogue metadata, including aliases and duplicates. Every existing ID receives a manifest mapping and classification: reusable component, compatibility adapter, demo recipe, example-only artifact or deprecated alias with replacement guidance. No ID disappears because its body is unsuitable for production. [Repository findings](../../research_notes/Cieo%20identity%20and%20component%20system/component-architecture.md)

Preserve `MotionAtomView.init()`, `MotionAtomInfo`, CieoAtoms and web `./atoms/*` imports through retained recipe implementations or compatibility adapters during migration. Generated recipe metadata replaces handwritten duplicate identity data. A recipe can demonstrate a new component while keeping a distinct identity. Breaking behavior refactors receive their own tests/commit in later implementation; direct consumers must be reread in addition to typechecking.

Replace recursive CieoUI copying with selected-product dependency closure before nesting optional packs. The exporter validates its derived selection against `Package.swift`; it includes only required source, resources, manifests and explicitly selected tests. Default selection is core only. A selected Writing product includes its core dependencies without exporting unrelated packs. Preserve committed-input, symlink, destination-containment, edited-mirror and reviewed-file-set safeguards.

`mirror.json` records committed source revision, package identity, selected products/packs, exporter/schema versions and ordered relative paths with exact content hashes. Canonical ordering/encoding makes repeated exports deterministic. A provenance match establishes copied-byte identity. Component manifests establish declared capabilities; receipts establish observed behavior. None can replace the others.

Tessera’s existing catalogue adapter remains its discovery/action owner. It consumes validated Cieo projections at an explicit pin, without duplicating mutable definitions. The inspected pin is `68b5026`, not this branch’s `9d2574f`. Discover, preview, edit, export and generate must each gate independently. Rust-owned validation and parity fixtures remain the workbench boundary. [Prototype contract](/Users/tanho/GitHub_non_cloud/tessera/docs/specs/2026-10-07-prototype-contract.md)

## Visual identity and usefulness contract

Cieo’s proposed signature is precise, approachable interaction: compact task hierarchy, visible anatomy, neutral surfaces, intentional iris emphasis and movement that explains state. Existing web graphite/white/iris values are a starting reference; native host-semantic colors require an explicit mapping. Exact palette pairs and optical dimensions remain unapproved until rendered comparison. Guidance supports semantic roles rather than one universal brand prescription. ([Semantic systems](https://www.designsystems.com/the-future-of-design-systems-is-semantic/))

Typography roles define family, weight, size, line metrics, measure and overflow together. Use native system text scaling; web system type is the dependable baseline, with Inter retained only when deliberately loaded/tested. Prototype reading text around 16px/1.5 and 60–70 Latin characters; these are contextual defaults, not accessibility minimums. Use 8-unit section rhythm and 4-unit close relationships, allowing optical exceptions. Compact layout removes excess chrome before shrinking labels. Native 44-unit touch targets remain a project choice. Text, errors and localized content must expand geometry.

Use borders for boundaries, whitespace for groups and elevation for real overlays. Avoid assigning every organism a rounded card. Iris marks intentional focus/selection where actual pairs pass; status uses independent semantic roles plus text/symbols. Preserve native focus, menus, sheets and system icon adaptation; common intent does not require identical pixels. ([Spotify platforms](https://www.designsystems.com/how-spotifys-design-system-goes-beyond-platforms/))

Motion updates semantic state immediately. Document trigger, target, animated properties, spring, interruption/reversal, focus, reduced-motion result and resting policy. `snap` acknowledges, `base` preserves orientation, `soft` follows continuous change, `lazy` remains optional decoration. Retain rendering-policy restrictions for inactivity, reduced motion, low power, contrast and transparency. No perpetual attention competition or shader processing of text/controls. Exact runtime performance remains unverified. ([Motion guide](https://www.designsystems.com/5-steps-for-including-motion-design-in-your-system/))

Every component README has: purpose, useWhen, avoidWhen, anatomy, behavior, keyboard/accessibility, customization, limitations, related alternatives and evidence. Begin with the task, one realistic example and host obligations. Input collects a value with a persistent label; a generic selection toolbar keeps actions beside selected content; an optional author outline navigates host-provided sections. Do not imply parsing, saving or clipboard success unless the relevant host contract supplies it. Content rules cover labels, errors, empty states, recovery and localization with sentence-case concrete verbs. ([Content strategy](https://www.designsystems.com/guide-to-content-strategy-in-design-systems/))

## Migration, acceptance and review boundary

| Phase | Required exit evidence |
| --- | --- |
| Inventory | Every baseline ID accounted for; no collisions, silent drops or fabricated production labels |
| Contracts/core | Schema and dependency validation; state/host-rejection tests; semantic style seams; compatibility consumer checks |
| Optional compositions | Disjoint target/resources; core-only build/import closure; default-off registry; missing-pack preservation fixtures |
| Portable export | Repeatable selected closure/hashes; dirty-input/drift/edited-destination recovery; equivalent generated package graph |
| Tessera adaptation | Validated pin/adapter; action-specific parity fixtures; separate native prerequisites and receipts |

After a behavior refactor, run the required full lint/typecheck/test gates, test uncovered behavior first, reread every direct downstream consumer and visually inspect affected UI. Native acceptance separately requires named platform runs for keyboard/focus, VoiceOver, large text, localization/RTL, dark/contrast, reduced motion, state recovery and interruption. Follow process enumeration/normal quit rules before native work. Stop agent-owned temporary processes afterward. Existing Apple starter authentication and Metal-resource build checks remain required where that export changes. Device GPU/energy/hitches require device evidence.

Tessera native implementation still requires its accepted prototype and signed sandbox host/helper spike before its implementation planning. Standalone Cieo work has no dependency on that workbench filesystem mechanism. [Native parity gate](/Users/tanho/GitHub_non_cloud/tessera/docs/native/PARITY.md)

The [coverage ledger](../../research_notes/Cieo%20identity%20and%20component%20system/coverage.json) and [report](../../reports/Cieo%20identity%20and%20component%20system.md) distinguish completed text review from open media. There are 23 unique Schema recordings, seven standalone videos and one Vimeo recording: zero transcripts retrieved and zero videos watched. Five interactive embeds and typography behavior remain untested; 47 kits are directory inventory only. Selected figures are named in visual notes. The assigned media sessions had no available browser; the [media-observations ledger](../../research_notes/Cieo%20identity%20and%20component%20system/media-observations.json) records exact statuses. The coordinator’s browser loaded [Architecting Subcomponents](https://www.youtube.com/watch?v=NiDoqI_ZhvY) and the [London Opening Keynote](https://www.youtube.com/watch?v=cvFRJZmMGtc); official transcript export reported no transcript available for both representatives, including a London retry after title verification. Neither route added transcript or playback evidence. No rendered Cieo acceptance, accessibility conformance, performance measurement, package graph proof or real consumer outcome was executed here.

**Next action: review this written specification.** The [brainstorming skill](/Users/tanho/.codex/skills/brainstorming/SKILL.md) states “Conversational design approval only permits writing the spec”. Written-spec approval permits the separate implementation-plan stage; this document does not authorize implementation or release.
