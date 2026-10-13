// src/primitives/ChatMessage/ChatMessage.tsx
'use client';
/* ChatMessage. One transcript entry with optional author and time. Host owns bubbles and status. */
import type { ReactNode } from 'react';

export interface ChatMessageProps {
  /** Message author name (e.g. "Ava"). Optional. */
  author?: string;
  /** Message timestamp (e.g. "9:41 AM"). Optional. */
  time?: string;
  children: ReactNode;
}

export function ChatMessage({ author, time, children }: ChatMessageProps) {
  return (
    <article className="cieo cieo-chat-message">
      {author ? <span data-author>{author}</span> : null}
      {time ? <time>{time}</time> : null}
      {children}
    </article>
  );
}
