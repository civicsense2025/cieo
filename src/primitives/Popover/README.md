# Popover

Controlled disclosure shell with a simple absolute panel below the trigger.

## Use when

- A button reveals a small panel of actions or info.
- Open state already lives in the host (or starts closed and stays local).

## Avoid when

- Content must flip around the viewport edge; this panel never flips.
- The panel is modal; use a dialog, not a popover.

## Anatomy

Trigger slot plus content children; open panel renders as an absolute block below the trigger.

## Behavior

No motion. `open` controls, `defaultOpen` seeds, `onOpenChange` reports. Uncontrolled when `open` is unset.

## Keyboard / accessibility

- Trigger keeps its own name and focus; Escape-to-close is host-owned.
- Panel content must be reachable by Tab in document order.

## Do / don't

- Do: `<Popover trigger={<button>Share</button>}>` with link children.
- Don't: rely on edge flipping; the panel sits below, always (see Limitations).

## Customization

Panel paint only. Border, radius, and shadow come from Cieo tokens.

## Limitations

- No flip, no collision handling; the host positions around edges.
- No outside-click or persistence; the host owns dismissal.

## Related

HoverCard (molecule), CommandPalette (molecule), Tooltip (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.
