# Popover

A nonmodal, named panel anchored to a native button or link. Escape and outside press dismiss it; Escape restores trigger focus. The trigger's own click handler runs first and can prevent opening.

## Slots and props

`trigger` supplies one interactive element; `children` supplies content. Optional `slots.header`, `slots.content`, and `slots.footer` compose the panel. `slots.content` replaces `children` when supplied.

`slotProps.root`, `slotProps.trigger` (the wrapper), and `slotProps.content` accept `className`, `style`, `title`, and data attributes. `className` and `style` also customize the root. Slots cannot replace owned IDs, roles, focus refs, expanded state, or dismissal behavior. Pass trigger behavior and accessible naming directly to the trigger element.

`open` / `onOpenChange` control state; `defaultOpen` initializes uncontrolled state. `label` names the dialog; a plain-text trigger label is the fallback. Supply `label` for icon or composed triggers.

`side` chooses top, bottom, left, or right (default bottom); `align` chooses logical start, center, or end (default start). `offset` defaults to 8 CSS px; `collisionPadding` defaults to 12. The panel flips when the opposite side has more room and clamps to the visible viewport. Oversized content remains reachable through bounded overflow. Resize, scrolling, and visual viewport changes update positioning.

`portal` defaults to true to escape clipping and transformed ancestors. Set false only when the host guarantees an unclipped fixed-position containing block; host theme tokens must reach the panel either way.

`motion={false}` disables enter/exit animation. Otherwise the shared Cieo presence spring animates scale, opacity, and drift; reduced motion settles immediately. Exiting content is inert and hidden from assistive technology.

## Styling

Import `cieo/popover.css` or the full primitive stylesheet. Supported tokens: `--cieo-popover-border`, `--cieo-popover-radius`, `--cieo-popover-background`, `--cieo-popover-color`, `--cieo-popover-padding`, `--cieo-popover-shadow`, and `--cieo-popover-z`. Host classes applied through slots can set width, typography, spacing, and paint. Position and viewport limits remain library-owned.

## Limits and verification

This is not a modal or an ARIA menu. Content follows normal Tab navigation; use a dialog for modal focus containment. Detached or offscreen anchors are clamped, not automatically dismissed. Position tests cover edge flips, RTL alignment, oversized content, and visual viewport offsets. Consumer browser checks must cover focus, rapid reopening, clipping ancestors, and motion preferences.
