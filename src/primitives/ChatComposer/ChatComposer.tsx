// src/primitives/ChatComposer/ChatComposer.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ChatComposer. Controlled form shell for sending. Host supplies input + send; this owns submit semantics only. */
import type { FormEvent, ReactNode } from 'react';

export interface ChatComposerProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Accessible name for the composer form. Defaults to Send a message. */
  label?: string;
  /** Called after submit is intercepted. Host sends and clears. Optional. */
  onSubmit?: () => void;
  children: ReactNode;
}

export function ChatComposer({ className, slotProps, label = 'Send a message', onSubmit, children }: ChatComposerProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };
  return (
    <form aria-label={label} onSubmit={handleSubmit} className="cieo cieo-chat-composer" {...customizePart(slotProps?.root, "cieo cieo-chat-composer", undefined, className)}>
      {children}
    </form>
  );
}
