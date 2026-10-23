// src/primitives/CommandPalette/CommandPalette.tsx
'use client';
/* CommandPalette. Command-menu shell. Host filters items from the query; this owns dialog structure, Escape and arrow-key movement. */
import { createContext, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { roveFocus } from '../../react/index.js';

export interface CommandPaletteContextValue {
  query?: string;
  onQueryChange?: (query: string) => void;
}
export const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export interface CommandPaletteProps {
  /** Accessible name for the palette (e.g. "Site commands"). Required. */
  label: string;
  /** Current filter text, owned by the host. Optional. */
  query?: string;
  /** Host filter hook; reaches CommandPaletteInput when it has no onChange of its own. Optional. */
  onQueryChange?: (query: string) => void;
  /** Called on Escape. Optional. */
  onClose?: () => void;
  /** Called with 1 or -1 on ArrowDown or ArrowUp when the host tracks the active item. Without it focus moves between options. */
  onNavigate?: (delta: 1 | -1) => void;
  /** Called on Enter in the input when the host tracks the active item. Optional. */
  onActivate?: () => void;
  children: ReactNode;
}

export function CommandPalette({ label, query, onQueryChange, onClose, onNavigate, onActivate, children }: CommandPaletteProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose?.(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (onNavigate) { e.preventDefault(); onNavigate(e.key === 'ArrowDown' ? 1 : -1); }
      else roveFocus(e, ref.current, '[role="option"]');
      return;
    }
    if (e.key === 'Enter' && onActivate && (e.target as HTMLElement).tagName === 'INPUT') { e.preventDefault(); onActivate(); }
  };
  return (
    <CommandPaletteContext.Provider value={{ query, onQueryChange }}>
      <div ref={ref} role="dialog" aria-label={label} data-query={query} onKeyDown={onKeyDown} className="cieo cieo-p-command-palette">
        {children}
      </div>
    </CommandPaletteContext.Provider>
  );
}
