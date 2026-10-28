# OverflowList

Generic +N overflow for nodes; expansion is host-owned.

## Use when

- A row of nodes (avatars, chips, icons) must cap at a budget with a count.
- The "+N" remainder needs no interaction by itself.

## Avoid when

- The remainder must expand inline; build a host expander around this.
- Order matters beyond the cap; sort before rendering.

## Anatomy

First `max` children plus a `+N` span when children exceed the budget.

## Behavior

No motion. Pure slice; `max` defaults to 4. Expansion UI is host-owned.

## Keyboard / accessibility

- The `+N` span is text, never a button; the host provides any expander control.
- Keep capped children decorative-or-linked as the host decides; this adds no semantics.

## Do / don't

- Do: `<OverflowList max={4}>` around avatar or chip nodes.
- Don't: make `+N` clickable here; the host owns the expander.

## Customization

Count tone only. Spacing comes from Cieo tokens.

## Limitations

- No measuring; the budget is a count, not pixels.
- No expander; showing the rest is host work.

## Related

AvatarGroup (molecule), Tokenizer (molecule), Stack (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `more`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.
