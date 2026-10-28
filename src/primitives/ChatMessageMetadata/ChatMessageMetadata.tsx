// src/primitives/ChatMessageMetadata/ChatMessageMetadata.tsx
'use client';
/* ChatMessageMetadata. Small muted line for delivery details. Text only; host owns the wording. */
import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface ChatMessageMetadataProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  children: ReactNode;
}

export function ChatMessageMetadata({ className, slotProps, children }: ChatMessageMetadataProps) {
  return (
    <p className="cieo cieo-chat-message-metadata" {...customizePart(slotProps?.root, "cieo cieo-chat-message-metadata", undefined, className)}>
      {children}
    </p>
  );
}
