// src/primitives/AnnotationLayer/AnnotationLayer.tsx
'use client';
/* AnnotationLayer. Wraps content for pin-and-comment review: comment mode captures clicks or keyboard placement, the host owns pins, drafts and threads. */
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { AnnotationPin, clampUnit } from '../AnnotationPin/AnnotationPin.js';
import { placePopover } from '../FeedbackPopover/FeedbackPopover.js';

export interface LayerPoint {
  x: number;
  y: number;
}

export type AnnotationTarget = { kind: 'draft'; x: number; y: number } | { kind: 'pin'; id: string };

export interface AnnotationLayerPin {
  /** Stable id used by selectedId, onSelect and renderPopover. */
  id: string;
  /** Horizontal position, 0..1 of the layer. */
  x: number;
  /** Vertical position, 0..1 of the layer. */
  y: number;
  /** open (default) or resolved. */
  state?: 'open' | 'resolved';
  /** Author initials drawn on the pin. */
  initials?: string;
}

/** Click position as a 0..1 point of `rect`, clamped. A zero-size rect gives 0,0. */
export function normalizePoint(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }): LayerPoint {
  const fx = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
  const fy = rect.height > 0 ? (clientY - rect.top) / rect.height : 0;
  return { x: clampUnit(fx), y: clampUnit(fy) };
}

/** Arrow key moves the reticle by step (big with Shift), clamped to 0..1. Returns null for any other key. */
export function moveReticle(point: LayerPoint, key: string, shift = false, step = 0.02, big = 0.1): LayerPoint | null {
  const d = shift ? big : step;
  const round = (v: number) => Math.round(clampUnit(v) * 10000) / 10000;
  if (key === 'ArrowLeft') return { x: round(point.x - d), y: point.y };
  if (key === 'ArrowRight') return { x: round(point.x + d), y: point.y };
  if (key === 'ArrowUp') return { x: point.x, y: round(point.y - d) };
  if (key === 'ArrowDown') return { x: point.x, y: round(point.y + d) };
  return null;
}

/** What Escape does in comment mode: cancel an open draft or thread first, otherwise leave comment mode. */
export function escapeAction(hasOpenTarget: boolean): 'close-target' | 'leave-mode' {
  return hasOpenTarget ? 'close-target' : 'leave-mode';
}

export const COMMENT_MODE_ON = 'Comment mode on. Click or press Enter to place a comment.';
export const COMMENT_MODE_OFF = 'Comment mode off.';

export interface AnnotationLayerProps {
  className?: string;
  slotProps?: { popover?: PrimitivePartProps; root?: PrimitivePartProps; content?: PrimitivePartProps; placement?: PrimitivePartProps; reticle?: PrimitivePartProps; pins?: PrimitivePartProps; pin?: PrimitivePartProps };
  /** Accessible name for the reviewed area, e.g. "Landing page". */
  label: string;
  /** The content being reviewed. */
  children: ReactNode;
  /** Existing pins, numbered 1..n in array order. */
  pins: AnnotationLayerPin[];
  /** True while comment mode is on: clicks place pins instead of reaching the content. */
  active: boolean;
  /** Called when Escape asks to leave comment mode. */
  onActiveChange?: (active: boolean) => void;
  /** Called with the normalized point for a click, Enter or Space in comment mode. The host creates the draft. */
  onPlace: (point: LayerPoint) => void;
  /** Id of the pin whose thread is open. */
  selectedId?: string | null;
  /** Called with a pin id on press, or null when the open thread or draft should close (Escape, outside press, pin pressed again). */
  onSelect: (id: string | null) => void;
  /** Content for the popover beside the draft or the selected pin; usually a FeedbackPopover without anchor. */
  renderPopover: (target: AnnotationTarget) => ReactNode;
  /** The unsent pin the host created after onPlace. */
  draft?: LayerPoint | null;
}

const PIN_HALF = 14;
const PIN_RISE = 17;

