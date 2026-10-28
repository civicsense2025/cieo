# Outline

Table-of-contents nav built from an items array.

## Use when

- A long page needs anchor links to its sections.
- Section ids already exist in the document.

## Avoid when

- The page has fewer than two sections; a list of one is noise.
- Links go to other pages; use SideNav or Breadcrumbs instead.

## Anatomy

`<nav aria-label>` with a `<ul>`; each item renders `<a href="#id">`.

## Behavior

No motion. `label` defaults to "On this page". Native anchor jumps; no scroll spying.

## Keyboard / accessibility

- Nav carries the name (`aria-label`, defaults to "On this page").
- Links need matching section ids, or they jump nowhere.

## Do / don't

- Do: `<Outline items={[{ id: "usage", label: "Usage" }]} />` mirroring real ids.
- Don't: invent ids that have no matching section in the page.

## Customization

Label and items only. List style and type come from Cieo tokens.

## Limitations

- Max 32 items. More means the page needs splitting, not a longer list.
- No active-section highlighting; the list is static.

## Related

Breadcrumbs (molecule), SideNav (organism), NavHeadingMenu (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.
