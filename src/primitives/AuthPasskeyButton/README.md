# AuthPasskeyButton

Button starting a passkey ceremony.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `id` | string | required | Button id; the fallback note binds to `{id}-fallback`. |
| `label` | string | `"Continue with a passkey"` | Button text. |
| `pending` | boolean | `false` | Ceremony in flight: text swaps to waiting copy and the button busies. |
| `disabled` | boolean | `false` | Disabled state. |
| `supported` | boolean | `true` | `false` shows the WebAuthn-unavailable fallback note. |
| `onPress` | `() => void` | — | Starts the ceremony. |

Pending shows by text change plus `aria-busy`, never colour alone. The fallback note is plain text naming the alternatives (password or code).
