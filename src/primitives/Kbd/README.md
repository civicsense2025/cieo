# Kbd

One keyboard key or shortcut chord (⌘K, Esc, Enter).

## Use when

- Docs or menus name the keys that trigger an action.
- Each chord gets its own Kbd; join multi-key chords with visible separators.

## Avoid when

- The keys perform the action; Kbd only documents them, it never binds handlers.
- The shortcut needs a full explanation; pair with Text instead of stuffing prose inside.

## Anatomy

Native `<kbd class="cieo cieo-p-kbd">` with host key names as children. No props.

## Behavior

No motion. Renders inline with mono type; host orders the chord and its separators.

## Keyboard / accessibility

- Kbd is static documentation; it takes no focus and binds no keys.
- Keep key names short and exact (`Esc`, not `Escape-ish`) so readers can act on them.

## Do / don't

- Do: `<Kbd>⌘</Kbd> + <Kbd>K</Kbd>` beside a "Jump to search" label.
- Don't: wrap a sentence in Kbd; only key names belong inside.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- One chord per Kbd; multi-step sequences need one Kbd per step.
- Documentation only; no keybinding behavior ships with this primitive.

## Related

Code (atom), Text (atom), Toolbar (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
