// src/primitives/UnreadDivider/UnreadDivider.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* UnreadDivider. A rule with a centered label that marks where the unread messages begin. The host decides where it sits and how many are unread. */

/** Text for the divider: the host's label when given, else "3 new messages" / "1 new message" for a count, else "New messages". */
export function unreadDividerLabel(count?: number, label?: string): string {
  const custom = label?.trim();
  if (custom) return custom;
  const n = typeof count === 'number' && Number.isFinite(count) ? Math.floor(count) : 0;
  if (n <= 0) return 'New messages';
  return `${n} new ${n === 1 ? 'message' : 'messages'}`;
}

export interface UnreadDividerProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; rule?: PrimitivePartProps; label?: PrimitivePartProps };

  /** How many messages are unread. Becomes part of the label when no label is given. */
  count?: number;
  /** Replaces the wording entirely (for other languages or other things than messages). Defaults to "New messages", or "3 new messages" with a count. */
  label?: string;
}

export function UnreadDivider({ className, slotProps, count, label }: UnreadDividerProps) {
  const text = unreadDividerLabel(count, label);
  return (
    <div role="separator" aria-label={text} className="cieo cieo-unread-divider" {...customizePart(slotProps?.root, "cieo cieo-unread-divider", undefined, className)}>
      <span aria-hidden="true" className="cieo-unread-divider-rule" {...customizePart(slotProps?.rule, "cieo-unread-divider-rule", undefined)} />
      <span aria-hidden="true" className="cieo-unread-divider-label" {...customizePart(slotProps?.label, "cieo-unread-divider-label", undefined)}>
        {text}
      </span>
      <span aria-hidden="true" className="cieo-unread-divider-rule" {...customizePart(slotProps?.rule, "cieo-unread-divider-rule", undefined)} />
    </div>
  );
}
