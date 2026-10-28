# TabList

Tab row that owns the selected value while the host owns the panels.

## Use when

- One view switches between 2–6 peer panels (settings sections, day/week/month).
- Selection is instant and the panels live next to the row, host-rendered.

## Avoid when

- Tabs navigate between pages; use real navigation links instead.
- Options toggle independently; use ToggleButtonGroup instead.

## Anatomy

`div role="tablist"` with `aria-label`; exports `TabContext` (`{value, onSelect}`) consumed by Tab and TabMenu. Underline row; selected tab marked by state.

## Behavior

Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue` with internal state). Selecting a tab reports its `value`; host swaps panels and owns persistence.

## Motion

The selected-tab indicator slides on the base spring with a lagging edge (`useEdges`): each Tab registers its button through context, and the row re-measures the selected tab (`offsetLeft`/`offsetWidth`) on selection change and window resize. `motion={false}` repositions the indicator instantly. Reduced motion jumps to the end state.

## Keyboard / accessibility

- Row carries the tab name (`aria-label`, required). Do not repeat it on tabs.
- Each tab keeps `role="tab"` and `aria-selected` from context with native button focus order.
- Host panels should use `role="tabpanel"` and match the selected value.

## Do / don't

- Do: `<TabList label="Settings sections" value={t} onValueChange={setT}>` with valued Tabs.
- Don't: render tab panels inside the row; the row owns selection, the host owns panels.

## Customization

Selected-tab marker only. Row, type, and spacing come from Cieo tokens.

## Limitations

- Arrow keys, Home, and End move and activate tabs; the host owns the associated panels.
- Host persists the value; the row never writes storage.

## Related

Tab (atom), TabMenu (molecule), SegmentedControl (molecule).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` customizes the root. `slotProps.root` accepts className, style, title, and data attributes without replacing owned selection, roles, or keyboard behavior. `slotProps.indicator` customizes marker paint; position and width stay library-owned.
