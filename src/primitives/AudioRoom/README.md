# AudioRoom

The shell of a live audio room: title and listener count, a stage of speakers that glide into place, and the controls for the person using it. The host owns the audio connection.

## Use when

- Live audio rooms and listening parties.
- Any stage and audience layout.

## Avoid when

- Video calls; there are no video tiles.
- Large audiences on stage; list listeners in a separate roster.

## Anatomy

A region named by the title, with a header (title, listener faces, count), a stage list of SpeakerTiles, and a control bar: mute, raise hand, reactions slot, Leave.

## Behavior

- The stage slides people into place when speakers join, leave or reorder (FLIP, keyed by speaker ids).
- Mute shows only when `self.canSpeak`. Mute and raise hand are toggle buttons.
- The listener count uses CompactCount and reads the exact number aloud.
- Reduced motion skips the slide.

## Keyboard / accessibility

A `section` labelled by its heading. Mute and raise hand use `aria-pressed` with constant labels. The stage is a list named "Speakers".

## Do / don't

- Do: keep speaker ids stable.
- Don't: put per-frame levels in a context that re-renders the whole room unnecessarily; tiles smooth levels themselves.

## Customization

Place reaction controls in `reactions` and faces in `listeners`.

## Limitations

- No hand-raise queue or moderation controls.

## Related

SpeakerTile, CompactCount, AvatarGroup, ReactionPicker.

## Evidence

`test/primitives-audio-capture.test.mjs`.

## Host customization

`className` adds a class to the root without replacing the Cieo class. `slotProps` accepts named presentation parts: `root`, `header`, `title`, `listeners`, `count`, `stage`, `speaker`, `controls`, `control`, `reactions`. Each part accepts `className`, `style`, `title`, and nonreserved `data-*` attributes. Roles, ARIA, refs, handlers, state attributes, and owned geometry remain component-owned. Existing content props and children remain the content slots.
