'use client';
/* StaggerGroup: bounded stagger across direct children using critically damped springs.
   Total stagger span never exceeds budgetMs (300 by default) regardless of item count. */
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { ARRIVE, S, type Preset, type SpringConfig } from '../../core/spring.js';
import { enter } from '../../dom/index.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const cfgOf = (p: Preset | SpringConfig): SpringConfig => (typeof p === 'string' ? S[p] : p);

/** Computes per-item stagger delays (in milliseconds) strictly bounded by `budgetMs`. */
export function computeStaggerDelays(count: number, stepMs = 40, budgetMs = 300): number[] {
  const n = Math.max(0, Math.floor(count));
  if (n === 0) return [];
  if (n === 1) return [0];
  const safeBudget = Math.max(0, budgetMs);
  const safeStep = Math.max(0, stepMs);
  const perItem = Math.min(safeStep, safeBudget / (n - 1));
  return Array.from({ length: n }, (_, i) => +(i * perItem).toFixed(4));
}

export interface StaggerGroupProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };
  /** Maximum total stagger window in milliseconds across all children. Defaults to 300. */
  budget?: number;
  /** Target delay step per item in milliseconds, compressed when needed to fit budget. Defaults to 40. */
  delay?: number;
  /** Vertical drift in pixels on arrival. Defaults to 6. */
  distance?: number;
  /** Spring preset or config. Defaults to base. */
  preset?: Preset | SpringConfig;
  /** Optional key that re-runs the staggered entrance when changed. */
  triggerKey?: string | number;
  /** False disables motion and renders end state immediately. Defaults to true. */
  motion?: boolean;
  /** Alias to disable motion. Defaults to false. */
  disabled?: boolean;
  children: ReactNode;
}

export function StaggerGroup({
  className,
  slotProps,
  budget = 300,
  delay = 40,
  distance = 6,
  preset = 'base',
  triggerKey,
  motion = true,
  disabled = false,
  children,
}: StaggerGroupProps) {
  const isDisabled = disabled || motion === false;
  const rootRef = useRef<HTMLDivElement>(null);

  useIso(() => {
    const root = rootRef.current;
    if (!root || isDisabled) return;
    const items = Array.from(root.children).filter((n): n is HTMLElement => n instanceof HTMLElement);
    if (items.length === 0) return;
    const clampedBudget = Math.min(300, Math.max(0, budget));
    const stepSeconds = items.length > 1 ? Math.min(Math.max(0, delay), clampedBudget / (items.length - 1)) / 1000 : 0;
    return enter(items, {
      stagger: stepSeconds,
      cfg: cfgOf(preset),
      from: { x: 0, y: distance, opacity: ARRIVE, scale: 1, blur: 0 },
    });
  }, [triggerKey, isDisabled, budget, delay, distance]);

  return (
    <div
      ref={rootRef}
      data-motion={isDisabled ? 'off' : 'on'}
      className="cieo cieo-stagger-group"
      {...customizePart(slotProps?.root, 'cieo cieo-stagger-group', undefined, className)}
    >
      {children}
    </div>
  );
}