export function AnnotationLayer({ label, children, pins, active, onActiveChange, onPlace, selectedId = null, onSelect, renderPopover, draft = null, className, slotProps }: AnnotationLayerProps) {
  const root = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [reticle, setReticle] = useState<LayerPoint | null>(null);
  const [message, setMessage] = useState('');
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const [popSize, setPopSize] = useState({ width: 280, height: 160 });
  const first = useRef(true);
  const pressed = useRef<string | null>(null);
  const selectedPin = selectedId ? pins.find((p) => p.id === selectedId) : undefined;
  const target: AnnotationTarget | null = draft ? { kind: 'draft', x: draft.x, y: draft.y } : selectedPin ? { kind: 'pin', id: selectedPin.id } : null;
  const at = draft ?? selectedPin ?? null;

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setMessage(active ? COMMENT_MODE_ON : COMMENT_MODE_OFF);
    if (!active) setReticle(null);
  }, [active]);

  useEffect(() => {
    const el = content.current as (HTMLDivElement & { inert?: boolean }) | null;
    if (el) el.inert = active;
  }, [active]);

  const measure = useCallback(() => {
    const el = root.current;
    if (el) setBox((b) => (b && b.width === el.clientWidth && b.height === el.clientHeight ? b : { width: el.clientWidth, height: el.clientHeight }));
  }, []);
  useLayoutEffect(() => {
    measure();
    const el = root.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);
  useLayoutEffect(() => {
    const el = pop.current;
    if (el && el.offsetWidth && (el.offsetWidth !== popSize.width || el.offsetHeight !== popSize.height)) setPopSize({ width: el.offsetWidth, height: el.offsetHeight });
  });

  const place = (point: LayerPoint) => onPlace(point);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (escapeAction(target !== null) === 'close-target') onSelect(null);
      else onActiveChange?.(false);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      place(reticle ?? { x: 0.5, y: 0.5 });
      return;
    }
    const next = moveReticle(reticle ?? { x: 0.5, y: 0.5 }, e.key, e.shiftKey);
    if (next) {
      e.preventDefault();
      setReticle(next);
    }
  };

  let popover: ReactNode = null;
  if (target && at && box) {
    const anchor = { x: at.x * box.width, y: at.y * box.height - PIN_RISE };
    const placed = placePopover(anchor, popSize, box, PIN_HALF + 8);
    const style = { left: placed.left, top: placed.top, '--cieo-feedback-origin': `${anchor.x - placed.left}px ${anchor.y - placed.top}px` } as CSSProperties;
    popover = (
      <div ref={pop} data-side={placed.side} style={style} className="cieo-annotation-layer-popover" {...customizePart(slotProps?.popover, "cieo-annotation-layer-popover", style)}>
        {renderPopover(target)}
      </div>
    );
  }

  return (
    <div ref={root} role="group" aria-label={label} data-active={active ? 'true' : undefined} className="cieo cieo-annotation-layer" {...customizePart(slotProps?.root, "cieo cieo-annotation-layer", undefined, className)}>
      <div ref={content} className="cieo-annotation-layer-content" {...customizePart(slotProps?.content, "cieo-annotation-layer-content", undefined)}>{children}</div>
      {active ? (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Place a comment on ${label}`}
          onClick={(e) => {
            const rect = root.current?.getBoundingClientRect();
            if (rect) place(normalizePoint(e.clientX, e.clientY, rect));
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setReticle((r) => r ?? { x: 0.5, y: 0.5 })}
          onBlur={() => setReticle(null)}
          className="cieo-annotation-layer-overlay"
         {...customizePart(slotProps?.placement, "cieo-annotation-layer-overlay", undefined)}>
          {reticle ? <span aria-hidden="true" className="cieo-annotation-layer-reticle" style={{ left: `${reticle.x * 100}%`, top: `${reticle.y * 100}%` }}  {...customizePart(slotProps?.reticle, "cieo-annotation-layer-reticle", { left: `${reticle.x * 100}%`, top: `${reticle.y * 100}%` })}/> : null}
        </div>
      ) : null}
      <div className="cieo-annotation-layer-pins" onPointerDownCapture={(e) => { pressed.current = (e.target as HTMLElement).closest<HTMLElement>('[data-pin-id]')?.dataset.pinId === selectedId ? selectedId : null; }} {...customizePart(slotProps?.pins, "cieo-annotation-layer-pins", undefined)}>
        {pins.map((pin, i) => (
          <span key={pin.id} data-pin-id={pin.id} className="cieo-annotation-layer-pin" {...customizePart(slotProps?.pin, "cieo-annotation-layer-pin", undefined)}>
            <AnnotationPin
              index={i + 1}
              x={pin.x}
              y={pin.y}
              state={pin.state ?? 'open'}
              selected={pin.id === selectedId}
              initials={pin.initials}
              onSelect={() => {
                if (pressed.current === pin.id) {
                  pressed.current = null;
                  onSelect(null);
                  return;
                }
                onSelect(pin.id);
              }}
            />
          </span>
        ))}
        {draft ? <AnnotationPin index={pins.length + 1} x={draft.x} y={draft.y} state="draft" selected /> : null}
      </div>
      {popover}
      <span role="status" aria-live="polite" className="cieo-sr-only">{message}</span>
    </div>
  );
}
