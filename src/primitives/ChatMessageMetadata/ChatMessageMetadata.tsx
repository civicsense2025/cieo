// src/primitives/ChatMessageMetadata/ChatMessageMetadata.tsx
'use client';
/* ChatMessageMetadata. Small muted line for delivery details. Text only; host owns the wording. */
import type { ReactNode } from 'react';

export interface ChatMessageMetadataProps {
  children: ReactNode;
}

export function ChatMessageMetadata({ children }: ChatMessageMetadataProps) {
  return (
    <p className="cieo cieo-chat-message-metadata">
      {children}
    </p>
  );
}
