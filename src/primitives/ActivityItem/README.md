# ActivityItem

One notification or activity row: who did what, a quoted snippet, and when. An unread dot and optional actions complete it.

## Use when

- A notifications list or social activity feed.
- A row can open a destination and also carry a short action such as Follow back.

## Avoid when

- Content needs several paragraphs; use a comment or card.
- The row has no meaning without custom layout; compose your own.

## Anatomy

An avatar with an optional corner badge, a main area (actor name, what happened, time, quoted preview), an unread dot, and an actions slot.

## Behavior

- `href` makes the whole row a link; otherwise `onSelect` makes it a button; otherwise it is plain.
- `actions` sit above the stretched action and keep their own focus and clicks.
- `unread` shows the dot and stronger text. Turning it off fades the dot in the base duration.
- `tone` colors the badge: neutral, accent, danger or success.

## Keyboard / accessibility

- One tab stop for the row, plus one per action.
- Unread rows add "unread" for screen readers; the dot itself is hidden.
- The corner badge is decorative; say the kind of event in `children`.
- Time uses a `time` element when `dateTime` is given.

## Do / don't

- Do keep `children` to a short phrase after the name.
- Don't place links inside `children`; the row already links.

## Customization

Badge colors come from the soft and strong semantic tokens. The preview clamps to two lines.

## Limitations

- Does not group or batch events; the host does.
- Does not track read state.

## Related

`Avatar`, `AvatarGroup`, `Badge`.

## Evidence

Covered by `test/primitives-feedback.test.mjs` (link, button and plain rows, unread markup, actions outside the main action).

## Host customization

`className` appends a root class. `slotProps` exposes `line`, `actor`, `what`, `preview`, `root`, `lead`, `avatar`, `badge`, `main`, `dot`, `actions`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.
