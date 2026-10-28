# AspectRatio

Ratio box for media that keeps its shape (video embeds, image frames).

## Use when

- Media must hold a ratio (e.g. `16/9`) before it loads to avoid layout shift.
- One child (image, video, iframe) should fill a shaped frame.

## Avoid when

- Content height is natural; let text and lists size themselves.
- You need cropping control per image; that belongs to the media host, not the box.

## Anatomy

Root `div.cieo.cieo-aspect-ratio` with inline `aspect-ratio`; the single child is absolutely positioned to fill the box.

## Behavior

No motion. The box keeps `ratio` at any width; overflow is hidden. Never steals focus.

## Keyboard / accessibility

- Presentational box only; no label, no landmark, no focus.
- The child keeps its own semantics (alt text, captions, player controls).

## Do / don't

- Do: `<AspectRatio ratio="16/9">` around a video embed.
- Don't: put text content in the box; fixed ratios clip flowing text.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One child only. Overlays (badges, captions) belong to the host on top of the box.
- Ratio is a plain CSS string; there is no named-ratio scale in this plan.

## Related

Center (atom), Grid (molecule), Section (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
