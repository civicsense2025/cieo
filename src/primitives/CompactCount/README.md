# CompactCount

A count shortened for scanning (26.3K) whose digits roll in the direction of change. The exact number stays in the accessible text and the title.

## Use when

- Showing likes, replies, reposts, views or members next to an action.
- The number changes while someone watches it, and the direction of change matters.

## Avoid when

- The exact figure is the point (a ballot tally, an invoice); use plain text.

## Anatomy

A `span` with a visible short form (`aria-hidden`) and a visually hidden exact form ("26,300 views").

## Behavior

- `formatCompactCount(n)` uses `Intl.NumberFormat` compact notation with one decimal: 164, 1.6K, 26.3K, 4M.
- Negative, fractional and non-finite input clamps to a whole count of at least 0.
- Zero hides the visible number by default, as feeds do; `hideZero={false}` shows it.
- Changes roll only the digits that changed (shared `Digits`). Reduced motion swaps instantly.

## Keyboard / accessibility

Not focusable. The hidden exact form is what screen readers announce.

## Do / don't

- Do: pass a `unit` so the spoken form makes sense on its own.
- Don't: pre-format the value into a string.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One decimal place. Locales without compact notation fall back to the full number.

## Related

CountButton, AudioTime, Badge.

## Evidence

`test/primitives-social-audio.test.mjs`.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
