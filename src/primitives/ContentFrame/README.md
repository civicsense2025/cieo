# ContentFrame

One idea on one ground: a top bar, the content centred, a bottom bar; left-aligned.

## Use when

- A social post, slide or page band carries one idea.

## Avoid when

- The content is a long article; use Section.

## Anatomy

Root `section.cieo-p-content-frame` with top, body and bottom parts.

## Behavior

On `block`, text and muted switch to the block's partners via `--cieo-on-block`.

## Keyboard / accessibility

- Section semantics; give it an `aria-label` when it stands alone.

## Do / don't

- Do: `<ContentFrame top={<FrameBar …/>} bottom={<FrameBar edge="bottom" …/>}>…</ContentFrame>`
- Don't: Don't put two ideas in one frame.

## Apple twin

`CieoUI.ContentFrame` with the same name and rules; see docs/apple-components.md.
