# RollCall

Everyone by name, grouped (such as by party), each group with a dot, title and count, in columns.

## Use when

- A vote, membership or attendance list shows every person.

## Avoid when

- Only a few people; use PersonRow directly.

## Anatomy

Root `div.cieo-p-roll-call` in CSS columns; one `section` per group.

## Behavior

`rollColumns` clamps to 1–4; empty groups are omitted.

## Keyboard / accessibility

- Group headings are real h3s with a count.

## Do / don't

- Do: `<RollCall groups={[{ id: 'r', title: 'Republicans', color: 'var(--party-r)', members }]} />`
- Don't: Don't colour names; the ring and heading carry the group.

## Apple twin

`CieoUI.RollCall` with the same name and rules; see docs/apple-components.md.
