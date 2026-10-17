// src/primitives/ApprovalRequest/ApprovalRequest.tsx
'use client';
/* ApprovalRequest. Asks a person to approve or deny what an agent wants to do. It is never optimistic: while the
   host says pending, the text says it is waiting even after a click; the decision shows only once the host reports
   it. A busy request disables both buttons and spins the one that was pressed. */
import { useId } from 'react';
import type { ApprovalStatus, ApprovalView } from '../../agent/reduce.js';
import { Button } from '../../controls/Button.js';

/** Status text for each approval state. */
export const APPROVAL_STATUS_WORDS: Readonly<Record<ApprovalStatus, string>> = {
  pending: 'Waiting for your decision',
  approved: 'Approved',
  denied: 'Denied',
  expired: 'Expired',
};

export interface ApprovalRequestProps {
  /** The approval as the host reported it. */
  approval: ApprovalView;
  /** Sends the approve command to the host. The view changes only when the host resolves it. */
  onApprove?: () => void;
  /** Sends the deny command to the host. */
  onDeny?: () => void;
  /** Which command is in flight, or null. While set, both buttons are disabled. */
  busy?: 'approve' | 'deny' | null;
  /** Approve button text. Defaults to "Approve". */
  approveLabel?: string;
  /** Deny button text. Defaults to "Deny". */
  denyLabel?: string;
  /** Title shown when the approval has none. Defaults to "Approval needed". */
  fallbackTitle?: string;
  /** Heading level for the title, 2 to 6. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export function ApprovalRequest({
  approval,
  onApprove,
  onDeny,
  busy = null,
  approveLabel = 'Approve',
  denyLabel = 'Deny',
  fallbackTitle = 'Approval needed',
  headingLevel = 3,
}: ApprovalRequestProps) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as 'h3';
  const pending = approval.status === 'pending';
  const locked = busy !== null;
  return (
    <section className="cieo cieo-p-approval-request" aria-labelledby={titleId} data-status={approval.status} aria-busy={pending && locked ? true : undefined}>
      <Heading id={titleId}>{approval.title ?? fallbackTitle}</Heading>
      {approval.detail ? <p data-detail>{approval.detail}</p> : null}
      <p data-status-text>{APPROVAL_STATUS_WORDS[approval.status]}</p>
      {pending ? (
        <div data-actions>
          <Button variant="primary" state={busy === 'approve' ? 'pending' : 'idle'} pendingLabel={`${approveLabel}: sending`} aria-disabled={locked || undefined} onClick={onApprove}>
            {approveLabel}
          </Button>
          <Button variant="secondary" state={busy === 'deny' ? 'pending' : 'idle'} pendingLabel={`${denyLabel}: sending`} aria-disabled={locked || undefined} onClick={onDeny}>
            {denyLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
