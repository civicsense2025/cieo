// src/primitives/ChatMessage/ChatMessage.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ChatMessage. One transcript entry with optional author and time. Host owns bubbles and status. */
import type { ReactNode } from 'react';

export interface ChatMessageProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; author?: PrimitivePartProps; time?: PrimitivePartProps };

  /** Message author name (e.g. "Ava"). Optional. */
  author?: string;
  /** Message timestamp (e.g. "9:41 AM"). Optional. */
  time?: string;
  children: ReactNode;
}

export function ChatMessage({ className, slotProps, author, time, children }: ChatMessageProps) {
  return (
    <article className="cieo cieo-chat-message" {...customizePart(slotProps?.root, "cieo cieo-chat-message", undefined, className)}>
      {author ? <span data-author {...customizePart(slotProps?.author)}>{author}</span> : null}
      {time ? <time {...customizePart(slotProps?.time)}>{time}</time> : null}
      {children}
    </article>
  );
}
