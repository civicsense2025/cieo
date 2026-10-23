export interface ReplyPreviewProps {
    /** Name of the person being replied to. Required. */
    author: string;
    /** Short excerpt of the original text. Clamped to two lines (one in the composer). Required. */
    excerpt: string;
    /** `composer` sits above an input and can be dismissed; `quote` sits inside a message and can jump to the original. Defaults to quote. */
    variant?: 'composer' | 'quote';
    /** Composer variant: called when the dismiss button is pressed. Without it no dismiss button renders. */
    onDismiss?: () => void;
    /** Quote variant: called when the quote is pressed. Without it the quote is plain text, not a button. */
    onJump?: () => void;
}
/** Accessible name of the composer dismiss button. */
export declare function replyDismissLabel(author: string): string;
/** Accessible name of the quote jump button. */
export declare function replyJumpLabel(author: string): string;
export declare function ReplyPreview({ author, excerpt, variant, onDismiss, onJump }: ReplyPreviewProps): import("react/jsx-runtime").JSX.Element;
