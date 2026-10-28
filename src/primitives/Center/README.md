# Center

Centered content column with a max width (article body, narrow forms).

## Use when

- Reading-width content must stay centered on wide viewports.
- A single column needs gutters without a full page grid.

## Avoid when

- Content needs multiple columns; use Grid instead.
- The column is the app frame; use Layout instead.

## Anatomy

Root `div.cieo.cieo-center` with inline `max-width`; host content as children. Gutters come from token padding.

## Behavior

No motion. Width caps at `maxWidth` (default `60rem`); below the cap the column fills its parent. Center never steals focus.

## Keyboard / accessibility

- Presentational wrapper only; no label, no landmark, no focus.
- Reading order is unchanged; keep one `h1` per page above or inside.

## Do / don't

- Do: `<Center maxWidth="40rem">` around a sign-in form.
- Don't: nest Center inside Center to fake narrower text; set one width.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One column only. Sidebars and multi-column work need Grid or LayoutPanel.
- Max width is a plain string; there is no named-size scale in this plan.

## Related

Section (molecule), Grid (molecule), Stack (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
