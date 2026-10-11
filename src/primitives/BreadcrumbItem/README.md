# BreadcrumbItem

One crumb in a Breadcrumbs trail: a link, or the current page.

## Use when

- Rendering one level of a `Breadcrumbs` trail.
- The crumb is the current page and needs `aria-current`.

## Avoid when

- Outside `Breadcrumbs`; a lone crumb has no trail context.
- You need a standalone link; use a Link instead.

## Anatomy

`<li class="cieo-p-crumb">`; host link or page name as child. Separator is injected by CSS on `+ .cieo-p-crumb`.

## Behavior

No motion. `current` defaults to false; when true the item marks the page and must not contain a link.

## Keyboard / accessibility

- `current` sets `aria-current="page"` on the item. Non-current crumbs keep native link focus and order.
- Never link the current page; plain text keeps screen readers and tabs on the real destination.

## Do / don't

- Do: `<BreadcrumbItem current>Report</BreadcrumbItem>` for the last crumb.
- Don't: wrap the current page in an `<a>` or set `current` on a linked crumb.

## Customization

Current flag only. Color and weight come from Cieo tokens; do not restyle per instance.

## Limitations

- Single default slot (max 1 child group). One crumb, one destination.
- Requires `Breadcrumbs` parent for list semantics.

## Related

Breadcrumbs (molecule), Link (atom).

## Evidence

Storybook-free: covered by `test/primitives-navigation.test.mjs` + docs preview. No device acceptance in this plan.
