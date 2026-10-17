import type { ApprovalStatus, ApprovalView } from '../../agent/reduce.js';
/** Status text for each approval state. */
export declare const APPROVAL_STATUS_WORDS: Readonly<Record<ApprovalStatus, string>>;
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
export declare function ApprovalRequest({ approval, onApprove, onDeny, busy, approveLabel, denyLabel, fallbackTitle, headingLevel, }: ApprovalRequestProps): import("react/jsx-runtime").JSX.Element;
