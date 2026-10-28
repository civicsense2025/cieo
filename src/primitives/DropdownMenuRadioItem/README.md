# DropdownMenuRadioItem

One pick inside a menu radio group, checked when the group value matches.

## Use when

- The row is one of 2–5 peer values in a DropdownMenuRadioGroup (sort order, density).
- Clicking the row should select it and report upward, nothing else.

## Avoid when

- The row toggles independently; use DropdownMenuCheckboxItem instead.
- The row runs an action; use DropdownMenuItem instead.

## Anatomy

Native `<button>` with `role="menuitemradio"` and `aria-checked`. Renders `label` as its text; `data-checked` mirrors state for styling.

## Behavior

No motion, no own state. `checked` reads `group.value === value` from context; standalone (no provider) it reads unchecked and documents as misplaced. Clicks call the group `onSelect` with `value`.

## Keyboard / accessibility

- `label` (required) is both text and name; keep options parallel ("Newest first", "Oldest first").
- `aria-checked` always present; never swap in `aria-pressed`.
- Native button focus; keep a visible focus ring from tokens.

## Do / don't

- Do: `<DropdownMenuRadioItem label="Newest first" value="newest">` inside a valued group.
- Don't: reuse a `value` across rows; duplicates check together and confuse.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Useless outside DropdownMenuRadioGroup; standalone rows never check.
- No disabled state; hide unavailable options instead of disabling them.

## Related

DropdownMenuRadioGroup (atom), DropdownMenuCheckboxItem (atom), Tab (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
