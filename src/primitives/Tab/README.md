# Tab

One tab inside a tab row, selected when the shared value matches.

## Use when

- The tab is one of 2–6 peer views in a TabList or TabMenu (general, billing, team).
- Clicking the tab should select it and report upward, nothing else.

## Avoid when

- The control picks a mode, not a panel; use SegmentedControl instead.
- The tab navigates pages; use real navigation links instead.

## Anatomy

Native `<button>`; inside a provider it carries `role="tab"` and `aria-selected`, with `data-selected` mirroring state for styling. Standalone (no TabContext) it renders a plain button with no tab semantics.

## Behavior

No motion, no own state. `selected` reads `TabContext.value === value`; standalone it renders unselected and documents as misplaced. Clicks call the shared `onSelect` with `value`.

## Keyboard / accessibility

- Children text is the name; keep tabs to one or two words.
- `aria-selected` always present inside a row; never add `aria-pressed`.
- Native button focus; keep a visible focus ring from tokens.

## Do / don't

- Do: `<Tab value="billing">Billing</Tab>` inside a valued TabList.
- Don't: reuse a `value` across tabs; duplicates select together and confuse.

## Customization

Selected-tab marker only. Row, type, and spacing come from Cieo tokens.

## Limitations

- Useless outside TabList or TabMenu; standalone tabs carry no tab semantics.
- No disabled state; hide unavailable tabs instead of disabling them.

## Related

TabList (molecule), TabMenu (molecule), SegmentedControlItem (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` customizes the root. `slotProps.root` accepts className, style, title, and data attributes without replacing owned selection, roles, or keyboard behavior. `id` and `controls` connect the tab to its host-owned tabpanel.
