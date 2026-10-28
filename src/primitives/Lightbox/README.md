# Lightbox

Image viewer dialog for inspecting one picture at full size (a receipt photo, a chart).

## Use when

- The thumbnail is too small to read and the full image answers the question.
- There is exactly one image; galleries need previous/next controls this shell lacks.

## Avoid when

- The image is decorative; it needs no viewer at all.
- The reader must compare two images side by side; keep both inline instead.

## Anatomy

`<Overlay />` scrim plus a `role="dialog"` viewer with the `<img>` and a conditional close button.

## Behavior

Stays mounted through the exit spring before unmounting when `open` closes; the host owns open state. Escape calls `onClose`.

## Motion

Fades in on open (`entering`, default `fade`); plays the exit spring before unmounting on close (`exiting`, default `fade`). `motion={false}` renders the end state instantly. Reduced motion (OS setting or `data-motion="reduced"`) always resolves end states. Images fade, they don't rise.

## Keyboard / accessibility

- Viewer carries the accessible name (`label`, defaults to Image viewer).
- Image keeps real `alt` text (required); the close button keeps native focus.

## Do / don't

- Do: `<Lightbox src="/receipt.jpg" alt="Grocery receipt totaling $42.18" open onClose={close} />`.
- Don't: pass empty `alt` to silence the requirement; describe what the viewer shows.

## Customization

Viewer label only. Surface, sizing, and image fit come from Cieo tokens.

## Limitations

- One image, no zoom or paging; add those in the host when the task needs them.
- No focus trap or restore; the host wires those around this shell.

## Related

Dialog (organism), Overlay (atom), Card (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a class to the root without replacing the Cieo class. `slotProps` accepts named presentation parts: `root`, `image`, `close`. Each part accepts `className`, `style`, `title`, and nonreserved `data-*` attributes. Roles, ARIA, refs, handlers, state attributes, and owned geometry remain component-owned. Existing content props and children remain the content slots.
