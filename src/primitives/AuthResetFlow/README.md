# AuthResetFlow

Reset card switching request and confirm steps.

See the component props in `manifest.json`. Headings are `h2`, async results use `role="status"`, errors use `role="alert"`.

The contained request and confirmation panes use the shared base swap and soft measured-height contract. Reduced motion and `data-motion="off"` switch instantly.

## Host customization

`className` adds a class to the root without replacing the Cieo class. `slotProps` accepts named presentation parts: `root`, `title`, `footer`. Each part accepts `className`, `style`, `title`, and nonreserved `data-*` attributes. Roles, ARIA, refs, handlers, state attributes, and owned geometry remain component-owned. Existing content props and children remain the content slots.

`slots.beforeForm` and `slots.afterForm` add supporting content around the owned form. `slots.footer` replaces the default route links and accepts `null` to omit them. `slotProps.footer` styles either the default or custom footer; it does not replace credential inputs, validation, or submission behavior.
