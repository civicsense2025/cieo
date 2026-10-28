# TopNavMegaMenuItem

Link row with a title and an optional description inside a mega menu panel.

## Use when

- One destination needs a title plus a one-line explainer.
- Rows live inside TopNavMegaMenu's panel.

## Avoid when

- Title alone suffices; use TopNavItem instead.
- The card needs media; use TopNavMegaMenuFeaturedCard instead.

## Anatomy

Native `<a>` with a title span and an optional description span stacked vertically.

## Behavior

No motion. Description renders only when provided. The row never manages focus.

## Keyboard / accessibility

- Native link focus and order. Title names the destination; description supports, never repeats.
- Keep descriptions to one line so panels stay scannable.

## Do / don't

- Do: `<TopNavMegaMenuItem href="/billing" title="Billing" description="Invoices and receipts" />`.
- Don't: put two links in one row; split them.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- No icons or badges inside the row; title plus description only.
- No disabled state; hide destinations that cannot be used.

## Related

TopNavMegaMenu (molecule), TopNavMegaMenuFeaturedCard (molecule), TopNavItem (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `title`, `description`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
