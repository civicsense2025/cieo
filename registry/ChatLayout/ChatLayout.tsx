// src/primitives/ChatLayout/ChatLayout.tsx
'use client';
/* ChatLayout. Two panes: transcript plus an optional artifact rail. Rail collapses on narrow screens. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import type { ReactNode } from 'react';

export interface ChatLayoutProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; transcript?: PrimitivePartProps; rail?: PrimitivePartProps };
  /** Transcript pane (list plus composer). Required. */
  children: ReactNode;
  /** Artifact panel beside the transcript. Omit for transcript only. */
  rail?: ReactNode;
}

export function ChatLayout({ children, rail, className, slotProps }: ChatLayoutProps) {
  return (
    <div className="cieo cieo-chat-layout" {...customizePart(slotProps?.root, "cieo cieo-chat-layout", undefined, className)}>
      <div data-pane="transcript" {...customizePart(slotProps?.transcript, undefined, undefined)}>{children}</div>
      {rail ? <div data-pane="rail" {...customizePart(slotProps?.rail, undefined, undefined)}>{rail}</div> : null}
    </div>
  );
}
