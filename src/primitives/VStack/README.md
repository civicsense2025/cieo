# VStack

Vertical stack under the HStack/VStack naming (card bodies, field columns).

## Use when

- Children stack in one column with a single shared gap.
- You want the HStack/VStack pair to read symmetrically in code.

## Avoid when

- Children flow in a row; use HStack instead.
- The layout needs columns; use Grid with GridSpan instead.

## Anatomy

Re-export of the shipped `Stack` (`Stack as VStack`, `StackProps as VStackProps`); same root, same `data-gap`. No new CSS ships with this primitive.

## Behavior

No motion. Identical to Stack: gap defaults to `md`. Never steals focus.

## Keyboard / accessibility

- Presentational column only; no label, no landmark, no focus.
- Children keep document order; identical to Stack semantics.

## Do / don't

- Do: `<VStack>` where the HStack/VStack pair reads best.
- Don't: mix VStack and Stack for the same pattern in one file; pick one name.

## Customization

Gap only. Spacing comes from the shared Stack styles via Cieo tokens.

## Limitations

- Same limits as Stack: one column, one gap, no per-child alignment (see StackItem).
- Wraps `src/primitives/Stack/Stack.tsx`; behavior changes there apply here.

## Related

HStack (atom), Stack (molecule), StackItem (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.
