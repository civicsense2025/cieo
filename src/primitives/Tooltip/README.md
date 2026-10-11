# Tooltip

Hover and focus hint for icon-only controls.

## Use when

- An icon-only button needs a short text hint on hover and focus.
- The trigger already has its own accessible name (`aria-label`).

## Avoid when

- The trigger already has visible text; the hint adds nothing.
- You need rich or interactive content; a tooltip bubble is plain text only.

## Anatomy

Outer `cieo-p-tooltip` span; trigger span wraps children; bubble span with `role="tooltip"` carries the text.

## Behavior

CSS reveal only: bubble appears on hover and `focus-within` via opacity. No JavaScript open state.

## Motion

Animates on fade via the `entering` behavior; `motion={false}` renders the end state instantly. Reduced motion (OS setting or `data-motion="reduced"`) always resolves end states.

## Keyboard / accessibility

- The trigger keeps its own accessible name; the bubble never replaces it.
- Trigger references the bubble via `aria-describedby`; `useId` keeps the link unique.
- Never put interactive content (links, buttons) inside the bubble.

## Do / don't

- Do: wrap an icon-only button that keeps its own `aria-label`.
- Don't: put a link or button inside the bubble; tooltips are hints, not menus.

## Customization

None per instance. Colors, radius, spacing, and timing come from Cieo tokens.

## Limitations

- Plain text only, max 512 characters; long text means the control needs a real label.
- Single child trigger only (one default slot).

## Related

IconButton (atom), Overlay (atom), Popover (lane plan).

## Evidence

Storybook-free: covered by `test/primitives-overlay.test.mjs` + docs preview. No device acceptance in this plan.
