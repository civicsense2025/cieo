# ComplexSelector

Label plus a native select grouped into optgroups.

## Use when

- Options split into named sections (chambers, parties, regions).
- Native select semantics must survive with grouping.

## Avoid when

- Sections are flat; use Selector instead.
- Sections need custom rich rows; native optgroups are text-only.

## Anatomy

`<label>` plus `<select class="cieo-input">`; `sections` render as `<optgroup>` plus `<option>`. No new CSS.

## Behavior

No motion. Uncontrolled native select; the host reads it via form data or a ref.

## Keyboard / accessibility

- `label` is required and bound via `htmlFor`; group labels announce during native travel.
- Keep section labels short; they repeat on every pass.

## Do / don't

- Do: pass sections with stable values the server already understands.
- Don't: restyle the select; `.cieo-input` is the shared paint.

## Customization

None here. Input paint belongs to the design system.

## Limitations

- No controlled value prop; control it from the host with form state if needed.
- Optgroups cannot nest or carry icons.

## Related

Selector (atom), SelectorOption (atom), CommandPaletteGroup (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-command.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`, `input`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.
