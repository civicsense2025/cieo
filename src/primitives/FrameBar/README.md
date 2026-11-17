# FrameBar

The edge of a frame: a leading piece and a trailing piece, such as a topic chip and a page count.

## Use when

- A frame needs a topic and count on top, or a wordmark and source at the bottom.

## Avoid when

- The bar holds actions; use Toolbar.

## Anatomy

Root `div.cieo-p-frame-bar` with leading and trailing parts.

## Behavior

Wraps the trailing piece under the leading one when narrow.

## Keyboard / accessibility

- Plain content; the parts keep their own semantics.

## Do / don't

- Do: `<FrameBar leading={<TopicChip>Permitting</TopicChip>} trailing={<ReferenceText>1/18</ReferenceText>} />`
- Don't: Don't put the headline in a FrameBar.

## Apple twin

`CieoUI.FrameBar` with the same name and rules; see docs/apple-components.md.
