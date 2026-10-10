# HoverCard

Rich hover card on the Tooltip reveal pattern, wider than a tooltip.

## Use when

- Hovering a name or term deserves a card (bio, definition, preview).
- Content is richer than one line but still glanceable.

## Avoid when

- Content is one short hint; use Tooltip instead.
- The card needs buttons or links; hover cards are read-only.

## Anatomy

Trigger slot plus `content` card body; CSS reveals the card on hover and focus-within.

## Behavior

Opacity-only reveal with a reduced-motion guard. No JavaScript state; the trigger keeps its accessible name.

## Keyboard / accessibility

- Trigger is described by the card (`aria-describedby`); keyboard users get it on focus.
- Card content must be plain text and images; no interactive descendants.

## Do / don't

- Do: `<HoverCard content={<p>Short bio…</p>}>` around a username.
- Don't: put links inside `content`; touch users can never reach them.

## Customization

Card width caps at 20rem. Colors and radius come from Cieo tokens.

## Limitations

- Hover and focus only; no click pinning or persistence.
- Long content overflows silently; keep cards under a paragraph.

## Related

Tooltip (molecule), Popover (molecule), CommandPalette (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.
