# MetadataListItem

One term and description pair in a metadata list.

## Use when

- Adding one fact to a MetadataList.
- The host can name the fact with a short `term`.

## Avoid when

- Outside a MetadataList; dt/dd need a dl parent.
- The description is a full article; use a section instead.

## Anatomy

Wrapper div with `display: contents`; `<dt>` renders `term`, `<dd>` renders children. The parent grid places both.

## Behavior

No motion. Renders the pair; owns no logic.

## Keyboard / accessibility

- Inherits list semantics; adds no roles of its own.
- Term must name the description ("Owner", not "Info").

## Do / don't

- Do: `<MetadataListItem term="Owner">Library team</MetadataListItem>`.
- Don't: leave the description empty; omit the pair instead.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Max 8 description nodes. More means the fact is a section.
- No nested MetadataLists; flatten the facts.

## Related

MetadataList (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `term`, `description`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
