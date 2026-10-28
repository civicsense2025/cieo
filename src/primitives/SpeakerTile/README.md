# SpeakerTile

One person in a live audio room: avatar, name, a ring that swells with their voice, and muted and raised-hand badges.

## Use when

- Stages and rosters in live audio rooms.
- Any "who is talking" display fed by a level.

## Avoid when

- Chat lists with no live audio; use Avatar.

## Anatomy

Avatar slot with a speaking ring, up to two badges, and a name. A visually hidden sentence names the person and state.

## Behavior

- `speakingStep(prev, level)` has hysteresis: on above 0.12, off below 0.06, so the ring does not flicker.
- The ring scale and opacity follow `level` on a spring, written to CSS variables through a ref.
- Muted keeps the ring still and shows a microphone-off badge. A raised hand pops in with a short scale-and-fade.

## Keyboard / accessibility

Spoken text is built by `speakerLabel`: "Ava, host, speaking" or "Ben, muted, hand raised". The visible name and visuals are hidden from assistive tech so nothing is read twice.

## Do / don't

- Do: pass the same avatar you use elsewhere.
- Don't: announce the speaking state live; it changes constantly.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- The avatar node is not resized by the tile.

## Related

AudioRoom, Avatar, AudioLevelMeter.

## Evidence

`test/primitives-audio-capture.test.mjs`.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `face`, `ring`, `avatar`, `badge`, `name`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
