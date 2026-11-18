// src/primitives/CommandPalette/CommandPalette.tsx
'use client';
/* CommandPalette. Command-menu shell with controllable open + query state and spring enter/exit presence. */
import { createContext, type KeyboardEvent, type ReactNode } from 'react';
import { roveFocus, usePresence } from '../../react/index.js';
import { useControllableState } from '../../state/react.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

export interface CommandPaletteContextValue {
  query?: string;
  onQueryChange?: (query: string) => void;
}
export const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export interface CommandPaletteProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Accessible name for the palette (e.g. "Site commands"). Required. */
  label: string;
  /** Controlled open state. Defaults to true when omitted so standalone mounts render open. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to true. */
  defaultOpen?: boolean;
  /** Called with the next open state. */
  onOpenChange?: (open: boolean) => void;
  /** Current filter text when controlled. Optional. */
  query?: string;
  /** Initial filter text when uncontrolled. Optional. */
  defaultQuery?: string;
  /** Host filter hook; reaches CommandPaletteInput when it has no onChange of its own. Optional. */
  onQueryChange?: (query: string) => void;
  /** Called on Escape. Optional. */
  onClose?: () => void;
  /** Called with 1 or -1 on ArrowDown or ArrowUp when the host tracks the active item. Without it focus moves between options. */
  onNavigate?: (delta: 1 | -1) => void;
  /** Called on Enter in the input when the host tracks the active item. Optional. */
  onActivate?: () => void;
  /** False disables spring enter/exit. Defaults to true. */
  motion?: boolean;
  children: ReactNode;
}

export function CommandPalette({
  className,
  slotProps,
  label,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  query: queryProp,
  defaultQuery,
  onQueryChange,
  onClose,
  onNavigate,
  onActivate,
  motion,
  children,
}: CommandPaletteProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [query, setQuery] = useControllableState<string | undefined>({
    value: queryProp,
    defaultValue: defaultQuery,
    onChange: (next) => {
      if (next !== undefined) onQueryChange?.(next);
    },
  });
  const { mounted, ref } = usePresence<HTMLDivElement>(isOpen, {
    disabled: motion === false,
    from: { x: 0, y: 4, scale: 0.98, opacity: 0, blur: 0 },
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      onClose?.();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (onNavigate) {
        e.preventDefault();
        onNavigate(e.key === 'ArrowDown' ? 1 : -1);
      } else roveFocus(e, ref.current, '[role="option"]');
      return;
    }
    if (e.key === 'Enter' && onActivate && (e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault();
      onActivate();
    }
  };

  if (!mounted) return null;

  const hasQueryState = queryProp !== undefined || defaultQuery !== undefined || onQueryChange !== undefined;

  return (
    <CommandPaletteContext.Provider value={{ query, onQueryChange: hasQueryState ? (q: string) => setQuery(q) : undefined }}>
      <div
        ref={ref}
        role="dialog"
        aria-label={label}
        data-query={query}
        onKeyDown={onKeyDown}
        className="cieo cieo-p-command-palette"
        {...customizePart(slotProps?.root, 'cieo cieo-p-command-palette', undefined, className)}
      >
        {children}
      </div>
    </CommandPaletteContext.Provider>
  );
}
