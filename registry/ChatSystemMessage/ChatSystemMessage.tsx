// src/primitives/ChatSystemMessage/ChatSystemMessage.tsx
'use client';
/* ChatSystemMessage. Centered note for transcript events. Text only; host owns the wording. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface ChatSystemMessageProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  children: ReactNode;
}

export function ChatSystemMessage({ className, slotProps, children }: ChatSystemMessageProps) {
  return (
    <p className="cieo cieo-chat-system-message" {...customizePart(slotProps?.root, "cieo cieo-chat-system-message", undefined, className)}>
      {children}
    </p>
  );
}
