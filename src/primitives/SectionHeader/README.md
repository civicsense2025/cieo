# SectionHeader

A section title with an optional trailing action or quiet count.

## Use when

- A section has a title and maybe a "See all" link or a count.

## Avoid when

- The page title; use Heading level 1.

## Anatomy

Root `div.cieo-p-section-header` with a heading and an action part.

## Behavior

Wraps the action under the title when narrow.

## Keyboard / accessibility

- Real heading element at `level`.

## Do / don't

- Do: `<SectionHeader title="This week" action={<a href="/news">See all</a>} />`
- Don't: Don't put more than one action.

## Apple twin

`CieoUI.SectionHeader` with the same name and rules; see docs/apple-components.md.
