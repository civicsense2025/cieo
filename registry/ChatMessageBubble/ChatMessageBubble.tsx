// src/primitives/ChatMessageBubble/ChatMessageBubble.tsx
'use client';
/* ChatMessageBubble. Variant bubble for one message body. Incoming or outgoing; host owns the text. */
import type { ReactNode } from 'react';

export interface ChatMessageBubbleProps {
  /** Bubble side. Defaults to incoming. */
  variant?: 'incoming' | 'outgoing';
  children: ReactNode;
}

export function ChatMessageBubble({ variant = 'incoming', children }: ChatMessageBubbleProps) {
  return (
    <div data-variant={variant} className="cieo cieo-chat-message-bubble">
      {children}
    </div>
  );
}
