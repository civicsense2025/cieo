'use client';
import { customizePart } from '../customization.js';
import { cloneElement, isValidElement, useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useDismiss, usePresence } from '../../react/index.js';
import { usePopoverPosition } from './usePopoverPosition.js';
import type { PopoverAlign, PopoverSide } from './position.js';

import type { PrimitivePartProps as PartProps } from '../parts.js';

export interface PopoverProps {
  trigger: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  label?: string;
  side?: PopoverSide;
  align?: PopoverAlign;
  offset?: number;
  collisionPadding?: number;
  portal?: boolean;
  motion?: boolean;
  className?: string;
  style?: CSSProperties;
  slots?: { header?: ReactNode; content?: ReactNode; footer?: ReactNode };
  slotProps?: { root?: PartProps; trigger?: PartProps; content?: PartProps };
}

export function Popover({ trigger, open, defaultOpen = false, onOpenChange, children, label, side = 'bottom', align = 'start', offset = 8,
  collisionPadding = 12, portal = true, motion = true, className, style, slots, slotProps }: PopoverProps) {
  const [inner, setInner] = useState(defaultOpen);
  const [client, setClient] = useState(false);
  useEffect(() => setClient(true), []);
  const visible = open ?? inner;
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const presence = usePresence<HTMLDivElement>(visible, { disabled: !motion, kind: 'entrance', from: { y: -4, scale: .98, opacity: .7 } });
  const position = usePopoverPosition(presence.mounted, triggerRef, panelRef, { side, align, offset, padding: collisionPadding });
  const set = (next: boolean) => { if (open === undefined) setInner(next); onOpenChange?.(next); };
  const restoreFocus = () => (triggerRef.current?.querySelector('button,a[href],[tabindex]') as HTMLElement | null)?.focus();
  useDismiss(visible, (reason) => { set(false); if (reason === 'escape') restoreFocus(); }, [rootRef, panelRef]);
  const triggerNode = isValidElement<Record<string, unknown>>(trigger) ? cloneElement(trigger, {
    'aria-haspopup': 'dialog', 'aria-expanded': visible, 'aria-controls': visible ? panelId : undefined,
    onClick: (event: MouseEvent) => {
      (trigger.props.onClick as ((event: MouseEvent) => void) | undefined)?.(event);
      if (!event.defaultPrevented && !trigger.props.disabled && trigger.props['aria-disabled'] !== true && trigger.props['aria-disabled'] !== 'true') set(!visible);
    },
  }) : <button type="button" aria-haspopup="dialog" aria-expanded={visible} aria-controls={visible ? panelId : undefined} onClick={() => set(!visible)}>{trigger}</button>;
  const content = presence.mounted ? <div ref={panelRef} className="cieo-p-popover-position" data-side={position?.side ?? side}
    style={{ position: 'fixed', left: position?.x ?? 0, top: position?.y ?? 0, maxWidth: position?.maxWidth,
      maxHeight: position?.maxHeight, pointerEvents: visible ? undefined : 'none', visibility: client && !position ? 'hidden' : undefined, zIndex: 'var(--cieo-popover-z, 50)' }}>
    <div {...customizePart(slotProps?.content)} ref={presence.ref} id={panelId} role="dialog" aria-label={label ?? (isValidElement<{children?: ReactNode}>(trigger) && typeof trigger.props.children === 'string' ? trigger.props.children : 'Popover')}
      aria-hidden={!visible || undefined} inert={!visible || undefined} className={`cieo cieo-p-popover-panel ${slotProps?.content?.className ?? ''}`}
      style={{ ...slotProps?.content?.style, maxWidth: 'inherit', maxHeight: 'inherit', overflow: 'auto' }}>
      {slots?.header}{slots?.content ?? children}{slots?.footer}
    </div>
  </div> : null;
  return <div {...customizePart(slotProps?.root)} ref={rootRef} className={`cieo cieo-p-popover ${className ?? ''} ${slotProps?.root?.className ?? ''}`}
    style={{ ...style, ...slotProps?.root?.style }}>
    <div {...customizePart(slotProps?.trigger)} ref={triggerRef} className={`cieo-p-popover-trigger ${slotProps?.trigger?.className ?? ''}`}>{triggerNode}</div>
    {client && portal ? createPortal(content, document.body) : content}
  </div>;
}
