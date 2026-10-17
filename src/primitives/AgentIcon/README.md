# AgentIcon

One agent action or state icon at rest, drawn in `currentColor`.

## Use when

- A row or lane needs a compact picture of what an agent is doing, beside words that say it.

## Avoid when

- You need the animated loops; use the agent icon atom in `atoms/web/identity`.
- The icon would be the only cue; add visible text or a `label`.

## Anatomy

`svg.cieo.cieo-p-agent-icon[data-icon][data-tone]` (64-unit viewBox) → the agent's square outline and a stroked glyph group.

## Behavior

Static. `size` picks one of three glyph details (20px and below, up to 24px, larger) and a stroke weight that stays about 1.55px. Status icons (failed, done, blocked and others) take their tone colour from tokens.

## Keyboard / accessibility

- Decorative (`aria-hidden`) unless `label` is set; then `role="img"` with that name.

## Do / don't

- Do: `<AgentIcon icon="browsing" /> Browsing`.
- Don't: use an icon's colour as the only signal of failure.

## Customization

`size`, `label`, `outline`. Raw data, lookups and stroke helpers are in `cieo/agent-icons`.

## Limitations

- Product form only. The brand form (paper tile and wash) stays in the atom.
- An unknown id renders nothing.

## Related

AgentStatus, Icon, `cieo/agent-icons`.

## Evidence

`test/primitives-agent.test.mjs` (every icon renders, labelled and decorative forms, no globals in the data module). No device acceptance yet.
