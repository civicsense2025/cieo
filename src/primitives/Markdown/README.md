# Markdown

Renders host-sanitized HTML verbatim.

## Use when

- Rich copy arrives as pre-rendered HTML from a trusted pipeline.
- The host already sanitized the string before passing it in.

## Avoid when

- The HTML is raw user input; sanitize first or do not render it at all.
- Structured content fits typed primitives; prefer Heading, Text, and Code.

## Anatomy

Plain `div.cieo.cieo-p-markdown` with `dangerouslySetInnerHTML={{ __html: html }}`. One required `html` prop.

## Behavior

No motion. Renders the string exactly as given; no parsing, no transforms, no cleanup.

## Keyboard / accessibility

- WARNING: the host sanitizes before passing; this component never sanitizes.
- Output inherits whatever semantics the HTML carries; hostile markup (scripts, event handlers) must be stripped upstream.
- Never pass unsanitized user input; an XSS hole here runs with the page's privileges.

## Do / don't

- Do: sanitize upstream, then `<Markdown html={clean} />`.
- Don't: `<Markdown html={userComment} />` with raw input; that executes attacker markup.

## Customization

Use the typed presentation parts listed under Host customization. Defaults still use Cieo tokens; component behavior and accessibility remain owned by Cieo.

## Limitations

- No sanitizing, no markdown parsing, no sandboxing; the prop is trusted HTML.
- Unbounded content; long documents should paginate before rendering.

## Related

Text (atom), Heading (atom), CodeBlock (atom).

## Evidence

Storybook-free: covered by `test/primitives-lane-content.test.mjs` + docs preview. No device acceptance in this plan.

## Host customization

`className` adds a root class without replacing Cieo’s classes. `slotProps` exposes `root`. Each part accepts `className`, `style`, `title`, and non-reserved `data-*` attributes. Roles, accessible names, values, event handlers, refs, state markers, and dynamic geometry remain component-owned. Existing content props retain their original semantics.
