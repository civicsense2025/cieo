// src/primitives/ChatSystemMessage/ChatSystemMessage.tsx
'use client';
/* ChatSystemMessage. Centered note for transcript events. Text only; host owns the wording. */
import type { ReactNode } from 'react';

export interface ChatSystemMessageProps {
  children: ReactNode;
}

export function ChatSystemMessage({ children }: ChatSystemMessageProps) {
  return (
    <p className="cieo cieo-chat-system-message">
      {children}
    </p>
  );
}
