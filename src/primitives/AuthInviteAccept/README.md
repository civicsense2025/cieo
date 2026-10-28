# AuthInviteAccept

Org invite card: who invited whom to what, with org-named accept and decline actions.

See the component props in `manifest.json`. Errors render as text with `role="alert"`, never colour alone. Both buttons name the org so screen-reader users hear the target on each action.

Pending and error copy swaps in place on the base motion token. Reduced motion and `data-motion="off"` update instantly.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `cardTitle`, `inviteText`, `inviteActions`, `accept`, `decline`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.
