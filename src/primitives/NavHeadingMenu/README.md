# NavHeadingMenu

Heading plus its menu group; visible title with landmark.

## Use when

- A footer or drawer block needs a visible heading over its links.
- Heading text and landmark name must match.

## Avoid when

- The heading links somewhere; headings are text, not links.
- A plain group suffices; use TopNavMenu or SideNavSection instead.

## Anatomy

`<section aria-label>` with a visible `<h2>{label}</h2>`; host links follow.

## Behavior

No motion. `label` is required and renders twice (heading + name) by design.

## Keyboard / accessibility

- Section landmark plus heading gives two ways to find the block.
- Do not skip heading levels to reach this `<h2>`; keep page order sane.

## Do / don't

- Do: `<NavHeadingMenu label="Company">` with About, Careers, Press links.
- Don't: nest heading menus; flat blocks scan better.

## Customization

Label only. Stacking and type come from Cieo tokens.

## Limitations

- Max 16 children. More links mean the block needs splitting.
- One heading per block; sub-heads need their own blocks.

## Related

TopNavMenu (molecule), SideNavSection (molecule), SideNavHeading (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` appends a root class. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Existing content props and children remain the composition slots. Library classes are retained; computed inline geometry, state attributes, handlers, refs, roles, and accessibility attributes remain owned by Cieo.
