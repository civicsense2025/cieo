# LayoutFooter

App frame footer landmark, unstyled by design (legal links, colophon).

## Use when

- The Layout frame needs its bottom `contentinfo` landmark.
- Footer content (links, legal, colophon) belongs to the host.

## Avoid when

- Outside a Layout frame; a bare footer has no frame to close.
- You need in-content grouping; use Section instead.

## Anatomy

Root `footer.cieo.cieo-layout-footer` with optional `aria-label`; host content as children. No CSS ships with this primitive.

## Behavior

No motion, no paint. Renders the footer landmark only; pinning comes from the Layout frame. Never steals focus.

## Keyboard / accessibility

- Root is the `contentinfo` landmark; `label` names it only when a page has more than one footer.
- Links inside keep native focus and order; do not repeat the label on children.

## Do / don't

- Do: `<LayoutFooter>` with legal links inside a Layout frame.
- Don't: style it per page here; the host owns footer paint.

## Customization

Label only. There is no paint to customize; host owns all styling.

## Limitations

- Unstyled landmark only. Borders, background, and spacing belong to the host.
- One contentinfo per page; extra footers need labels or a different primitive.

## Related

Layout (molecule), LayoutHeader (atom), LayoutContent (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.
