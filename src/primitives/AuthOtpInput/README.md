# AuthOtpInput

Digit boxes for verification codes.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `id` | string | required | Binds the group label and the error message. |
| `length` | number | `6` | 4-8 boxes. |
| `label` | string | `"Verification code"` | Group label text. |
| `error` | string | — | Error text; marks the boxes invalid. |
| `disabled` | boolean | `false` | Disabled state. |
| `onComplete` | `(code: string) => void` | — | Fires once the last box fills. |

Paste strips spaces and dashes, keeping digits in order. Typing advances focus; Backspace in an empty box moves back. Each box is labelled "Digit N of M".

Filled boxes acknowledge entry on the snap token and errors use base presence. Reduced motion and `data-motion="off"` update instantly.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `label`, `boxes`, `input`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
