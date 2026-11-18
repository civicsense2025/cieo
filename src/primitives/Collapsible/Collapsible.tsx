'use client';
/* Collapsible. Disclosure with controllable open state, CollapsibleGroup coordination, and ResizeObserver height spring. */
import { useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { S, Track, allowed, config, now, run } from '../../core/spring.js';
import type { Cancel } from '../../dom/index.js';
import { useControllableState } from '../../state/react.js';
import { CollapsibleGroupContext } from '../CollapsibleGroup/CollapsibleGroup.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface CollapsibleProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; trigger?: PrimitivePartProps; panel?: PrimitivePartProps };
  /** Button label for the disclosure. Required. */
  title: string;
  /** Optional item key when coordinated inside CollapsibleGroup. */
  value?: string;
  /** Controlled open state; omit for internal or group state. */
  open?: boolean;
  /** Initial open state for internal state. Defaults to false. */
  defaultOpen?: boolean;
  /** Called with the next open state on toggle. */
  onOpenChange?: (open: boolean) => void;
  /** Revealed content. Required. */
  children: ReactNode;
}

export function Collapsible({
  className,
  slotProps,
  title,
  value,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: CollapsibleProps) {
  const group = useContext(CollapsibleGroupContext);
  const inGroup = group !== null && value !== undefined && open === undefined;
  const [controlledOrOwn, setOwn] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const effective = inGroup ? group.isOpen(value) : controlledOrOwn;

  const [closing, setClosing] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<Track | null>(null);
  const cancelRef = useRef<Cancel | null>(null);
  const prevOpenRef = useRef(effective);

  const toggle = () => {
    const next = !effective;
    if (inGroup) {
      group.toggleItem(value);
      onOpenChange?.(next);
      return;
    }
    setOwn(next);
  };

  useIso(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = effective;
    const panel = panelRef.current;
    const body = bodyRef.current;

    if (wasOpen === effective) return;

    if (!effective) {
      if (!panel || !allowed('feedback', panel)) {
        setClosing(false);
        return;
      }
      const startH = trackRef.current ? trackRef.current.at(now()) : panel.offsetHeight;
      if (!trackRef.current) trackRef.current = new Track(startH, S.soft);
      const tr = trackRef.current;
      setClosing(true);
      panel.style.overflow = 'clip';
      panel.style.height = `${Math.max(0, startH).toFixed(2)}px`;
      cancelRef.current?.();
      tr.set(0, config('feedback', S.soft));
      cancelRef.current = run({
        kind: 'feedback',
        step: (t) => {
          if (panelRef.current) panelRef.current.style.height = `${Math.max(0, tr.at(t)).toFixed(2)}px`;
          return tr.prune(t) > 0;
        },
        finish: () => {
          cancelRef.current = null;
          tr.jump(0);
          setClosing(false);
        },
      });
      return;
    }

    setClosing(false);
    if (!panel || !body || !allowed('feedback', panel)) return;
    const targetH = body.offsetHeight;
    if (!trackRef.current) trackRef.current = new Track(0, S.soft);
    const tr = trackRef.current;
    panel.style.overflow = 'clip';
    panel.style.height = `${Math.max(0, tr.at(now())).toFixed(2)}px`;
    cancelRef.current?.();
    tr.set(targetH, config('feedback', S.soft));
    cancelRef.current = run({
      kind: 'feedback',
      step: (t) => {
        if (panelRef.current) panelRef.current.style.height = `${Math.max(0, tr.at(t)).toFixed(2)}px`;
        return tr.prune(t) > 0;
      },
      finish: () => {
        cancelRef.current = null;
        tr.jump(tr.target);
        if (panelRef.current) {
          panelRef.current.style.height = '';
          panelRef.current.style.overflow = '';
        }
      },
    });
  }, [effective]);

  useIso(() => {
    const body = bodyRef.current;
    const panel = panelRef.current;
    if (!effective || !body || !panel || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (!effective || !panelRef.current || !bodyRef.current) return;
      const h = bodyRef.current.offsetHeight;
      if (!trackRef.current) {
        trackRef.current = new Track(h, S.soft);
        return;
      }
      const tr = trackRef.current;
      if (!allowed('feedback', panelRef.current) || Math.abs(tr.target - h) < 0.5) {
        tr.jump(h);
        return;
      }
      panelRef.current.style.overflow = 'clip';
      panelRef.current.style.height = `${Math.max(0, tr.at(now())).toFixed(2)}px`;
      cancelRef.current?.();
      tr.set(h, config('feedback', S.soft));
      cancelRef.current = run({
        kind: 'feedback',
        step: (t) => {
          if (panelRef.current) panelRef.current.style.height = `${Math.max(0, tr.at(t)).toFixed(2)}px`;
          return tr.prune(t) > 0;
        },
        finish: () => {
          cancelRef.current = null;
          tr.jump(tr.target);
          if (panelRef.current) {
            panelRef.current.style.height = '';
            panelRef.current.style.overflow = '';
          }
        },
      });
    });
    observer.observe(body);
    return () => observer.disconnect();
  }, [effective]);

  useEffect(() => () => cancelRef.current?.(), []);

  const mounted = effective || closing;

  return (
    <div
      data-open={effective}
      className="cieo cieo-collapsible"
      {...customizePart(slotProps?.root, 'cieo cieo-collapsible', undefined, className)}
    >
      <button
        type="button"
        aria-expanded={effective}
        aria-controls={mounted ? panelId : undefined}
        onClick={toggle}
        {...customizePart(slotProps?.trigger)}
      >
        {title}
      </button>
      {mounted ? (
        <div
          ref={panelRef}
          id={panelId}
          role="region"
          aria-label={title}
          aria-hidden={!effective || undefined}
          {...customizePart(slotProps?.panel)}
        >
          <div ref={bodyRef}>{children}</div>
        </div>
      ) : null}
    </div>
  );
}
