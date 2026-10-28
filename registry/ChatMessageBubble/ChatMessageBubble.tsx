// src/primitives/ChatMessageBubble/ChatMessageBubble.tsx
'use client';
/* ChatMessageBubble. Variant bubble for one message body. Incoming or outgoing; host owns the text. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface ChatMessageBubbleProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Bubble side. Defaults to incoming. */
  variant?: 'incoming' | 'outgoing';
  children: ReactNode;
}

export function ChatMessageBubble({ className, slotProps, variant = 'incoming', children }: ChatMessageBubbleProps) {
  return (
    <div data-variant={variant} className="cieo cieo-chat-message-bubble" {...customizePart(slotProps?.root, "cieo cieo-chat-message-bubble", undefined, className)}>
      {children}
    </div>
  );
}
