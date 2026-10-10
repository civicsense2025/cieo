# Carousel

Scroll-snap row of cards with previous and next buttons (featured guides, related articles).

## Use when

- 4–12 peer cards overflow one row and swipe plus buttons both fit the task.
- Every item is already reachable by scroll; buttons are a convenience, not the only path.

## Avoid when

- Items number under 4; lay them out in a plain row instead.
- Order matters critically; hidden overflow buries late items on small screens.

## Anatomy

Region with `aria-label` and a scroll-snap track, flanked by Previous/Next native buttons scrolling one page.

## Behavior

No motion. Buttons scroll the track by its own `clientWidth`; the track never loops or autoplays.

## Motion

Paging rides the scroll spring. `motion={false}` uses native instant paging; reduced motion jumps.

## Keyboard / accessibility

- Region carries the carousel name (`label`, required); items keep native focus and order.
- Buttons are real `<button>` elements with labels; keyboard readers can also scroll the track directly.

## Do / don't

- Do: `<Carousel label="Featured guides">` with ClickableCard children.
- Don't: autoplay or loop; unexpected movement strands keyboard and screen-reader users.

## Customization

None per instance. Snap alignment, gap, and button placement come from Cieo tokens and CSS.

## Limitations

- Max 32 children; larger sets need search or paging, not a strip.
- No dots or slide announcements; position comes from native scroll.

## Related

ClickableCard (organism), Card (organism), ChatMessageList (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.
