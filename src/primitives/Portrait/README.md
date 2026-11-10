# Portrait

A face in a circle with a ring that carries meaning, such as party; grayscale keeps the ring in colour.

## Use when

- A person appears beside their name.

## Avoid when

- The image is the content (use Thumbnail) or the person has no name beside it.

## Anatomy

Root `span.cieo-p-portrait`, `aria-hidden`; the photo is a background image.

## Behavior

Grayscale uses `background-blend-mode: luminosity`, not a filter, so the ring is never greyed.

## Keyboard / accessibility

- Always pair with the visible name.

## Do / don't

- Do: `<Portrait src={photo} ring="var(--party-r)" grayscale />`
- Don't: Don't show initials on grey for a missing photo.

## Apple twin

`CieoUI.Portrait` with the same name and rules; see docs/apple-components.md.
