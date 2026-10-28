# Timer

Seconds rendered as zero-padded mm:ss.

## Use when

- Speech time, countdowns, or durations need a compact readout.
- The value is seconds; Timer formats, the host ticks.

## Avoid when

- The instant is a calendar date; use Timestamp instead.
- Sub-second precision matters; mm:ss has none by design.

## Anatomy

Native `time.cieo.cieo-p-timer` with `dateTime={PT{n}S}` and `mm:ss` text. One required `seconds` prop.

## Behavior

No motion and no ticking; Timer formats one value per render. Values floor to whole minutes and seconds.

## Keyboard / accessibility

- Native `time` with an ISO duration tells assistive tech exactly what the digits mean.
- Announce updates via a live region owned by the host; Timer itself is static text.

## Do / don't

- Do: `<Timer seconds={95} />` rendering 01:35 beside a "Remaining" label.
- Don't: expect Timer to count; the host re-renders with new seconds.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- Formatting only; no interval, no start/stop, no tick behavior.
- Whole seconds only; negatives and fractions are out of range.

## Related

Timestamp (atom), Text (atom), Badge (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
