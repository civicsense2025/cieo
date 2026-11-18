'use client';
/* MorphSurface: interruptible FLIP Container Transform driven by 5-channel SpringRect (x, y, width, height, radius). */
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { S, allowed, config, now, run, type Preset, type SpringConfig } from '../../core/spring.js';
import type { Cancel } from '../../dom/index.js';
import { SpringRect, type RectGeometry } from '../../live/index.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const cfgOf = (p: Preset | SpringConfig): SpringConfig => (typeof p === 'string' ? S[p] : p);

/* Shared cross-mount snapshot cache keyed by layoutId (bounded LRU <= 256) so unmounting source -> mounting target morphs seamlessly. */
const geometryRegistry = new Map<string, RectGeometry>();
function rememberGeometry(id: string, rect: RectGeometry): void {
  geometryRegistry.delete(id);
  geometryRegistry.set(id, rect);
  if (geometryRegistry.size > 256) {
    const oldest = geometryRegistry.keys().next().value;
    if (oldest !== undefined) geometryRegistry.delete(oldest);
  }
}

function readGeometry(el: HTMLElement): RectGeometry {
  const r = el.getBoundingClientRect();
  let radius = 0;
  if (typeof getComputedStyle === 'function') {
    const parsed = parseFloat(getComputedStyle(el).borderTopLeftRadius);
    if (Number.isFinite(parsed)) radius = parsed;
  }
  return { x: r.left, y: r.top, width: r.width, height: r.height, radius };
}

export interface MorphSurfaceProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Shared Container Transform identifier across morph states or mounts. */
  layoutId: string;
  /** Optional state key; changing it triggers a same-element FLIP measurement and SpringRect retarget. */
  stateKey?: string | number | boolean;
  /** Optional explicit origin rect (e.g. from TransitionEnvelope.anchorRect). */
  anchorRect?: RectGeometry;
  /** Spring preset or config. Defaults to base. */
  preset?: Preset | SpringConfig;
  /** False disables motion and snaps immediately. Defaults to true. */
  motion?: boolean;
  /** Alias to disable motion. Defaults to false. */
  disabled?: boolean;
  children: ReactNode;
}

export function MorphSurface({
  className,
  slotProps,
  layoutId,
  stateKey,
  anchorRect,
  preset = 'base',
  motion = true,
  disabled = false,
  children,
}: MorphSurfaceProps) {
  const isDisabled = disabled || motion === false;
  const ref = useRef<HTMLDivElement>(null);
  const springRef = useRef<SpringRect | null>(null);
  const cancelRef = useRef<Cancel | null>(null);

  useIso(() => {
    const el = ref.current;
    if (!el) return;

    cancelRef.current?.();
    cancelRef.current = null;
    el.style.transform = '';
    el.style.transformOrigin = '';
    el.style.borderRadius = '';

    const next = readGeometry(el);
    const prev = anchorRect ?? geometryRegistry.get(layoutId);
    rememberGeometry(layoutId, next);

    if (!prev || isDisabled || !allowed('feedback', el) || next.width <= 0 || next.height <= 0) {
      springRef.current = null;
      return () => {
        if (ref.current) rememberGeometry(layoutId, readGeometry(ref.current));
      };
    }

    const dx = prev.x - next.x;
    const dy = prev.y - next.y;
    const dw = Math.abs(prev.width - next.width);
    const dh = Math.abs(prev.height - next.height);
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && dw < 0.5 && dh < 0.5) {
      return () => {
        if (ref.current) rememberGeometry(layoutId, readGeometry(ref.current));
      };
    }

    const t0 = now();
    const cfg = config('feedback', cfgOf(preset));
    const z = Math.max(0.7, Math.min(1, cfg.z ?? 1));
    let spring = springRef.current;
    if (spring) {
      spring.retarget(next, t0, cfg.w, z);
    } else {
      spring = new SpringRect(prev, t0, { w: cfg.w, zeta: z });
      spring.retarget(next, t0, cfg.w, z);
      springRef.current = spring;
    }

    const applySample = (t: number) => {
      const s = spring!.sample(t);
      const sx = next.width > 0 ? Math.max(0.01, s.width / next.width) : 1;
      const sy = next.height > 0 ? Math.max(0.01, s.height / next.height) : 1;
      const tx = s.x - next.x;
      const ty = s.y - next.y;
      el.style.transformOrigin = '0 0';
      el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
      if (s.radius > 0) {
        el.style.borderRadius = `${(s.radius / sx).toFixed(2)}px / ${(s.radius / sy).toFixed(2)}px`;
      }
      return s.moving;
    };

    applySample(t0);
    cancelRef.current = run({
      kind: 'feedback',
      step: applySample,
      finish: () => {
        cancelRef.current = null;
        springRef.current = null;
        el.style.transform = '';
        el.style.transformOrigin = '';
        el.style.borderRadius = '';
      },
    });

    return () => {
      if (ref.current) rememberGeometry(layoutId, readGeometry(ref.current));
      cancelRef.current?.();
      cancelRef.current = null;
    };
  }, [layoutId, stateKey, isDisabled]);

  return (
    <div
      ref={ref}
      data-morph-id={layoutId}
      data-motion={isDisabled ? 'off' : 'on'}
      className="cieo cieo-morph-surface"
      {...customizePart(slotProps?.root, 'cieo cieo-morph-surface', undefined, className)}
    >
      {children}
    </div>
  );
}
