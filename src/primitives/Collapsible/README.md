# Collapsible

Disclosure with internal state and a controlled override.

## Use when

- Hiding secondary content behind a titled button (details, filters).
- One panel stands alone; groups use CollapsibleGroup.

## Avoid when

- Content must always be visible; do not bury required facts.
- Panels coordinate single-open; use CollapsibleGroup with host state.

## Anatomy

Button with `aria-expanded` plus a `role="region"` shown when open. `open` overrides internal state; `defaultOpen` seeds it.

## Behavior

No motion. Uncontrolled by default (`useState(defaultOpen)`); controlled when `open` is set. Every toggle calls `onOpenChange` with the next state.

## Keyboard / accessibility

- Button announces expanded/collapsed; title must name the content.
- Region appears after the button in order; focus stays on the button.

## Do / don't

- Do: `<Collapsible title="Filters">` for optional refinements.
- Don't: nest Collapsibles three deep; flatten the content.

## Customization

Title and open state only. Borders and padding come from Cieo tokens.

## Limitations

- Max 16 content nodes. Larger bodies deserve their own section.
- No accordion logic; the host coordinates exclusivity via CollapsibleGroup.

## Related

CollapsibleGroup (molecule), TreeList (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-table.test.mjs` + docs preview. No device acceptance in this plan.
