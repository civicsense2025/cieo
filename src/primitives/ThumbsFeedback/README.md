# ThumbsFeedback

A "Was this helpful?" prompt that can open a short detail step with reasons and a comment, then thanks the person.

## Use when

- Collecting quick feedback on an answer, article or result.
- You want one tap first and detail only if the person offers it.

## Avoid when

- A full survey or rating scale.
- Feedback must be required.

## Anatomy

A question with two thumb buttons; a detail step with the thumbs, reason chips, an optional comment, Submit and Skip; and a thank-you line. `thumbsStep(state, event)` is the pure step machine.

## Behavior

- Pressing a thumb calls `onRate`. With reasons configured for that thumb it opens the detail step; otherwise it finishes and calls `onSubmit` straight away.
- In detail, changing the thumb keeps the step and clears chosen reasons. Submit sends reasons and comment; Skip sends only the thumb. Both end in the thank-you.
- The panel height springs between steps; the old content leaves in 100ms before the new content enters.

## Keyboard / accessibility

- Thumbs and reason chips are buttons with `aria-pressed`; the comment has a visible label.
- Focus moves to the first reason chip when detail opens and to the thank-you text when done, which is announced as a status.

## Do / don't

- Do: keep the comment optional.
- Don't: ask for reasons before the thumb.

## Customization

Pass `question`, `reasons`, `thanks`.

## Limitations

- Ends after one submission; remount (or change its key) to ask again.
- Does not send anything; the host owns delivery.

## Related

Poll, ReactionPicker.

## Evidence

`test/primitives-engagement-reactions.test.mjs`.
