# ApprovalRequest

Asks a person to approve or deny what an agent wants to do. It is never optimistic.

## Use when

- The host reported `approval.requested` and the agent is waiting on a person.

## Avoid when

- The action is reversible and cheap; let the agent act and show it in AgentActivity.

## Anatomy

`section.cieo.cieo-p-approval-request[aria-labelledby][data-status]` → heading (the title), optional `[data-detail]`, `[data-status-text]`, and while pending `[data-actions]` with Approve and Deny Buttons.

## Behavior

- While `approval.status` is `pending`, the status text says "Waiting for your decision", even when `busy` is set.
- `busy` disables both buttons (`aria-disabled`, so focus stays put) and spins the pressed one.
- The decision text (Approved, Denied, Expired) shows only once the host resolves the approval. Then the buttons go away.

## Keyboard / accessibility

- The section is named by its title. The heading level defaults to 3 (`headingLevel`).
- Buttons stay focusable while busy; presses are ignored.

## Do / don't

- Do: set `busy` while the command is in flight, and clear it when the host answers.
- Don't: change `approval.status` yourself after a click.

## Customization

`approveLabel`, `denyLabel`, `fallbackTitle`, `headingLevel`. `APPROVAL_STATUS_WORDS` is exported.

## Limitations

- Two choices only; no "approve always" or edit-before-approve.
- No countdown for an expiring request.

## Related

Button (`cieo/controls`), AgentStatus, `selectPendingApprovals`.

## Evidence

`test/primitives-agent.test.mjs` (no decision while pending even when busy, both buttons disabled, buttons gone once resolved). No device acceptance yet.
