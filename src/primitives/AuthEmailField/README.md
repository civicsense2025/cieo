# AuthEmailField

Labelled email input with an inline error, for auth forms.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `id` | string | required | Binds the label and the error message. |
| `label` | string | `"Email"` | Visible label text. |
| `value` | string | — | Controlled value. |
| `defaultValue` | string | — | Uncontrolled initial value. |
| `error` | string | — | Error text; marks the input invalid. |
| `disabled` | boolean | `false` | Disabled state. |
| `onChange` | `(value: string) => void` | — | Fires on every change. |
| `onBlur` | `() => void` | — | Fires on blur. |

Error wiring: the message carries `role="alert"` and the input points at it with `aria-describedby`. The input uses `autocomplete="email"`.

Error presence and the border state use the base motion token. Reduced motion and `data-motion="off"` update them instantly.

Tokens: `--cieo-color-surface`, `--cieo-color-text`, `--cieo-color-danger`, `--cieo-color-accent`. The 1.5px muted edge meets WCAG 1.4.11.
