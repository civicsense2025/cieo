# Spinner

Loading indicator for pending states, always paired with an accessible label.

## Use when

- A section, row, or action is pending and needs a labelled "working" state.
- The label names what is loading (e.g. `label="Saving draft"`).

## Avoid when

- The spinner would sit bare without context; never render without a label or adjacent status text.
- Progress is determinate; use ProgressBar with `value` and `max` instead.

## Anatomy

Root `span.cieo.cieo-p-spinner` with `role="status"` and `aria-label`; inner ring `span.cieo-p-spinner-ring` is `aria-hidden`. Size via `data-size`.

## Behavior

CSS rotation only (`cieo-spin`, `var(--motion-duration-lazy, 740ms)` linear infinite). Size defaults to `md`; `sm` shrinks the ring. The ring rests (no animation, dimmed) under `prefers-reduced-motion`.

## Motion

Rotation period is token-driven (`--motion-duration-lazy`, ~740ms). Pass `motion={false}` to set `data-motion="off"`, which kills the animation via the shared motion contract (`design/styles/primitives/motion.css`). Reduced-motion rest still applies.

## Keyboard / accessibility

- Root carries `role="status"` with `aria-label` (default `"Loading"`). Do not repeat the label on the ring.
- Decorative ring is `aria-hidden="true"`; screen readers announce the status once.

## Do / don't

- Do: `<Spinner label="Loading results" />` beside the pending list.
- Don't: `<Spinner label="" />` or a bare ring with no context; the status must be named.

## Customization

Label and size (`sm|md`) only. Ring colors, width, and timing come from Cieo tokens; do not restyle per instance.

## Limitations

- Indeterminate only; no `value` prop. Determinate progress is ProgressBar.
- Exactly one motion (rotation); no other animation may be added here.

## Related

ProgressBar (atom), Button (atom), AvatarGroup (molecule).

## Evidence

Storybook-free: covered by `test/primitives-feedback.test.mjs` + docs preview. No device acceptance in this plan.
