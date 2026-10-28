# ByLine

One line of author, badge, context crumb and age. The author name truncates first; the time never does.

## Use when

- A comment, post or message header.
- Any list row that needs who, where and when in one line.

## Avoid when

- The header needs several lines or actions; compose your own.

## Anatomy

A `span` holding the author (link or text), optional badge, optional `@handle`, a `›` separator and context crumb, and a `·` separator and `time` element.

## Behavior

- Flex line with no wrapping: author and context shrink with an ellipsis, badge, separators and time never shrink.
- `safeHref` allows http(s) and relative links only; `javascript:`, `data:`, protocol-relative and other schemes render as plain text.
- Separators are `aria-hidden`; screen readers hear author, badge, context, then the time text.

## Keyboard / accessibility

Links are real anchors with a visible focus ring. Give the badge its own accessible name (for example "Verified").

## Do / don't

- Do: keep the context crumb short.
- Do not: put actions inside the line.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- No built-in relative-time formatting; the host supplies the text.

## Related

Comment, Avatar, Badge.

## Evidence

`test/primitives-comments.test.mjs`.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`, `badge`, `handle`, `separator`, `time`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
