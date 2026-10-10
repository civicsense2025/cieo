# MoreMenu

IconButton-triggered dropdown menu for overflow actions on a card or row.

## Use when

- A card, row, or toolbar corner needs 2–8 secondary actions behind one "more" trigger.
- The trigger must stay icon-only while the menu keeps a spoken name.

## Avoid when

- The actions are primary; surface them as Buttons instead of hiding them.
- There is only one action; an IconButton that runs it directly is faster.

## Anatomy

Thin wrapper over DropdownMenu: an IconButton (`⋯`, named by `label`) as trigger, host menu content as children. Style-free; DropdownMenu owns the panel visuals.

## Behavior

No motion, no own state. `label` defaults to 'More actions' and names both trigger and menu. Open state, Escape, and outside-click follow DropdownMenu: host-owned.

## Keyboard / accessibility

- Trigger carries the IconButton name (`aria-label`); keep the default unless the context demands better ("Message actions").
- Menu panel carries the same name; items use `menuitem` roles from their own components.
- Host must close on Escape and return focus to the trigger.

## Do / don't

- Do: `<MoreMenu label="Message actions">` with rename/pin/delete rows.
- Don't: restyle the trigger per instance; the ellipsis button is the pattern.

## Customization

None. Trigger and panel visuals belong to IconButton and DropdownMenu; this wrapper adds no CSS file.

## Limitations

- Max 16 menu children. No open-state props; controlled menus need DropdownMenu directly.
- The trigger glyph is fixed (`⋯`); custom icons need DropdownMenu + IconButton composed by hand.

## Related

DropdownMenu (molecule), IconButton (primitive), DropdownMenuItem (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-menus.test.mjs` + docs preview. No device acceptance in this plan.
