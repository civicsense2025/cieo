// src/primitives/FeedbackPopover/FeedbackPopover.tsx
'use client';
/* FeedbackPopover. Small non-modal comment box with an optional thread above it; the host owns text, threads and submit. */
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useDismiss, usePresence } from '../../react/index.js';

export type PopoverSide = 'right' | 'left' | 'below' | 'above';

export interface PopoverPlacement {
  left: number;
  top: number;
  side: PopoverSide;
}

const clampTo = (v: number, max: number) => Math.max(0, Math.min(Number.isFinite(max) ? max : 0, Number.isFinite(v) ? v : 0));

/** Where a popover of `size` goes beside `anchor` inside `container` (all px). Prefers right, then left, below, above; when none fits it takes the side with the most room. The result is always clamped inside the container. */
export function placePopover(anchor: { x: number; y: number }, size: { width: number; height: number }, container: { width: number; height: number }, gap = 8): PopoverPlacement {
  const room: Record<PopoverSide, number> = {
    right: container.width - anchor.x - gap - size.width,
    left: anchor.x - gap - size.width,
    below: container.height - anchor.y - gap - size.height,
    above: anchor.y - gap - size.height,
  };
  const order: PopoverSide[] = ['right', 'left', 'below', 'above'];
  let side = order.find((s) => room[s] >= 0);
  if (!side) side = order.reduce((best, s) => (room[s] > room[best] ? s : best), 'right' as PopoverSide);
  let left: number;
  let top: number;
  if (side === 'right' || side === 'left') {
    left = side === 'right' ? anchor.x + gap : anchor.x - gap - size.width;
    top = anchor.y - Math.min(size.height / 2, 28);
  } else {
    left = anchor.x - size.width / 2;
    top = side === 'below' ? anchor.y + gap : anchor.y - gap - size.height;
  }
  return { left: clampTo(left, container.width - size.width), top: clampTo(top, container.height - size.height), side };
}

/** True when the keydown should submit: Enter with Cmd or Ctrl held. */
export function isSubmitShortcut(e: { key: string; metaKey?: boolean; ctrlKey?: boolean }): boolean {
  return e.key === 'Enter' && !!(e.metaKey || e.ctrlKey);
}

/** Text to hand to onSubmit, or null when there is nothing but whitespace. */
export function commentText(raw: string): string | null {
  const t = raw.trim();
  return t ? t : null;
}

export interface FeedbackPopoverProps {
  /** Controlled open state. */
  open: boolean;
  /** Called with false on Escape, outside press, and after a successful submit. */
  onOpenChange: (open: boolean) => void;
  /** Called with the trimmed text on submit button or Cmd/Ctrl+Enter. Never called for empty text. */
  onSubmit: (text: string) => void;
  /** Placeholder for the text box. Defaults to "Add a comment". */
  placeholder?: string;
  /** Submit button text. Defaults to "Comment". */
  submitLabel?: string;
  /** Visible heading that also names the dialog. Omit for a headless box named by its placeholder. */
  title?: string;
  /** Existing thread, rendered above the box. */
  children?: ReactNode;
  /** Extra actions beside the submit button, such as Resolve. */
  secondaryActions?: ReactNode;
  /** Point to sit beside, in px within the positioned container. Omit to render in normal flow (the host positions it). */
  anchor?: { x: number; y: number };
  /** Size of the positioned container in px, required with anchor for placement. */
  container?: { width: number; height: number };
  /** Distance from the anchor in px. Defaults to 8. */
  gap?: number;
}

const FALLBACK_SIZE = { width: 280, height: 160 };

export function FeedbackPopover({ open, onOpenChange, onSubmit, placeholder = 'Add a comment', submitLabel = 'Comment', title, children, secondaryActions, anchor, container, gap = 8 }: FeedbackPopoverProps) {
  const titleId = useId();
  const [text, setText] = useState('');
  const [size, setSize] = useState(FALLBACK_SIZE);
  const field = useRef<HTMLTextAreaElement>(null);
  const placed = anchor && container ? placePopover(anchor, size, container, gap) : null;
  const origin = placed && anchor ? `${anchor.x - placed.left}px ${anchor.y - placed.top}px` : undefined;
  const { mounted, ref } = usePresence<HTMLDivElement>(open, { from: { x: 0, y: 0, scale: 0.96, opacity: 0, blur: 0 } });
  useDismiss(open, () => onOpenChange(false), [ref]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    field.current?.focus({ preventScroll: true });
    return () => {
      if (opener?.isConnected && opener !== document.body) opener.focus({ preventScroll: true });
    };
  }, [open, mounted]);
  useEffect(() => {
    if (!open) setText('');
  }, [open]);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !anchor) return;
    const next = { width: el.offsetWidth, height: el.offsetHeight };
    if (next.width && next.height && (next.width !== size.width || next.height !== size.height)) setSize(next);
  });

  if (!mounted) return null;
  const submit = () => {
    const t = commentText(text);
    if (!t) return;
    onSubmit(t);
    setText('');
    onOpenChange(false);
  };
  const empty = commentText(text) === null;
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : placeholder}
      data-side={placed?.side}
      data-placed={placed ? 'true' : undefined}
      style={placed ? { left: placed.left, top: placed.top, transformOrigin: origin } : undefined}
      className="cieo cieo-feedback-popover"
    >
      {title ? <h2 id={titleId} className="cieo-feedback-popover-title">{title}</h2> : null}
      {children ? <div className="cieo-feedback-popover-thread">{children}</div> : null}
      <textarea
        ref={field}
        value={text}
        rows={2}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (isSubmitShortcut(e)) {
            e.preventDefault();
            submit();
          }
        }}
        className="cieo-feedback-popover-field"
      />
      <div className="cieo-feedback-popover-actions">
        {secondaryActions}
        <button type="button" disabled={empty} onClick={submit} className="cieo-feedback-popover-submit">{submitLabel}</button>
      </div>
    </div>
  );
}
