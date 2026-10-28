# AuthMfaChallenge

OTP plus verify with a recovery-code fallback toggle.

See the component props in `manifest.json`. Errors render as text with `role="alert"`, never colour alone.

Authenticator and recovery panes crossfade on the base token while their measured height follows the soft spring. The outgoing pane is inert and hidden from assistive technology, and focus moves to the incoming field without waiting for motion. Reduced motion and `data-motion="off"` switch instantly.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `recovery`, `label`, `input`, `submit`, `toggle`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.
