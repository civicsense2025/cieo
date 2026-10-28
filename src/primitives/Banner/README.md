# Banner

role=status notice bar with an optional title.

## Use when

- A page or panel needs a short notice everyone should read (sync state, policy change).
- The notice has a body; `title` adds a headline when one line is not enough.

## Avoid when

- The message is critical and blocking; role=status is advisory, not an alert dialog.
- The content is a count beside a row; use Badge instead.

## Anatomy

Root `div[role="status"]` with `data-tone` and `cieo cieo-p-banner`; optional title `p`, body slot for text and host actions.

## Behavior

No motion. Tone defaults to `info`; `success`, `warning`, and `danger` recolor the bar. Title renders only when set.

## Keyboard / accessibility

- `role="status"` announces the notice politely without moving focus.
- Keep bodies short; long banners delay every reader on the page.

## Do / don't

- Do: `<Banner tone="success" title="Synced">All 12 rows are current.</Banner>`.
- Don't: stack three banners; merge notices so the status region stays scannable.

## Customization

Tone and title only. Bar fill, border, and spacing come from Cieo tokens; do not restyle per instance.

## Limitations

- Advisory only; no assertive alerts, no dismiss behavior ships here.
- One body slot; complex notice layouts compose outside.

## Related

Badge (atom), EmptyState (molecule), Text (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `title`, `body`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.
