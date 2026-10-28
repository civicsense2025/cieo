# AuthCredentialForm

Email plus password plus submit for sign in and sign up.

See the component props in `manifest.json`. Errors render as text with `role="alert"`, never colour alone.

Pending labels and error text swap in place on the base motion token. Reduced motion and `data-motion="off"` keep the same states without animation.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `submit`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.
