# EmptyState

Centered no-results message with an action.

## Use when

- A list, search, or panel has nothing to show yet.
- One recovery action fixes it (retry, clear filters, create first item).

## Avoid when

- Content is loading; use Skeleton instead of an empty message.
- The situation is an error alert; use Banner instead.

## Anatomy

Centered `div.cieo.cieo-p-empty-state` with an `h2` title, optional description `p`, and one action slot owned by the host.

## Behavior

No motion. Description renders only when set; the action slot requires exactly one child.

## Keyboard / accessibility

- Title is a real `h2` so readers land on the situation by heading navigation.
- The action keeps native focus; EmptyState never steals or traps it.

## Do / don't

- Do: `<EmptyState title="No results" description="Try fewer filters.">` with a Clear button.
- Don't: show EmptyState while loading; flashing empty-then-content confuses readers.

## Customization

Title and description text only. Centering, spacing, and type come from Cieo tokens.

## Limitations

- One action child only; two recoveries means the situation needs choosing upstream.
- No imagery slot; illustration lives outside this primitive.

## Related

Skeleton (atom), Banner (molecule), Button (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `title`, `description`, `action`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.

`slots.icon`, `slots.title`, `slots.description`, and `slots.action` supply custom React content inside the owned heading, description, and action structure.
