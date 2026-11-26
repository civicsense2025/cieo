# FilterBuilder

Inline rules that filter a table: a property, an operator and a value on each row, with add and remove.

## Use when

- A table or list needs typed filters that a person edits in place.
- The rules are evaluated by the data grid (`cieo/data-grid`), so the same rules hide the same rows everywhere.

## Avoid when

- A single search box is enough.
- Rules must combine with OR or nest in groups. Every rule here must hold for a row.

## Anatomy

A labeled group holds one list item per rule: a property select, an operator select, a value control that matches the property type, and a Remove button. An add control sits below the rules. With no rules, the empty text shows.

## Behavior

Controlled: `value` is the rule list, and `onChange` receives the next list after an add, a change or a remove. The component keeps no rule state.

A new rule uses the first property and no value. A rule without a value hides no rows, so adding a rule never empties a table. A checkbox rule also starts without an operator: its operator choice shows as empty until the person picks Is checked or Is unchecked, and until then it hides no rows.

Changing a rule's property keeps its operator when the new type offers it, and keeps its value only when the type stays the same.

Operators come from the data grid for each property type. The value control matches the type: text, number, date, or a choice from the property's options. A rule whose property is no longer in the list shows "Unknown property" and hides nothing.

## Motion

Rows arrive with a short settle built from the motion tokens: base duration, spring easing, the 4px drift and arrival opacity. Under reduced motion those tokens are zero, so rows appear at once. Removal is immediate.

## Keyboard / accessibility

- Every control is a native control or a cieo control, so keyboard use follows those controls.
- Adding a rule moves focus to its property control. Removing a rule moves focus to the rule that takes its place, or to the add control when none is left.
- Each control is named for its rule, such as "Filter 2 operator" and "Remove filter 2".
- No control is icon-only. No control uses `aria-disabled`, which would swallow its clicks.

## Do / don't

- Do: `<FilterBuilder properties={schema} value={rules} onChange={setRules} />` with host state, and pass the same rules to `applyView` or `filterRows`.
- Don't: change a property's type under an existing rule without checking the rule still means what it did.

## Customization

Operator text can be replaced with `operatorLabels`. The group label, empty text and add text are props. Colors, spacing and motion come from tokens.

## Limitations

- A relation rule compares the stored row id, not its label. A label picker needs the host's row list and is not part of this primitive.
- Rows are keyed by position, so an open select can move to the next rule when a rule above it is removed.

## Related

Select and Button (the rows use them), Pagination (another molecule that keeps its state in the host).

## Evidence

Covered by `test/primitives-filter-builder.test.mjs` (server markup, names, operators, value controls, manifest and stylesheet contracts) and `test/data-grid-rules.test.mjs` (rule editing). Focus movement and keyboard use are not yet checked in a browser.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Library classes are retained; handlers, roles, and accessibility attributes remain owned by Cieo.
