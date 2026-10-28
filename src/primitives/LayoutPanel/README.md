# LayoutPanel

Named side panel on the left or right edge (filters rail, details rail).

## Use when

- Secondary content (filters, details) sits beside the main column.
- The rail needs its own complementary landmark with a name.

## Avoid when

- The rail is primary navigation; AppShell owns the nav slot instead.
- The side content is untitled decoration; an unnamed aside is not a landmark.

## Anatomy

Root `aside.cieo.cieo-layout-panel` with required `aria-label` and `data-side`; host content as children. The divider sits on the content-facing edge.

## Behavior

No motion. Side defaults to `right`; `left` mirrors the divider. The panel never steals focus.

## Keyboard / accessibility

- Root is the `complementary` landmark; `label` (required) names it, e.g. "Filters".
- Do not repeat the label on children; keep one heading per panel.

## Do / don't

- Do: `<LayoutPanel label="Filters" side="left">` with filter controls inside.
- Don't: skip the label; an unnamed aside vanishes from landmark navigation.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One panel per edge. Two rails on one side need host-level grouping.
- No collapse or resize behavior; the host owns panel visibility.

## Related

Layout (molecule), AppShell (organism), GridSpan (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
