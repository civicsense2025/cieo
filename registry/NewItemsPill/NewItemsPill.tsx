// src/primitives/NewItemsPill/NewItemsPill.tsx
'use client';
/* NewItemsPill. A pill that drops in from the edge of a feed when new items arrive, rolls its count as more come, and leaves when there are none. The host owns the list and what "show" does. */
import { useEffect, useRef, useState } from 'react';
import { usePresence } from '../../react/index.js';
import { CompactCount } from '../CompactCount/CompactCount.js';

export type NewItemsPlacement = 'top' | 'bottom';

/** Default label: "1 new reply", "3 new replies". Bad counts read as zero. */
export function newItemsLabel(n: number): string {
  const whole = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  return `${new Intl.NumberFormat('en').format(whole)} new ${whole === 1 ? 'reply' : 'replies'}`;
}

/** Whole, non-negative count; anything else is 0. */
export function clampNewItems(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

/** What to announce: the label only when the pill first appears (0 to n), nothing on increments, and empty once it is gone. */
export function newItemsAnnouncement(prev: number, next: number, label: (n: number) => string): string | null {
  if (prev === 0 && next > 0) return label(next);
  if (next === 0) return '';
  return null;
}

/** Splits a label into the number that rolls and the words after it. Labels that do not start with the exact number show whole, without a roll. */
export function splitNewItemsLabel(text: string, n: number): { rolls: boolean; rest: string } {
  const exact = new Intl.NumberFormat('en').format(clampNewItems(n));
  return text.startsWith(exact) ? { rolls: true, rest: text.slice(exact.length) } : { rolls: false, rest: text };
}

export interface NewItemsPillProps {
  /** How many items are waiting. The pill shows while this is above zero. */
  count: number;
  /** Called when the pill is pressed; the host scrolls to or reveals the new items. */
  onShow: () => void;
  /** Full text for a count, read aloud and used as the accessible name. Defaults to "3 new replies". */
  label?: (n: number) => string;
  /** Which edge the pill drops in from. Defaults to top. */
  placement?: NewItemsPlacement;
}

export function NewItemsPill({ count, onShow, label = newItemsLabel, placement = 'top' }: NewItemsPillProps) {
  const n = clampNewItems(count);
  const edge: NewItemsPlacement = placement === 'bottom' ? 'bottom' : 'top';
  const last = useRef(n);
  if (n > 0) last.current = n;
  const { mounted, ref } = usePresence<HTMLButtonElement>(n > 0, { from: { y: edge === 'top' ? -24 : 24, scale: 1, opacity: 0 } });
  const [message, setMessage] = useState('');
  const prev = useRef(0);
  useEffect(() => {
    const next = newItemsAnnouncement(prev.current, n, label);
    prev.current = n;
    if (next !== null) setMessage(next);
    // label is intentionally read at announce time, not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);
  const shown = n > 0 ? n : last.current;
  const split = splitNewItemsLabel(label(shown), shown);
  return (
    <div className="cieo cieo-new-items-pill" data-placement={edge}>
      {mounted ? (
        <button ref={ref} type="button" className="cieo-new-items-pill-button" aria-label={label(shown)} onClick={onShow}>
          <span aria-hidden="true" className="cieo-new-items-pill-count">
            {split.rolls ? <CompactCount value={shown} hideZero={false} /> : null}
          </span>
          <span aria-hidden="true" className="cieo-new-items-pill-text">
            {split.rest}
          </span>
        </button>
      ) : null}
      <span className="cieo-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {message}
      </span>
    </div>
  );
}
