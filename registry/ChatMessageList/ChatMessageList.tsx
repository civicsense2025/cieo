// src/primitives/ChatMessageList/ChatMessageList.tsx
'use client';
/* ChatMessageList. Scrollable transcript region. Host supplies messages; this owns log semantics only. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { ReactNode } from 'react';

export interface ChatMessageListProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Accessible name for the transcript. Defaults to Messages. */
  label?: string;
  children: ReactNode;
}

export function ChatMessageList({ label = 'Messages', children, className, slotProps }: ChatMessageListProps) {
  return (
    <div role="log" aria-label={label} className="cieo cieo-chat-message-list" {...customizePart(slotProps?.root, "cieo cieo-chat-message-list", undefined, className)}>
      {children}
    </div>
  );
}
