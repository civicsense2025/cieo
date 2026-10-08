# Give Cieo a useful, recognizable identity

**Cieo should become one customizable Swift library with a dependable atomic core, optional domain compositions, and examples that explain real tasks.** Reusable Writing components belong inside `Sources/CieoUI/Extensions/Writing`; sample stories belong in `Examples/Writing`.

**Coverage:** all 38 readable editorial/event pages found through internal links, plus seven indexes, were reviewed. Six supplemental domain searches found no additional editorial pages. **The request to review all content remains incomplete:** recordings and interactive examples were not reviewed, and external kit internals were not audited.

**Status:** the architecture and visual direction below are proposals. No product code, native build, rendered acceptance, or Tessera integration changed in this research pass.

[Writing’s home](#writing-belongs-in-an-optional-domain-layer) · [Research implications](#research-changes-the-system-beyond-its-folders) · [Cieo’s identity](#cieos-identity-comes-from-how-it-works) · [Useful explanations](#explain-the-task-before-the-component-taxonomy) · [Integration sequence](#integrate-through-preserved-contracts-and-separate-gates) · [Evidence and next action](#evidence-keeps-the-open-work-visible)

## Writing belongs in an optional domain layer

The corrected organization preserves one Cieo repository and package. It separates reusable authoring behavior from demonstrations without narrowing the generic core.

| Content | Proposed home | Contract |
| --- | --- | --- |
| Inputs, buttons, labels, selection and status controls | `Sources/CieoUI/Atoms`, `Molecules`, `Organisms` | General-purpose APIs with host-owned state and actions |
| Reusable author outline and author-specific compositions | `Sources/CieoUI/Extensions/Writing` | Separate optional Swift product depending on core |
| Manuscripts, fake compilation, sample hosts and stories | `Examples/Writing` | Clearly labeled demonstrations |
| Existing public recipe types | Existing `CieoAtoms` compatibility surface | Retain IDs and entry points while classifying readiness |

A generic selection toolbar stays core even if first demonstrated in a writer. The current Writing category must be reviewed by purpose rather than moved wholesale. A simulated compiler remains a recipe until a real host supplies its state and operation contract. Airbnb’s account supports promoting team patterns after their wider usefulness is tested; it does not require every specialized pattern to enter the core. ([Maintenance](https://www.designsystems.com/5-tips-from-an-airbnb-designer-on-maintaining-a-design-system/))

**A nested folder alone is not optional.** The proposal explicitly excludes `Extensions` from the core Swift target and declares Writing as its own target at that path. Core-only consumers neither import nor link it; catalogue insertion also defaults to core only. Broad package builds can still include optional targets, and package-level dependency resolution is a separate concern. The exporter currently copies CieoUI recursively, so its selection rules must change before a nested extension is added. ([Swift target API](https://raw.githubusercontent.com/swiftlang/swift-package-manager/swift-5.9-RELEASE/Sources/PackageDescription/Target.swift), [architecture notes](../research_notes/Cieo%20identity%20and%20component%20system/component-architecture.md))

## Research changes the system beyond its folders

The strongest common lesson is to organize around understandable, reusable responsibilities. ChimeKit starts from an audit and examines states and flexibility. Thumbtack separates tokens, styling and components. These support a Cieo model in which behavior, sample content and appearance have different owners, rather than a collection of fixed animated bodies. ([ChimeKit](https://www.designsystems.com/building-chimekit-with-atomic-design-and-a-collaborative-process/), [Thumbtack](https://www.designsystems.com/how-thumbtack-structures-their-design-system/))

Three decisions follow:

- **Use native controls where they already own the behavior.** Style a SwiftUI Button or compose a TextField with a label; do not invent wrappers solely to fill an atomic diagram.
- **Give each component one manifest authority.** Typed inputs, slots, states, events, style parts and platform evidence sit beside source. Generated discovery and Tessera projections read that contract.
- **Separate catalogue coverage from production readiness.** The inspected baseline has 540 public Swift recipe declarations, including 45 in Writing, alongside 11 current CieoUI production Swift files. Every existing ID needs a disposition; a polished recipe does not establish a reusable production API. ([source audit](../research_notes/Cieo%20identity%20and%20component%20system/component-architecture.md))

The operating model can stay small: one accountable owner per component, explicit contribution reasons, and one readiness matrix. A contribution needs a reusable problem, justified composition, documented states and scoped evidence. Enterprise committees or background adoption tracking add no necessary value here. ([Contributions](https://www.designsystems.com/keeping-design-system-contributions-in-check/), [operations notes](../research_notes/Cieo%20identity%20and%20component%20system/operations-and-coverage.md))

## Cieo’s identity comes from how it works

**Proposed identity: precise, approachable controls that make change easy to follow.** The existing web graphite, white and iris vocabulary is a recognizable starting point. Its exact colors are source observations, not approved contrast pairs. Native currently uses host semantic colors, so visual consistency requires an explicit theme policy rather than assuming browser colors already carry across platforms. ([visual audit](../research_notes/Cieo%20identity%20and%20component%20system/visual-foundations.md))

| Dimension | Original Cieo direction | Acceptance still required |
| --- | --- | --- |
| Anatomy and hierarchy | Visible label, value, support/error, optional action; borders mark boundaries and elevation marks actual floating layers | Long content, focus, errors and constrained geometry |
| Density | Compact task groups; remove redundant chrome before reducing text | Large text, localization and touch/keyboard paths |
| Typography | Native system roles; complete web type presets; a comfortable reading measure for explanations | Loaded/fallback fonts, wrapping and script-specific metrics |
| Color and shape | Neutral work surfaces; iris for intentional emphasis; semantic status roles; purposeful nested radii | Composed state-pair contrast in light/dark and alternate themes |
| Interaction and motion | Immediate semantic updates; interruptible spring transitions preserve orientation | Reversal, cancellation, reduced motion and actual runtime observations |

These are design choices, informed by guidance that treats typography, spatial rhythm and functional color as a coordinated system. They are not a recipe copied from a featured brand. ([Typography](https://www.designsystems.com/typography-guides/), [Space](https://www.designsystems.com/space-grids-and-layouts/), [Color](https://www.designsystems.com/color-guides/))

Cieo already has critically damped spring presets and a rendering policy for activity, reduced motion, power, transparency and contrast. Preserve those boundaries. Motion should acknowledge input or explain changed position without delaying action; a decorative shader stays optional and away from text and controls. Native adaptation should preserve intent while using platform focus, menus, sheets and system symbols appropriately. Pixel identity is a weaker goal than understandable behavior across platforms. ([Motion](https://www.designsystems.com/5-steps-for-including-motion-design-in-your-system/), [Parity](https://www.designsystems.com/a-system-built-on-parity-how-to-treat-all-of-your-users-equally/))

## Explain the task before the component taxonomy

Component pages should begin with purpose and a meaningful example, then explain alternatives, states, customization and evidence. Content guidance belongs beside the actual component; a general voice statement cannot explain validation or recovery by itself. ([Content strategy](https://www.designsystems.com/guide-to-content-strategy-in-design-systems/))

Original proposed usefulness copy:

- **Input:** “Collect a short value without hiding what the field means. Keep its label visible and show a specific correction beside invalid input.” The host owns validation and saving.
- **Selection toolbar:** “Put actions beside the current selection so people can act without losing their place.” Use for contextual actions; retain keyboard access and a persistent alternative when selection can disappear.
- **Author outline:** “See a draft’s structure and move to a section without scrolling through the whole document.” This optional Writing composition consumes host section IDs and selection; it does not parse or save a manuscript automatically.

Show retained input after a failed operation only when the host actually retains it. Explain unsupported behavior directly. Avoid promises such as “fully accessible” or “seamless” without named evidence. Each page links to its manifest/API and distinguishes demo, implemented, verified and released status. This gives both designers and implementers a reason to choose the component, beyond its animation. ([Maturity](https://www.designsystems.com/the-spectrum-of-maturity-for-design-systems/))

## Integrate through preserved contracts and separate gates

The work follows five bounded phases, with acceptance defined in the [architectural specification](../superpowers/specs/2026-10-08-atomic-component-system-design.md):

1. **Reconcile the inventory.** Preserve every existing ID and classify reusable components, adapters, recipes, examples and deprecated aliases.
2. **Establish contracts and foundations.** Validate manifests, semantic styles and controlled APIs; retain `Cieo`, `CieoUI`, `CieoAtoms` and existing consumer entry points.
3. **Promote coherent components.** Build core behavior first, then optional Writing assemblies; keep simulated operations visibly demonstrative.
4. **Make export selection explicit.** Derive source/resource closure from selected products and preserve exact-byte provenance and destination-edit safeguards.
5. **Adapt Tessera through its catalogue owner.** Keep discover, preview, edit, export and generate capabilities independent; preserve unavailable-pack content. Tessera currently pins `68b5026`, while this research inspected Apple foundation `9d2574f`.

Standalone Cieo work can precede Tessera’s native application. Tessera’s accepted prototype and signed sandbox host/helper spike remain separate prerequisites; Cieo’s package work cannot close them. ([Tessera parity contract](/Users/tanho/GitHub_non_cloud/tessera/docs/native/PARITY.md))

## Evidence keeps the open work visible

The [coverage ledger](../research_notes/Cieo%20identity%20and%20component%20system/coverage.json) records 35 articles, three event pages and seven indexes. The three source ledgers cover all 38 unique editorial URLs: [visual](../research_notes/Cieo%20identity%20and%20component%20system/visual-sources.json), [component](../research_notes/Cieo%20identity%20and%20component%20system/component-sources.json), [operations](../research_notes/Cieo%20identity%20and%20component%20system/operations-sources.json). No reachable editorial fetch remains unresolved; unlinked or historical content is not guaranteed discovered.

**Open coverage:** 23 unique Schema recordings have zero retrieved transcripts and zero watched videos; advertised caption requests returned empty responses. Seven standalone motion/brand videos, a Vimeo recording, four CodeSandbox embeds, a Figma embed and typography interaction remain unreviewed. The 47 external kits are directory inventory only. Selected figures were inspected, as named in the visual notes. The media-review sessions had no available browser; [media observations](../research_notes/Cieo%20identity%20and%20component%20system/media-observations.json) record the exact blocked/not-attempted resources. The coordinator’s working browser loaded [Architecting Subcomponents](https://www.youtube.com/watch?v=NiDoqI_ZhvY) and the [London Opening Keynote](https://www.youtube.com/watch?v=cvFRJZmMGtc), but official transcript export returned no available transcript for both representatives, including a retry for the verified London title. These attempts added no transcript or playback evidence. [Recording checks](../research_notes/Cieo%20identity%20and%20component%20system/recordings.json) and [external-resource inventory](../research_notes/Cieo%20identity%20and%20component%20system/external-resources.json) retain the exact outstanding work.

No accessibility, performance, native rendering, package optionality or consumer outcome is established by this written proposal. **Next action: review the [written specification](../superpowers/specs/2026-10-08-atomic-component-system-design.md).** The [brainstorming skill](/Users/tanho/.codex/skills/brainstorming/SKILL.md) states: “Conversational design approval only permits writing the spec”. That is why this deliverable stops at a reviewable design.
