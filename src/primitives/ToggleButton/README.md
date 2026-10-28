# ToggleButton

Two-state press button that stays down, for bold, mute, and starred.

## Use when

- One option flips on and off and the state must stay visible (formatting, mute, favorite).
- The pressed look itself is the confirmation; no extra status text needed.

## Avoid when

- The choice picks one of many; use ToggleButtonGroup, SegmentedControl, or radio instead.
- The action fires once and finishes; use Button, not a toggle.

## Anatomy

Native `<button>` with `aria-pressed`; host children (icon or short text) as content. `data-pressed` mirrors state for styling.

## Behavior

No motion. Standalone, `pressed` defaults to false and clicks report `onPressedChange` with the next state. Inside ToggleButtonGroup the group value wins; give each button a `value` key. Host owns persistence.

## Keyboard / accessibility

- `label` (required) must match the visible text so speech control lands.
- `aria-pressed` always present; do not add `aria-checked` or `role="checkbox"`.
- Native button focus; keep a visible focus ring from tokens.

## Do / don't

- Do: `<ToggleButton label="Bold" pressed={bold} onPressedChange={setBold}>B</ToggleButton>`.
- Don't: use it as a submit or navigation trigger; a stuck-down submit lies about state.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Standalone state is prop-driven; the component never persists. Host stores the value.
- `value` is ignored outside ToggleButtonGroup; a group-less `value` does nothing.

## Related

ToggleButtonGroup (molecule), SegmentedControl (molecule), Button (lane plan).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
