// src/primitives/ChatMessageList/ChatMessageList.tsx
'use client';
/* ChatMessageList. Scrollable transcript region. Host supplies messages; this owns log semantics only. */
import type { ReactNode } from 'react';

export interface ChatMessageListProps {
  /** Accessible name for the transcript. Defaults to Messages. */
  label?: string;
  children: ReactNode;
}

export function ChatMessageList({ label = 'Messages', children }: ChatMessageListProps) {
  return (
    <div role="log" aria-label={label} className="cieo cieo-chat-message-list">
      {children}
    </div>
  );
}
