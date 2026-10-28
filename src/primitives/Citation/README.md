# Citation

Source title, linked when a URL exists.

## Use when

- A source title appears after a claim, quote, or figure.
- A stable URL exists; `href` links the title to it.

## Avoid when

- The reference needs full bibliography detail; Citation holds the title only.
- The link text would be "click here"; the title itself is the link.

## Anatomy

Native `cite.cieo.cieo-p-citation` with the source title; with `href` it nests inside a plain anchor.

## Behavior

No motion. Unlinked form is static text; linked form follows native anchor behavior.

## Keyboard / accessibility

- Linked citations keep native anchor focus; the title names the destination.
- Never cite with a bare URL as the title; readers need the source name.

## Do / don't

- Do: `<Citation href="https://example.gov/report">Census Report 2024</Citation>`.
- Don't: `<Citation>https://example.gov/r…</Citation>` with a raw URL as the title.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Title only; authors, dates, and pages live in surrounding Text.
- One source per Citation; lists need separate items.

## Related

Blockquote (atom), Text (atom), Markdown (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `content`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
