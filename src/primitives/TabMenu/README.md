# TabMenu

Menu-styled twin of TabList, for tab rows that read as vertical menus.

## Use when

- Tabs sit in a sidebar or settings rail and should read as a menu, not an underline row.
- The same Tab children must work in both TabList and TabMenu shells.

## Avoid when

- A horizontal underline row fits; use TabList instead of forcing menu chrome.
- Items navigate pages; use real navigation links instead.

## Anatomy

`div role="tablist"` with `data-variant="menu"` and `aria-label`; reuses `TabContext` from TabList so plain Tab children work unchanged. Vertical stack with a picked-row fill.

## Behavior

No motion. Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue` with internal state), exactly like TabList. Selecting a tab reports its `value`; host swaps panels and owns persistence.

## Keyboard / accessibility

- Menu carries the tab name (`aria-label`, required). Semantics stay `tablist`/`tab`, not `menu`/`menuitem`.
- Each tab keeps `role="tab"` and `aria-selected` from the shared context.
- Host panels should use `role="tabpanel"` and match the selected value.

## Do / don't

- Do: `<TabMenu label="Account sections" value={t} onValueChange={setT}>` with the same Tabs as a TabList.
- Don't: mix TabList and TabMenu for one value; pick the shell that fits the layout.

## Customization

Picked-row fill only. Stack, type, and spacing come from Cieo tokens.

## Limitations

- Max 16 children. No arrow-key roaming; tabs tab in document order.
- `data-variant="menu"` is informational; TabList gains no variant prop from it.

## Related

TabList (molecule), Tab (atom), DropdownMenu (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.
