# Timestamp

Machine-readable time with human-readable children.

## Use when

- A date or time appears in prose ("Updated 2h ago", "March 4, 2026").
- Machines need the exact instant via `dateTime` while readers get friendly words.

## Avoid when

- The value is a duration in seconds; use Timer instead.
- No exact instant exists ("soon", "recently"); plain Text is honest then.

## Anatomy

Native `time.cieo.cieo-p-timestamp` with required `dateTime` and human-readable children.

## Behavior

No motion. Renders children verbatim; `dateTime` carries the ISO instant for machines.

## Keyboard / accessibility

- Native `time` pairs the friendly words with the exact instant for assistive tech.
- Keep children truthful to `dateTime`; mismatched pairs mislead everyone.

## Do / don't

- Do: `<Timestamp dateTime="2026-03-04">March 4, 2026</Timestamp>`.
- Don't: `<Timestamp dateTime="…">recently</Timestamp>`; vague words defeat the machine date.

## Customization

None per instance. Small muted styling comes from Cieo tokens.

## Limitations

- Display only; no relative-time ("2h ago") computation ships here.
- One instant per Timestamp; ranges need two.

## Related

Timer (atom), Text (atom), Badge (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.
