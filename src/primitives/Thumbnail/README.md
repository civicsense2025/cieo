# Thumbnail

Fixed-ratio image preview with a description.

## Use when

- A row or card needs a small approved preview image.
- The image has a real description for `alt`.

## Avoid when

- The image is a person's face; use Avatar instead.
- No description exists; thumbnails require `alt`, never an empty one.

## Anatomy

Native `img.cieo.cieo-p-thumbnail` with `src`, `alt`, `data-size`, and lazy loading. Fixed ratio via `aspect-ratio`.

## Behavior

No motion. Size defaults to `md`; `sm` and `lg` step the box. Image covers and crops.

## Keyboard / accessibility

- `alt` is required by types; describe the image, not its file name.
- Decorative images do not belong here; this primitive always announces.

## Do / don't

- Do: `<Thumbnail src="/img/bill.jpg" alt="Capitol steps at noon" />` in a card.
- Don't: `<Thumbnail src="…" alt="" />`; empty alt belongs on decorative images elsewhere.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Fixed ratio only; hero or freeform images live elsewhere.
- Three sizes only (`sm`, `md`, `lg`).

## Related

Avatar (atom), Markdown (atom), EmptyState (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
