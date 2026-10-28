// src/primitives/TypingIndicator/TypingIndicator.tsx
'use client';
/* TypingIndicator. Three waving dots plus a spoken sentence about who is typing. The host owns the names; this owns the wording, the wave and the enter/leave. */
import { useState } from 'react';
import { usePresence } from '../../react/index.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

/** Sentence for who is typing: "" for nobody, "Ava is typing", "Ava and Ben are typing", "Ava, Ben and Cy are typing", "Ava and 3 others are typing". Blank names are ignored. */
export function typingLabel(names: readonly string[]): string {
  const list = names.map((n) => n.trim()).filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return `${list[0]} is typing`;
  if (list.length === 2) return `${list[0]} and ${list[1]} are typing`;
  if (list.length === 3) return `${list[0]}, ${list[1]} and ${list[2]} are typing`;
  return `${list[0]} and ${list.length - 1} others are typing`;
}

/** Identity of the set of people typing, ignoring order and blanks. The spoken text changes only when this changes. */
export function typingSetKey(names: readonly string[]): string {
  return [...new Set(names.map((n) => n.trim()).filter(Boolean))].sort().join('\u0000');
}

export interface TypingIndicatorProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; body?: PrimitivePartProps; dots?: PrimitivePartProps; dot?: PrimitivePartProps; text?: PrimitivePartProps };

  /** Who is typing right now. An empty list hides the indicator (it leaves with a short fade). */
  names: string[];
  /** bubble: dots in a chat bubble, sentence read aloud only. inline: dots with the sentence shown beside them. Defaults to bubble. */
  variant?: 'bubble' | 'inline';
}

export function TypingIndicator({ className, slotProps, names, variant = 'bubble' }: TypingIndicatorProps) {
  const open = typingSetKey(names) !== '';
  const key = typingSetKey(names);
  /* The held names keep the sentence stable while the indicator leaves, and keep it from changing when only the order changes. */
  const [held, setHeld] = useState<{ key: string; names: string[] }>({ key, names });
  if (open && held.key !== key) setHeld({ key, names });
  const { mounted, ref } = usePresence<HTMLSpanElement>(open);
  const label = typingLabel(held.names);
  return (
    <span role="status" data-variant={variant} data-empty={mounted ? undefined : ''} className="cieo cieo-typing-indicator" {...customizePart(slotProps?.root, "cieo cieo-typing-indicator", undefined, className)}>
      {mounted ? (
        <span ref={ref} className="cieo-typing-indicator-body" {...customizePart(slotProps?.body, "cieo-typing-indicator-body", undefined)}>
          <span aria-hidden="true" className="cieo-typing-indicator-dots" {...customizePart(slotProps?.dots, "cieo-typing-indicator-dots", undefined)}>
            <span className="cieo-typing-indicator-dot" {...customizePart(slotProps?.dot, "cieo-typing-indicator-dot", undefined)} />
            <span className="cieo-typing-indicator-dot" {...customizePart(slotProps?.dot, "cieo-typing-indicator-dot", undefined)} />
            <span className="cieo-typing-indicator-dot" {...customizePart(slotProps?.dot, "cieo-typing-indicator-dot", undefined)} />
          </span>
          <span className={variant === 'inline' ? 'cieo-typing-indicator-text' : 'cieo-sr-only'} {...customizePart(slotProps?.text, variant === 'inline' ? 'cieo-typing-indicator-text' : 'cieo-sr-only', undefined)}>{label}</span>
        </span>
      ) : null}
    </span>
  );
}
