// src/primitives/ChatLayout/ChatLayout.tsx
'use client';
/* ChatLayout. Two panes: transcript plus an optional artifact rail. Rail collapses on narrow screens. */
import type { ReactNode } from 'react';

export interface ChatLayoutProps {
  /** Transcript pane (list plus composer). Required. */
  children: ReactNode;
  /** Artifact panel beside the transcript. Omit for transcript only. */
  rail?: ReactNode;
}

export function ChatLayout({ children, rail }: ChatLayoutProps) {
  return (
    <div className="cieo cieo-chat-layout">
      <div data-pane="transcript">{children}</div>
      {rail ? <div data-pane="rail">{rail}</div> : null}
    </div>
  );
}
