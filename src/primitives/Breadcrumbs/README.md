# Breadcrumbs

Trail of links to the current page (Home / Library / Report).

## Use when

- The page sits 2+ levels deep in a hierarchy and users need a way back up.
- The last crumb names the current page.

## Avoid when

- The page has no parents; a trail of one is noise.
- You need primary navigation; that is a nav or menu, not breadcrumbs.

## Anatomy

Root `<nav aria-label>` with an `<ol>`; `BreadcrumbItem` children as list items. Separators come from CSS, not markup.

## Behavior

No motion. Label defaults to "Breadcrumb". List wraps on narrow widths.

## Keyboard / accessibility

- Root carries the trail name (`aria-label`, defaults to "Breadcrumb"). Do not repeat it on crumbs.
- Last crumb is the current page without a link (`aria-current="page"`). Never link the current page.

## Do / don't

- Do: `<Breadcrumbs><BreadcrumbItem><a href="/">Home</a></BreadcrumbItem><BreadcrumbItem current>Report</BreadcrumbItem></Breadcrumbs>`.
- Don't: make the current page a link or omit `aria-current`.

## Customization

Label only. Colors, separators, and spacing come from Cieo tokens; do not restyle separators per instance.

## Limitations

- Children must be `BreadcrumbItem`. Arbitrary content breaks the trail semantics.
- One trail per page; more means the hierarchy is unclear.

## Related

BreadcrumbItem (atom), Link (atom), Pagination (lane plan).

## Evidence

Storybook-free: covered by `test/primitives-navigation.test.mjs` + docs preview. No device acceptance in this plan.
