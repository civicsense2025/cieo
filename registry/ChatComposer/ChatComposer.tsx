// src/primitives/ChatComposer/ChatComposer.tsx
'use client';
/* ChatComposer. Controlled form shell for sending. Host supplies input + send; this owns submit semantics only. */
import type { FormEvent, ReactNode } from 'react';

export interface ChatComposerProps {
  /** Accessible name for the composer form. Defaults to Send a message. */
  label?: string;
  /** Called after submit is intercepted. Host sends and clears. Optional. */
  onSubmit?: () => void;
  children: ReactNode;
}

export function ChatComposer({ label = 'Send a message', onSubmit, children }: ChatComposerProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };
  return (
    <form aria-label={label} onSubmit={handleSubmit} className="cieo cieo-chat-composer">
      {children}
    </form>
  );
}
