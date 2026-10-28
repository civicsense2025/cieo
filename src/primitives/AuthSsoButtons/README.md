# AuthSsoButtons

One button per identity provider.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `id` | string | required | Group prefix; each button binds `{id}-{providerId}`. |
| `providers` | `{id, label}[]` | required | One button per entry, each with its own accessible name. |
| `pendingId` | string | — | Provider with a redirect in flight: its text swaps and it busies. |
| `onPress` | `(id: string) => void` | — | Fires with the pressed provider id. |

Pending shows by text change (`Connecting to {label}…`) plus `aria-busy`, never colour alone. All buttons disable while any redirect is in flight.

Provider labels swap in place on the base motion token. Reduced motion and `data-motion="off"` update instantly.

See the component props in `manifest.json`.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `ssoButton`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.
