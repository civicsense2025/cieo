# Calendar

Month grid for picking one ISO date, with pressed-state days and no grid roles (departure picker, report month).

## Use when

- The user picks one visible calendar day from a month view.
- Selection can stay a plain ISO string (`selected`, `onSelect`).

## Avoid when

- A text date entry suffices; use DateInput instead of a full month grid.
- You need range or multi-day selection; that is a DateRangeInput or host-owned state, not this Calendar.

## Anatomy

Root `role="group"` named `${year}-${month}`: weekday header spans, lead blanks, then one `<button type="button">` per day with `aria-pressed` on the selected day. Seven-column grid from tokens.

## Behavior

No motion. Days derive from `year`/`month` (1-12); clicking a day calls `onSelect` with its ISO date. No internal state; the host owns `selected`.

## Keyboard / accessibility

- Deliberately no `grid` roles: days are plain buttons in tab order, so every keyboard and screen reader gets the same flat list.
- Selected day uses `aria-pressed="true"`; each day button carries its ISO date as its accessible name.

## Do / don't

- Do: `<Calendar year={2026} month={10} selected={day} onSelect={setDay} />`.
- Don't: add grid/row/gridcell roles or roving tabindex; the flat button list is the contract.

## Customization

Props only (`year`, `month`, `selected`, `onSelect`). Gap, day radius, and selected tone come from Cieo tokens.

## Limitations

- One month at a time, one selected day. Month navigation lives in the host.
- `month` outside 1-12 renders the platform's rolled-over month; validate before passing.

## Related

DateInput (atom, for text date entry), DateRangeInput (molecule, for start/end pairs), FieldStatus (atom, for the help/error line under the calendar).

## Evidence

Storybook-free: covered by `test/primitives-lane-form.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `weekday`, `blank`, `day`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.
