// src/primitives/ApprovalRequest/ApprovalRequest.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* ApprovalRequest. Asks a person to approve or deny what an agent wants to do. It is never optimistic: while the
   host says pending, the text says it is waiting even after a click; the decision shows only once the host reports
   it. A busy request disables both buttons and spins the one that was pressed. */
import { useId } from 'react';
import { Button } from '../../controls/Button.js';
/** Status text for each approval state. */
export const APPROVAL_STATUS_WORDS = {
    pending: 'Waiting for your decision',
    approved: 'Approved',
    denied: 'Denied',
    expired: 'Expired',
};
export function ApprovalRequest({ approval, onApprove, onDeny, busy = null, approveLabel = 'Approve', denyLabel = 'Deny', fallbackTitle = 'Approval needed', headingLevel = 3, }) {
    const titleId = useId();
    const Heading = `h${headingLevel}`;
    const pending = approval.status === 'pending';
    const locked = busy !== null;
    return (_jsxs("section", { className: "cieo cieo-p-approval-request", "aria-labelledby": titleId, "data-status": approval.status, "aria-busy": pending && locked ? true : undefined, children: [_jsx(Heading, { id: titleId, children: approval.title ?? fallbackTitle }), approval.detail ? _jsx("p", { "data-detail": true, children: approval.detail }) : null, _jsx("p", { "data-status-text": true, children: APPROVAL_STATUS_WORDS[approval.status] }), pending ? (_jsxs("div", { "data-actions": true, children: [_jsx(Button, { variant: "primary", state: busy === 'approve' ? 'pending' : 'idle', pendingLabel: `${approveLabel}: sending`, "aria-disabled": locked || undefined, onClick: onApprove, children: approveLabel }), _jsx(Button, { variant: "secondary", state: busy === 'deny' ? 'pending' : 'idle', pendingLabel: `${denyLabel}: sending`, "aria-disabled": locked || undefined, onClick: onDeny, children: denyLabel })] })) : null] }));
}
