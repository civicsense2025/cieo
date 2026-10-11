# Step

Custom step item for hand-built steppers.

## Use when

- One step needs custom content the Stepper array cannot express.
- The host builds its own `<ol>` and orders steps itself.

## Avoid when

- Plain labels suffice; use Stepper with a steps array instead.
- The step stands alone; steps belong to a stepper list.

## Anatomy

`<li data-state>`; `current` renders `aria-current="step"`. Host provides the `<ol>`.

## Behavior

No motion. `state` defaults to todo. The item never advances itself.

## Keyboard / accessibility

- Current state announces via `aria-current`; done and todo are plain text.
- Keep step content short; the list position carries the meaning.

## Do / don't

- Do: `<Step state="current">Payment</Step>` inside a host `<ol>`.
- Don't: render Step outside a list; orphan list items break semantics.

## Customization

`state` only. Markers and type come from Cieo tokens.

## Limitations

- No built-in marker visuals beyond `data-state`; CSS owns the dots.
- Host must keep exactly one current step per list.

## Related

Stepper (molecule), Pagination (molecule), ListItem (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-nav.test.mjs` + docs preview. No device acceptance in this plan.
