# Card

Section card grouping one topic with an optional title (a billing summary, a profile block).

## Use when

- One topic needs a visible boundary on a busy page.
- The group deserves a heading in the document outline.

## Avoid when

- The page holds a single topic; the page itself is the boundary.
- Cards would nest three deep; flatten the content instead.

## Anatomy

`section` root with an optional `h2` title, then host body as children.

## Behavior

No motion. Static container; expansion or dismissal belongs to the host.

## Keyboard / accessibility

- Section plus heading names the group to assistive tech; omit the title only when surrounding context names it.
- Never skip heading levels to reach the card title; keep the outline honest.

## Do / don't

- Do: `<Card title="Billing summary">` with one focused body.
- Don't: wrap a whole page in one card; the boundary stops meaning anything.

## Customization

Title only. Surface, border, radius, and padding come from Cieo tokens.

## Limitations

- Max 8 children. More means the card holds two topics; split it.
- No click or select behavior; use ClickableCard or SelectableCard instead.

## Related

ClickableCard (organism), SelectableCard (organism), ChatLayout (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.
