# AuthPasswordInput

Password input with a strength meter and a show/hide toggle.

Strength score 0-4: +1 for 8 or more characters, +1 for 12 or more, +1 for mixed case, +1 for a digit plus a symbol.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `id` | string | required | Binds the label and the error message. |
| `label` | string | `"Password"` | Visible label text. |
| `error` | string | — | Error text; marks the input invalid. |
| `disabled` | boolean | `false` | Disabled state. |
| `showStrength` | boolean | `true` | Shows the meter once text is entered. |
| `autoComplete` | string | `"current-password"` | Use `"new-password"` on sign-up and reset forms. |

The toggle keeps focus on the input after switching. The meter is `role="meter"` with `aria-valuenow` and `aria-valuetext`.
