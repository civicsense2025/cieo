import { useEffect, useRef, type RefObject } from 'react';

export type RoveKey = 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End';

/** Next index for a roving-focus key, or null when the key does not move focus. Wraps at both ends unless loop is false. */
export function roveIndex(key: string, current: number, count: number, opts: { orientation?: 'horizontal' | 'vertical' | 'both'; loop?: boolean } = {}): number | null {
  if (count <= 0) return null;
  const { orientation = 'vertical', loop = true } = opts;
  const prev = (orientation === 'vertical' && key === 'ArrowUp') || (orientation === 'horizontal' && key === 'ArrowLeft') || (orientation === 'both' && (key === 'ArrowUp' || key === 'ArrowLeft'));
  const next = (orientation === 'vertical' && key === 'ArrowDown') || (orientation === 'horizontal' && key === 'ArrowRight') || (orientation === 'both' && (key === 'ArrowDown' || key === 'ArrowRight'));
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (!prev && !next) return null;
  if (current < 0) return prev ? count - 1 : 0;
  const to = current + (next ? 1 : -1);
  if (to < 0) return loop ? count - 1 : 0;
  if (to >= count) return loop ? 0 : count - 1;
  return to;
}

/** Enabled elements matching selector inside container, in document order. */
export function enabledIn(container: Element | null, selector: string): HTMLElement[] {
  if (!container) return [];
  return [...container.querySelectorAll<HTMLElement>(selector)].filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true');
}

/** Moves focus among `selector` items in response to a roving key; returns true when it handled the key. */
export function roveFocus(event: { key: string; preventDefault(): void }, container: Element | null, selector: string, opts?: { orientation?: 'horizontal' | 'vertical' | 'both'; loop?: boolean; activate?: boolean }): boolean {
  const items = enabledIn(container, selector);
  const active = typeof document === 'undefined' ? null : document.activeElement;
  const to = roveIndex(event.key, active ? items.findIndex((el) => el === active || el.contains(active)) : -1, items.length, opts);
  if (to === null) return false;
  event.preventDefault();
  items[to]?.focus();
  if (opts?.activate) items[to]?.click();
  return true;
}

/** While open, calls onDismiss for Escape and for presses outside every inside ref. Listeners are removed on close and unmount. */
export function useDismiss(open: boolean, onDismiss: (reason: 'escape' | 'outside') => void, inside: Array<RefObject<Element | null>>, opts: { escape?: boolean; outside?: boolean } = {}): void {
  const latest = useRef({ onDismiss, inside });
  latest.current = { onDismiss, inside };
  const { escape = true, outside = true } = opts;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) latest.current.onDismiss('escape');
    };
    const onPress = (e: Event) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (latest.current.inside.some((ref) => ref.current?.contains(target))) return;
      latest.current.onDismiss('outside');
    };
    if (escape) document.addEventListener('keydown', onKey);
    if (outside) document.addEventListener('pointerdown', onPress);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPress);
    };
  }, [open, escape, outside]);
}
