# Section

Page subdivision with an optional title heading (settings groups, article chapters).

## Use when

- A page needs named subdivisions with their own heading and spacing.
- The subdivision has no form or landmark semantics of its own beyond grouping.

## Avoid when

- The region is the app frame; use Layout with header, content, and footer instead.
- The group is a set of related buttons; that is a ButtonGroup, not a section.

## Anatomy

Root `section.cieo.cieo-section` with optional `aria-label`; optional `title` renders an `h2.cieo-section-title`. Host content as children.

## Behavior

No motion. Title renders only when provided; otherwise the section is grouped by spacing alone. Section never steals focus.

## Keyboard / accessibility

- Root carries the region name (`aria-label`, optional). Prefer a visible `title` over a silent label.
- Do not repeat the title text inside children headings; keep one heading per section.
- A labelled section becomes a landmark; unlabelled sections stay plain groups.

## Do / don't

- Do: `<Section title="Notifications">` with the notification controls inside.
- Don't: nest sections three deep to fake card padding; one level per topic.

## Customization

Title and label only. Spacing and type come from Cieo tokens; do not restyle the title per instance.

## Limitations

- One title heading only. Complex headers (actions, meta) belong to the host.
- No landmark semantics beyond the labelled region; dialogs and navigation need their own primitives.

## Related

Layout (molecule), Center (atom), Divider (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-layout.test.mjs` + docs preview. No device acceptance in this plan.
