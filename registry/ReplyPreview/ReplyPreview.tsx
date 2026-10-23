// src/primitives/ReplyPreview/ReplyPreview.tsx
'use client';
/* ReplyPreview. Quoted reply with an accent bar. Host owns the excerpt text and what dismiss or jump do. */

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
export function replyDismissLabel(author: string): string {
  return `Cancel reply to ${author}`;
}

/** Accessible name of the quote jump button. */
export function replyJumpLabel(author: string): string {
  return `Go to the message from ${author}`;
}

export function ReplyPreview({ author, excerpt, variant = 'quote', onDismiss, onJump }: ReplyPreviewProps) {
  const body = (
    <>
      <span className="cieo-reply-preview-bar" aria-hidden="true" />
      <span className="cieo-reply-preview-text">
        <span className="cieo-reply-preview-author">{author}</span>
        <span className="cieo-reply-preview-excerpt">{excerpt}</span>
      </span>
    </>
  );
  if (variant === 'composer') {
    return (
      <div className="cieo cieo-reply-preview" data-variant="composer">
        {body}
        {onDismiss ? (
          <button type="button" className="cieo-reply-preview-dismiss" aria-label={replyDismissLabel(author)} onClick={onDismiss}>
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
              <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>
    );
  }
  if (onJump) {
    return (
      <button type="button" className="cieo cieo-reply-preview" data-variant="quote" data-interactive="" aria-label={replyJumpLabel(author)} onClick={onJump}>
        {body}
      </button>
    );
  }
  return (
    <div className="cieo cieo-reply-preview" data-variant="quote">
      {body}
    </div>
  );
}
