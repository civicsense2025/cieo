# DropZone

File drop target with an explicit Choose button. The button calls `input.click()` on a visually hidden native input; nothing relies on implicit label activation.

## Use when

- The flow starts by importing files (image tools, batch queues, Diana fixtures).
- Drag-over and error states must be visible in both themes.

## Avoid when

- The form needs one labelled upload with no drag handling; use FileInput.
- The host already owns a custom picker; this component owns the zone and the button together.

## Anatomy

`role="region"` named by `label`: optional illustration/promise children, a pill primary `Button` (`chooseLabel`), a visually hidden native `<input type="file">` (removed from tab order; the button is the operable control), a hint line, and an error line. `data-dragover` and `data-error` drive the zone paint.

## Behavior

`dragenter`/`dragover`/`drop` are handled on the zone with a depth counter, so nested children don't flicker the state; only `Files` drags are accepted and `dropEffect` is `copy`. The input value resets after every pick so the same file can be chosen twice. Drop-over tint is a token transition, instant under reduced motion.

## Keyboard / accessibility

- One tab stop: the Choose button. The hidden input is `tabIndex={-1}` and `aria-hidden`; never activate it through a wrapping label.
- Error renders once in `role="alert"`.
- Prevent the browser from navigating to a dropped file at the page level in the host (a `dragover`/`drop` guard outside the zone).

## Do / don't

- Do: `<DropZone label="Source image" chooseLabel="Choose image" hint="PNG or JPEG · 25 MB max" onFiles={load} />`.
- Don't: wrap the zone in a `<label>` or restyle the input per instance.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- No upload progress or file list; pair with host UI for queues.
- Paste-to-import stays host-owned (a page-level paste listener).

## Related

FileInput (atom, labelled picker with no drag handling), Button (controls, the Choose affordance), Banner (molecule, persistent error surface).

## Evidence

Covered by `test/forma-gaps.test.mjs` (button-click activation, drag-over state, error alert). No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `button`, `input`, `hint`, `error`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, drag handling, and state markers remain component-owned. Existing content props retain their original semantics.
