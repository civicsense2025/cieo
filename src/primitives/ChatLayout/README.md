# ChatLayout

Two panes pairing a transcript with an optional artifact rail (chat beside a cited document).

## Use when

- The conversation references an artifact the reader keeps visible.
- Wide screens can show both; narrow screens fall back to transcript only.

## Avoid when

- There is no artifact; render the transcript without a layout shell.
- Panes need equal weight; the transcript is always the primary pane here.

## Anatomy

Grid with a transcript pane (default slot) and an optional rail pane (rail slot, max 1).

## Behavior

No motion. The rail renders only when supplied; below the narrow breakpoint it collapses to transcript only.

## Keyboard / accessibility

- Presentational layout; it adds no roles and takes no focus.
- Keep document order transcript-first so screen readers meet the conversation before the artifact.

## Do / don't

- Do: `<ChatLayout rail={<DocPanel />}>` with list plus composer as children.
- Don't: put the artifact first in narrow order; the transcript stays primary.

## Customization

None per instance. Columns, gap, and the collapse breakpoint come from Cieo tokens and CSS.

## Limitations

- One rail at most; two artifacts need a host tab or stack beside the transcript.
- No resizable split; pane widths are fixed by the stylesheet.

## Related

ChatMessageList (organism), ChatComposer (molecule), Card (organism).

## Evidence

Storybook-free: covered by `test/primitives-lane-stage.test.mjs` + docs preview. No device acceptance in this plan.
