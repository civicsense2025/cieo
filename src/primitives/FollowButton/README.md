# FollowButton

A filled Follow button that becomes an outlined Following; hovering or focusing it previews Unfollow.

## Use when

- Profiles, post headers, suggestion lists.

## Avoid when

- Following is not a yes or no state; use a menu.

## Anatomy

A `button` with a swapping label and a hidden copy of the label used to measure width.

## Behavior

- `followLabel(following, previewing)` picks Follow, Following or Unfollow.
- The width springs to fit the new label.
- The Unfollow preview uses the danger tone. It does not show right after a press, only on a fresh hover or focus.
- Accessible name is Follow or Following plus the name ("Following Ava").

## Keyboard / accessibility

A real button with `aria-pressed`. Reduced motion changes the label and width instantly.

## Do / don't

- Do: pass `name`.
- Don't: toggle optimistic state without a way back.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- The accessible name always matches the visible text ("Follow Ava", "Following Ava", "Unfollow Ava" while previewing), so speech-input users can say what they see. There is no `aria-pressed`: the name already states the relationship, and "Unfollow Ava, pressed" would contradict itself.

## Related

NotifyToggle, CountButton.

## Evidence

`test/primitives-engagement-actions.test.mjs`.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
