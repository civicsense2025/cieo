# Token

Minimal pill for keywords and filters.

## Use when

- A keyword, tag, or active filter needs a small pill.
- The pill is static text, not a status; statuses belong to Badge.

## Avoid when

- Meaning depends on status color; use Badge with its five statuses instead.
- The pill needs removing or actions; that is a chip with a button, not a Token.

## Anatomy

Root `span.cieo.cieo-p-token` with `data-tone`; single content slot as children. Own minimal paint, separate from Badge.

## Behavior

No motion. Tone defaults to `default`; `accent` lifts emphasis. Static text only.

## Keyboard / accessibility

- Token is plain text output, never focusable and never the sole conveyor of state.
- In filter lists, the list structure (not the pill) carries the semantics.

## Do / don't

- Do: `<Token tone="accent">Education</Token>` marking an active filter.
- Don't: `<Token>Failed</Token>` as a status; that is a Badge with readable status.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One content slot; keyword text only, no icons or buttons inside.
- Two tones only (`default`, `accent`).

## Related

Badge (atom), Text (atom), Kbd (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
