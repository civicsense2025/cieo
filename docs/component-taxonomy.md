# Component taxonomy

Every component has one **layer** and one **pack**, both set in its `manifest.json` (`layer`, `packId`) and pinned by `test/component-taxonomy.test.mjs`.

- [Layers](#layers)
- [Packs](#packs)
- [Rules](#rules)
- [Names to review](#names-to-review)

## Layers

| Layer | What it is | Examples |
| --- | --- | --- |
| Primitive | A foundation with no opinion about a use case: layout, text, icon, overlay, slot, motion containers, i18n. | `Stack`, `Grid`, `Text`, `Icon`, `Overlay`, `Slot`, `MotionFrame`, `MorphSurface`, `StaggerGroup`, `I18nProvider` |
| Atom | One control, indicator or label. | `Badge`, `Avatar`, `Spinner` |
| Molecule | A small group of atoms that does one job. | `Field`, `Pagination`, `Tooltip` |
| Organism | A section or whole surface. | `Dialog`, `SideNav`, `Table` |

The Swift library already uses Atoms, Molecules and Organisms folders. The web library now uses the same names and adds Primitives underneath.

## Packs

`core` holds generic parts any app can use. A use-case pack holds components that only make sense for one kind of product, so a team building a docs site never sees sign-in cards in the way.

| Pack | For | Components |
| --- | --- | --- |
| auth | Sign-in, sign-up, reset, MFA, sessions | 15 |
| messaging | Chat and conversation lists | 16 |
| audio | Players, rooms, recording | 10 |
| agent | Agent activity, approvals, tool calls | 7 |
| social | Comments, polls, reactions, follow and share | 12 |
| editorial | Articles, rolls, figures, quotes, steps | 15 |
| tools | Import, compare, preview, trim, palette and notice screens for creative tool apps | 8 |

Import paths do not change: `cieo/Toast` is still `cieo/Toast`. Packs group the catalog and the docs, not the package.

## Rules

1. A component builds only on its own layer or a lower one. A part may build on its own group (`Tab` on `TabList`).
2. `core` never depends on a use-case pack. A pack depends on `core` or itself. When a pack part turned out to be used by core (`Mention`, `Portrait`, `ByLine`, `PersonRow`, `ReplyPreview`, `FeedbackPopover`), it moved to core.
3. Shared helpers for a family live at the primitives root (`auth-shared.tsx`), never inside one finished component, so a field or button never depends on a whole card.
4. A new component picks its layer and pack in its manifest (`schemas/component.schema.json`); the test fails until it does.

## Names to review

These components originated under domain-specific names. Their canonical general-purpose aliases are now exported alongside the original symbols from `cieo/primitives` (`src/primitives/index.ts`) so callers can adopt the canonical names without breaking existing imports:

| Original name | Idea | Canonical alias |
| --- | --- | --- |
| `ShareBar` | Proportions drawn as one bar | `ProportionBar` |
| `RollCall` | Grouped list of people | `GroupedRoster` |
| `TopicChip` | A small tag | `TagChip` |
| `ReferenceText` | Mono-style reference text | `MonoText` |
| `FrameBar` | Top bar of a framed page | `PageBar` |
