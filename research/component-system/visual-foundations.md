# Cieo visual foundations and explanatory voice

**Result:** all 13 assigned editorial articles were read in full. Propose a quiet graphite-and-white interface, a deliberate iris accent, compact task-first composition, and interruptible motion that explains change. This is research and source inspection, not a final specification or rendered acceptance. Exact palette pairs, type metrics, component states, and runtime behavior still require implementation review.

Navigation: [Identity and foundations](#what-visual-foundations-fit-cieo) · [Motion and accessibility](#how-should-motion-and-accessibility-shape-components) · [Voice and usefulness](#how-should-cieo-explain-why-components-are-useful)

## What visual foundations fit Cieo?

### Takeaway

Cieo should feel precise, approachable, and responsive because its components make tasks understandable. Its identity should come from a small set of durable decisions applied consistently, rather than a larger collection of decorative treatments.

### Cited Findings

- A system should serve its organization and users; adopting a famous system or the latest technique is not intrinsically beneficial. This supports original Cieo decisions rather than treating DesignSystems.com or Material as a visual specification. [Six myths](https://www.designsystems.com/six-myths-holding-you-back-from-embracing-design-systems/)
- Functional color roles and explicit foreground/background pairs make palette usage maintainable. [Color](https://www.designsystems.com/color-guides/)
- Khan Academy describes reducing duplicate visual choices, tying color to function, and developing typography and grid together. Its information-density improvements address its own users and hardware; they are not a benchmark to impose on Cieo. [Wonder Blocks](https://www.designsystems.com/about-wonder-blocks-khan-academys-design-system-and-the-story-behind-it/)
- Typeface choice balances personality, legibility, performance, and platform. Type presets should combine related properties rather than scatter sizes and weights. [Typography](https://www.designsystems.com/typography-guides/)
- Spatial rhythm is a decision aid; content-led sizing and fixed element sizing suit different needs. The article's pictured content-first table allows a description to wrap and the row to grow while preserving internal padding. [Space, grids, and layouts](https://www.designsystems.com/space-grids-and-layouts/)

### Inferences

#### Current implementation boundary

The inspected worktree is `/Users/tanho/GitHub_non_cloud/.cieo-worktrees/component-system-20261008`, assigned base `9d2574f`; it was clean before research notes. No repository-specific AGENTS/CLAUDE/CODEX file was found there or in the canonical Cieo root. Shared handbook and design-quality instructions apply. The following are source observations, not visible acceptance:

| Owner inspected | Implemented source facts | Implication for a proposal |
| --- | --- | --- |
| [Web palette](../../atoms/web/catalogue/tokens.css) | Light graphite `#202125`, white `#ffffff`, iris `#6654c8`, iris tint `#eeebfa`; separate dark values and alternate accents; 8px unit | Keep this recognizable starting identity; give values semantic role contracts before extending them. |
| [Web shell](../../atoms/web/catalogue/shell.css) and [recipe presentation](../../atoms/web/catalogue/atoms.css) | Inter-first stack; 14px shell body; labels and metadata include 10–13px; 24px gallery gaps; 24px stage radius; fixed preview stage heights | These are catalogue choices. They do not establish a universal component scale or safe minimum text size. |
| [Native theme](../../Sources/CieoUI/Foundations/Theme.swift) | Host accent and system foreground/secondary; 8/16/24 metrics, 12 corner, 44 touch target | Native uses semantic host colors; iris parity does not currently exist automatically. Keep host theming explicit. |
| [Native field](../../Sources/CieoUI/Molecules/LabeledField.swift) and [button style](../../Sources/CieoUI/Atoms/ActionButtonStyle.swift) | Native TextField and ButtonStyle; field error uses `.red`; button uses alpha-composited tint and opacity states | Semantic migration and actual composed contrast need review; a Theme struct alone does not prove comprehensive state styling. |
| [Earlier catalogue review](../../docs/catalogue-ui-review.md) | Historical web refinement claims and explicit legacy/native limits | The review names 345 catalogue atoms at its own reviewed commit. Do not substitute that historical number for today's inventory or imply native acceptance. |

These links are relative to this notes directory and resolve inside the assigned Cieo worktree.

#### Proposed palette and shape direction

1. **Use neutral surfaces to keep content primary.** Keep graphite for ordinary text, white for working surfaces, and a light neutral page ground. Retain dark-mode equivalents through roles, not inversion formulas. Proposed role names: `surface-canvas`, `surface-control`, `text-primary`, `text-secondary`, `border-control`, `accent`, and explicit status roles. These are proposal names, not claims of existing API.
2. **Reserve iris for intention.** Use iris for selected or active emphasis and focus where the composed pair passes. Do not color whole component families merely to differentiate the catalogue. Pastel blue/lilac/peach/mint/butter preview grounds may remain presentation scenery; they should not silently become information or status colors. Color guide role guidance supports this; the exact iris choice comes from Cieo's current source. [Color](https://www.designsystems.com/color-guides/)
3. **Make shape explain structure.** Keep the existing 12-unit native control radius as a candidate control treatment, smaller nested radii where appropriate, and softer large preview surfaces. Avoid giving every surface the same rounded-card silhouette. Use elevation for genuine floating layers, borders for boundaries, whitespace for grouping. Exact radii need optical review, not a mathematical doctrine.
4. **Separate status from accent.** Error, warning, success, and information need text and appropriate symbols as well as color. An iris-colored button does not signal success; a green theme accent cannot replace success semantics. [Wonder Blocks](https://www.designsystems.com/about-wonder-blocks-khan-academys-design-system-and-the-story-behind-it/)

#### Proposed type and density direction

| Decision | Practical proposal | Reason and limit |
| --- | --- | --- |
| Families | Native system type for SwiftUI; web system stack as the dependable baseline. Retain Inter if deliberately loaded and tested; do not assume the current CSS proves it is loaded. Mono only for code, tokens, or numeric inspection. | Preserve legibility and performance before introducing a new display face. [Typography](https://www.designsystems.com/typography-guides/) |
| Roles | Define display, section, body, control label, supporting text, and code as complete presets with family/weight/size/line height/measure/overflow policy. | Roles explain usage; visual size never substitutes for heading semantics. |
| Reading | Prototype explanatory body text around 16px/1.5 on web and native `.body` with Dynamic Type. Test a constrained reading measure around 60–70 Latin characters rather than stretching prose across the gallery. | Explicit starting choices, not accessibility minimums. Other scripts and fonts require calibration. |
| Compact controls | Keep primary labels readable; remove redundant chrome and gaps before shrinking text. Let controls and rows grow with labels, errors, large text, and localization. | Existing 10–13px metadata is a review candidate, not proof of failure or endorsement. |
| Rhythm | Keep 8-unit section rhythm with a 4-unit half step for tight relationships; retain optical exceptions for rules/icons/type. | Related items should have smaller gaps than separate tasks. Do not force a baseline grid that clips text. [Space](https://www.designsystems.com/space-grids-and-layouts/) |

A dense/comfortable distinction should first be a documented layout choice with coherent hit areas and spacing. Do not add a public density toggle until real consumers need it. Native 44-unit touch targets are already a project choice. Web control size depends on actual pointer and layout constraints, with standards evaluated separately.

#### Proposed component anatomy and ownership

Components should expose the few slots that reflect real responsibilities: identity/label, value or main content, supporting or error text, leading/trailing action, and an explicitly owned state. Do not turn every slot into a boolean variant. Composition of smaller subcomponents can preserve layout freedom without multiplying complete variants. [Taking cues from code](https://www.designsystems.com/taking-cues-from-code/)

Keep core inputs, buttons, selection primitives, and generic controls available independently of writing. Put reusable Writing domain compositions under `Sources/CieoUI/Extensions/Writing`, separately optional and default off; demonstrations belong in `Examples/Writing`. This boundary is supplied by the user's decision, not dictated by the articles. Cieo owns reusable source and contracts; Tessera consumes and explains them. A catalogue demonstration is evidence of an example, not evidence of a production API.

Inventory first, promote repeated needs, and justify exceptions rather than making all recipes production components. Figma's small-team account supports extracting flexible foundations from existing work, while retaining justified exceptions. [Small-team system](https://www.designsystems.com/how-a-small-team-built-figma-dot-coms-design-system/)

### Gaps

- No article establishes the best iris hue, radius, typeface, type minimum, or spacing density for Cieo. The proposal requires real-content comparisons and consumer feedback.
- Full editorial text was reviewed for all 13 assigned sources. Selected figures were visually inspected in a background browser at 1280×720: the space article’s “7 content first” table (with part of the preceding fixed-height table visible), the iconography article’s “Venn-Diagram” and “houses scale” shop icons at 24/40/80, and the motion article’s “Motion Specs Diagram” with effect tracks and a timeline. Other figures were not systematically inspected. This does not claim every image, embedded video, linked template, or external resource was reviewed.
- No source changes, build, native launch, rendered Cieo review, or accessibility/performance execution occurred. Existing CSS references, review text, and Swift source are source evidence only.

## How should motion and accessibility shape components?

### Takeaway

Keep Cieo's interruptible spring vocabulary as a functional signature: movement should preserve orientation and show a state change without making users wait. Accessibility is part of the component contract and the consuming journey, rather than a catalogue badge.

### Cited Findings

- Motion documentation should include purpose, start/end state, duration/easing, effects, and choreography. The inspected timeline figure separates effect tracks and shows overlap, supporting explicit sequence documentation. Its example timings and legacy Material/Lightning/Inspector Spacetime references are historical examples, not current platform recommendations. [Motion guide](https://www.designsystems.com/5-steps-for-including-motion-design-in-your-system/)
- Accessible defaults, documentation, human testing, and involvement of people with disabilities matter together. The article cautions against treating overlays or automated inference as replacements for semantic implementation. Its 2020–2023 figures and technology predictions are dated and are not repeated as current statistics. [Accessible systems](https://www.designsystems.com/the-future-of-design-systems-is-accessible/)
- Web baseline: WCAG 2.2 A/AA applies to complete journeys. Ordinary text contrast is 4.5:1, large text 3:1; essential non-text state information generally needs 3:1, with criterion exceptions. Color alone cannot convey meaning. AA pointer targets use 24×24 CSS px or stated exceptions; 44 is not the AA minimum. Text resize to 200%, spacing overrides, 320 CSS px reflow where applicable, keyboard access, visible/unobscured focus, labels, and error recovery need checks. Interaction-animation disabling is AAA; honoring reduced motion remains a Cieo project requirement. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Inferences

#### Preserve the existing signature with explicit purpose

[Spring.swift](../../Sources/Cieo/Spring.swift) defines critically damped `snap`, `base`, `soft`, and `lazy` presets, with interruptible Track retargeting. This is a restrained response, not a bouncy brand. [MotionTokens](../../Sources/Cieo/Tokens.swift) contains settle-time descriptors; they are not fixed delays to place before a user action completes.

| Intent | Proposed component behavior | Constraint |
| --- | --- | --- |
| Acknowledge | `snap` for press/release, checks, chevrons, and exits | Update semantic state immediately. Repeated input can retarget; never disable input merely to finish animation. |
| Preserve orientation | `base` for selected indicators, overlay entry, and local list reflow | Explain what moved and why; do not replay every sibling on each change. |
| Track continuous change | `soft` for progress, size change, or longer travel | Real value remains readable; progress must reflect actual work rather than an invented completion promise. |
| Express character | `lazy` only for optional decorative moments | No continuous attention competition while reading or entering text; stop offscreen/inactive work. |

For each motion-bearing component, document trigger, target state, animated properties, preset, cancellation/reversal, focus ownership, reduced-motion result, and resting behavior. Test rapid reversal halfway through motion; an MP4 of a happy path cannot establish interruption correctness.

The inspected [RenderPolicy](../../Sources/CieoUI/Foundations/RenderPolicy.swift) and [RenderingPreferences](../../Sources/CieoUI/Foundations/RenderingPreferences.swift) already gate motion using activity, reduced motion, explicit disable, and low power; shaders also depend on opt-in effects, transparency, and contrast. Preserve this boundary. Do not claim every legacy recipe follows it. Reduced motion should settle directly into the same meaningful state, while focus, labels, and status remain intact.


#### Additional source-text context from the bounded media round

- Forge explains that common base components can support substantially different brand layouts; its popup-cart/sidebar-cart comparison is present in prose and code. This supports Cieo owning generic behavior and optional compositions while Tessera owns catalogue presentation. The two homepage clips were not observed, so no color, spacing, motion or visual-brand conclusion is attributed to playback. [Forge](https://www.designsystems.com/the-forge-harrys-approach-to-multi-brand-design-systems/)
- The React containers article describes shared keyboard/focus/RTL logic beneath different visual treatments, with four demos for tabs, styled tabs, randomized UI, and tooltip overrides. This supports explicit behavior ownership; the demos were not exercised and the article-era hooks/ARIA examples are not a current API recommendation. [React containers](https://www.designsystems.com/react-containers-some-assembly-required/)
- White-labeling illustrates theme constraints but includes an arbitrary CSS injection escape hatch and acknowledges XSS risk. Cieo should not copy that boundary: bounded semantic roles and validated external data are the useful lesson. Historical on-premise deployment does not make unsafe input safe. Its Figma embed was not opened. [White-labeling](https://www.designsystems.com/white-labeling-putting-the-design-system-in-users-hands/)
- The cached typography-demo text lists type roles, repeated example text, and px labels, but omits actual numeric values. It cannot establish resizing, actual loaded fonts, or usable metrics. The proposed Cieo type roles remain choices for contextual testing. [Typography demo](https://www.designsystems.com/typography/)

#### Make accessibility ownership visible

- **Component owner:** native semantics, visible names, error association, focus behavior, keyboard activation, and semantic state. Theme values must be evaluated after opacity/compositing; `.opacity(0.5)` is not an accessibility strategy.
- **Host owner:** real validation, permission, pending/result truth, save durability, undo, localization, and placement within the complete journey. A field component cannot certify the network workflow containing it.
- **Catalogue owner:** demonstrate long labels, invalid/disabled/pending states, large text, high contrast, reduced motion, and keyboard paths. Show separate evidence statuses for static checks, browser/native interaction, assistive technology, and rendered review.

For icons, keep one-color product glyphs, consistent optical weight, and clear asset naming. The viewed 24/40/80 shop-icon example changes detail with size; it supports purposeful simplification rather than blind scaling. The guide's claim that icons are language-independent is too broad: keep text for unfamiliar actions and test metaphors across locales. Preserve system symbols on native where appropriate instead of redrawing them solely to match a browser screenshot. [Iconography](https://www.designsystems.com/iconography-guide/)

### Gaps

- There is no current contrast matrix covering default, hover, pressed, selected, focus, error, disabled, inverse, alternate accent, and dark combinations. The current hex values alone cannot close this gap.
- Frame pacing, interruption quality, screen-reader behavior, zoom, forced colors, and large-text geometry were not executed. No conformance or performance result is claimed.
- Media review is incomplete. The additional bounded round attempted an own background IAB tab for the usage MP4, but CUA returned “Browser is not available: iab”; browser discovery returned `[]`. No tab was created. All seven standalone motion/Forge clips, five interactive embeds, and the typography demo therefore remain unobserved; the other twelve were skipped under the shared environment blocker, not individually tested and failed. [Per-resource media ledger](media-observations.json) records exact URLs, attempts and source-text-only lessons. No frame, poster, full playback, scrub, or interactive exercise occurred in this round. Vimeo and the Taking cues from code keynote also remain unwatched. The parent report tab was untouched; no media downloads, installs, login or permission grants occurred.

## How should Cieo explain why components are useful?

### Takeaway

Lead with the user action and the trouble the component removes. Teach the choice, show a meaningful example, name the limits, and keep implementation evidence separate from benefit claims.

### Cited Findings

- Component-level content rules should cover casing, vocabulary, empty states, confirmations, and localization; a general voice guide is insufficient. Empty copy should tell people how to become unblocked. [Content strategy](https://www.designsystems.com/guide-to-content-strategy-in-design-systems/)
- Documentation needs increase as creators and consumers become more separated. Consumers need the reason for a component and how to use it, not only its visual inventory. This is a relationship model, not a mandatory ladder toward a large enterprise system. [Maturity spectrum](https://www.designsystems.com/the-spectrum-of-maturity-for-design-systems/)
- A reusable system handoff includes guidance for extending both functionality and aesthetics, plus ongoing feedback from actual users. [Agency perspective](https://www.designsystems.com/why-we-build-design-systems-an-agencys-perspective/)
- System principles become useful when accompanied by concrete reasons, examples, and counterexamples; implementation and maintenance continue after the visual direction is selected. [Wonder Blocks](https://www.designsystems.com/about-wonder-blocks-khan-academys-design-system-and-the-story-behind-it/)

### Inferences

#### Proposed voice and sample copy

Use sentence case, short concrete verbs, and familiar names. This is Cieo's proposed choice; the content article recommends title case in some short-string contexts, which need not become Cieo's rule. Explain unfamiliar terms once. Avoid claiming that a component is intuitive, seamless, or accessible without scoped evidence.

| Situation | Proposed copy | Why |
| --- | --- | --- |
| Collection purpose | “Components that make state changes easier to follow.” | Describes an observable benefit without a broad quality claim. |
| No search results | “No components match ‘outline’. Clear filters to see all components.” | Identifies the cause and gives a direct action. |
| Optional writing collection | “Writing tools. Add outline and selection actions when your app needs them.” | Clarifies a domain layer without narrowing core controls. |
| Invalid input | “Enter a title before continuing.” | Names the field and known correction. |
| Unconfirmed save | “Saving could not be confirmed. Your text is still here.” | Useful only if the host actually preserves text; never imply a confirmed save. |

Define vocabulary by operation: **Remove** detaches an item from a collection; **Delete** destroys the item under the host's deletion contract; **Discard changes** abandons a draft revision; **Copy** writes to the clipboard; **Export** produces another format. These examples are proposed contracts, not claims of current app behavior. Document them beside the relevant component.

Do not adopt the content article's suggestion to scale text down for localization. Prefer wrapping, reflow, flexible geometry, and alternate layout. Shrinking text obscures the very content that needs to remain usable. Avoid sentence fragments spread over multiple controls when translated word order can change. [Content strategy](https://www.designsystems.com/guide-to-content-strategy-in-design-systems/)

#### Reusable usefulness template

1. **What it helps you do:** one sentence naming the user's action and result.
2. **When to choose it:** the trigger, the problem it removes, and one counterexample where a simpler or different control fits.
3. **How it stays understandable:** anatomy, visible/announced states, keyboard/focus, motion purpose, reduced-motion equivalent, and recovery.
4. **What the host supplies:** real data/action/validation/persistence and any domain assumptions; name optional dependencies.
5. **Try it and inspect proof:** one meaningful task, state variants, source owner, and separately recorded implementation/runtime/visual/accessibility status.

These five fields should be reusable catalogue metadata and documentation structure, not five extra paragraphs of prose on every compact tile. Show the first sentence inline; reveal detail where people inspect a component.

#### Worked explanation: generic input

**Input — enter and correct a value without losing context.** Use a labeled field when a person must supply a short value such as a name, search term, or title. The persistent label identifies the value; supporting text explains unusual constraints; an error names a correction and keeps entered text available. Choose a text area for longer content and a tested selection control when options are bounded.

An input is useful because it keeps identity, value, and correction together. Focus appearance explains where typing goes; optional feedback motion never replaces the label or error. The host owns validation and submission. Proposed example: label “Title,” helper “Use a short, descriptive name,” error “Enter a title before continuing.” No writing-only dependency. Current native `LabeledField` is a starting implementation; comprehensive error association and theme-state acceptance remain unverified. This explanation follows component-level content guidance. [Content strategy](https://www.designsystems.com/guide-to-content-strategy-in-design-systems/)

#### Worked explanation: selection toolbar

**Selection toolbar — apply an action to the text or items you selected.** Use it when a small set of contextual actions would otherwise force a trip to a distant menu. For a writing composition, the toolbar might offer “Bold,” “Add link,” and “Comment”; a generic multi-item composition uses its own actions. Avoid it when selection is merely for copying or when a persistent toolbar is clearer.

Preserve the selection while invoking an action, keep the toolbar clear of selected content and viewport edges, support keyboard reachability and dismissal, and return focus logically. Active formatting needs state beyond a color. Motion should explain the toolbar's appearance or relocation, with direct settlement under reduced motion. The host owns editor selection/range validity, enabled actions, document mutations, and undo. A generic action container stays core; editor-aware behavior belongs in optional Writing. This applies the source's composition principle rather than promoting a fixed demo wholesale. [Taking cues from code](https://www.designsystems.com/taking-cues-from-code/)

#### Worked explanation: author outline

**Author outline — see a document's structure and move to the section you need.** Use it when a document is long enough that scrolling obscures its organization. The list mirrors actual headings, distinguishes hierarchy and current location, and offers explicit section navigation. A short document may need no separate outline.

A useful outline explains where content belongs, rather than displaying decorative indentation. Proposed empty copy: “No headings yet. Add a heading to build an outline.” Keep long heading names available, distinguish focus from current section, and avoid auto-scrolling that fights the author's cursor. Navigation can move immediately under reduced motion. If reordering is offered, require a non-drag alternative and clear undo behavior. The host owns stable heading identity, parsing, editor selection, and document updates; Cieo owns a reusable outline composition under optional Writing, with a demonstration in `Examples/Writing`. Adoption documentation should explain these assumptions to consumers who did not build the component. [Maturity spectrum](https://www.designsystems.com/the-spectrum-of-maturity-for-design-systems/)

### Gaps

- These worked explanations are original proposals. They do not certify present recipes as production-ready or assert an existing editor adapter API.
- No usability study establishes time saved, task completion improvement, or a preferred new display face. Do not transfer historical case-study percentages into Cieo benefit claims.
- Next evidence needed: apply this template to one generic input and one optional Writing composition, with actual state and ownership details, before broad catalogue promotion.
