# Badge

Small status label for counts and states beside content (unread totals, row status).

## Use when

- A count or short status sits beside content it describes.
- Status pairs with visible text; the badge never carries meaning alone.

## Avoid when

- Status is conveyed by color alone; pair with text so meaning survives without color.
- The label needs actions or long copy; use Text or a Button instead.

## Anatomy

Root `span.cieo.cieo-badge` with `data-status`; single content slot as children. Paint comes from the design-system `.cieo-badge` in `design/styles/controls.css`; this file owns the contract only.

## Behavior

No motion. Status defaults to `default`; `success`, `warning`, `danger`, and `info` reuse the design-system variants. No new CSS file ships with this primitive.

## Keyboard / accessibility

- Badge is plain text output, never focusable and never the sole conveyor of status.
- Do not put live or critical alerts in a Badge alone; pair with adjacent text the reader already sees.

## Do / don't

- Do: `<Badge status="success">Synced</Badge>` beside a row label.
- Don't: `<Badge status="danger" />` with color only and no readable text.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One content slot, max 1 child. More means the content needs Text, not a Badge.
- Exactly one badge style; overrides limited to background via `styleParts`.

## Related

Text (atom), Button (atom), AvatarGroup (molecule).

## Evidence

Storybook-free: covered by `test/primitives-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
