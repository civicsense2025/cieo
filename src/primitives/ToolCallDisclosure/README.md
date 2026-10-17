# ToolCallDisclosure

One tool call as a native disclosure: its name and phase, then its summary and error.

## Use when

- A lane lists the tools an agent called (`selectToolCalls` in `cieo/agent`).

## Avoid when

- The call needs a decision from a person; use ApprovalRequest.

## Anatomy

`details.cieo.cieo-p-tool-call-disclosure[data-phase]` → `summary` (decorative StatusDot, `[data-name]`, `[data-phase-text]`) and `[data-body]` (`[data-summary]`, `[data-error]` when failed, then children).

## Behavior

Native open and close, no motion. Phase words: Running, Done, Failed. The error shows only when the phase is `failed`.

## Keyboard / accessibility

- The summary is a native toggle: Enter and Space open and close it.
- The phase is in the summary's text, so it is announced with the name.

## Do / don't

- Do: pass arguments or a result preview as children.
- Don't: render raw HTML from tool output inside it.

## Customization

Body content via children. Colours from tokens. `TOOL_PHASE_WORDS` is exported.

## Limitations

- Starts closed; it does not open itself on failure.
- No timing or duration display.

## Related

AgentActivity, Collapsible, `cieo/agent`.

## Evidence

`test/primitives-agent.test.mjs` (phase words, error only when failed). No device acceptance yet.
