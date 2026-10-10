# Skeleton

Pulse-line loading placeholder with a label.

## Use when

- Content is loading and the layout shape is known (rows, cards, paragraphs).
- The placeholder holds space so arrival does not shift the page.

## Avoid when

- Content is empty, not loading; use EmptyState instead.
- Loading finishes instantly; flashing skeleton-then-content is worse than a beat of nothing.

## Anatomy

Root `span.cieo.cieo-p-skeleton` with an `aria-hidden` stack of `lines` pulse bars plus a visually-hidden label for readers.

## Behavior

Bars pulse via keyframes; `prefers-reduced-motion` stops the pulse and holds a static bar. Lines default to 3, range 1–12.

## Keyboard / accessibility

- Bars are `aria-hidden`; only the label (default "Loading") reaches assistive tech.
- Never put information in the bars; they are shape only, announced as loading.

## Do / don't

- Do: `<Skeleton lines={3} />` holding a three-line paragraph while it loads.
- Don't: announce line counts or shapes; readers hear the label, nothing else.

## Customization

Line count and label only. Bar fill, radius, and pulse come from Cieo tokens; motion stops under reduced motion.

## Limitations

- Placeholder only; it never fetches, resolves, or times out.
- Twelve lines max; longer waits need progress copy, not more bars.

## Related

EmptyState (molecule), Spinner (atom), Text (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.
