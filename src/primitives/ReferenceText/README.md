# ReferenceText

A reference read as data: a section number or a page count, in the mono reference style.

## Use when

- A section number (§1302) or a page count (4/18).

## Avoid when

- The text is a label or heading; use TopicChip or Heading.

## Anatomy

Root `span.cieo-p-reference-text`.

## Behavior

`pageBounds(page, total)` clamps a page count so it never shows page 0 or a page past the total.

## Keyboard / accessibility

- Pass `spoken` for counts so "4/18" reads "Page 4 of 18".

## Do / don't

- Do: `<ReferenceText spoken="Page 4 of 18">4/18</ReferenceText>`
- Don't: Don't set it in uppercase.

## Apple twin

`CieoUI.ReferenceText` with the same name and rules; see docs/apple-components.md.
