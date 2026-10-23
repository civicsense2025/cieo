// src/primitives/CountButton/CountButton.tsx
'use client';
/* CountButton. Ghost icon button with a rolling count: a toggle (like, repost) when `pressed` is given, a plain action (reply, share) otherwise. The host owns the state and the number. */
import { useRef, useState, type ReactNode } from 'react';
import { useReducedMotion, useSpring } from '../../react/index.js';
import { CompactCount, formatExactCount } from '../CompactCount/CompactCount.js';

export type CountButtonTone = 'neutral' | 'accent' | 'danger' | 'success';

/** Accessible name that carries the exact count: "Like, 164 likes". A zero, missing or invalid count gives just the label. */
export function countButtonLabel(label: string, count?: number, unit?: string): string {
  if (typeof count !== 'number' || !Number.isFinite(count) || Math.floor(count) <= 0) return label;
  return `${label}, ${formatExactCount(count)}${unit ? ` ${unit}` : ''}`;
}

/** Scale the icon dips to on press before settling back to 1. */
export const COUNT_BUTTON_DIP = 0.8;

export interface CountButtonProps {
  /** Icon shown when the action is off (or always, for plain actions). Decorative; the label names the button. */
  icon: ReactNode;
  /** Icon that fades in over `icon` while pressed (e.g. a filled heart). Optional. */
  activeIcon?: ReactNode;
  /** What the button does, as a verb: "Like", "Reply". Required; becomes the accessible name with the count. */
  label: string;
  /** Exact count. Zero or missing shows no number. */
  count?: number;
  /** Word read after the exact count: "likes", "replies". */
  countUnit?: string;
  /** Pressed state. When defined the button is a toggle (aria-pressed); when undefined it is a plain action. */
  pressed?: boolean;
  /** Called on every press. Toggles should flip `pressed` in the host. */
  onPress?: () => void;
  /** Color the pressed (or hovered) state takes. Defaults to neutral. */
  tone?: CountButtonTone;
  /** Control height. Defaults to md. */
  size?: 'sm' | 'md';
  /** Disables the button. */
  disabled?: boolean;
}

export function CountButton({ icon, activeIcon, label, count, countUnit, pressed, onPress, tone = 'neutral', size = 'md', disabled }: CountButtonProps) {
  const reduced = useReducedMotion();
  const iconRef = useRef<HTMLSpanElement>(null);
  const [dip, setDip] = useState(false);
  useSpring(dip ? COUNT_BUTTON_DIP : 1, (v) => { if (iconRef.current) iconRef.current.style.transform = v === 1 ? '' : `scale(${v})`; }, {
    preset: 'snap',
    onSettle: (v) => { if (v < 1) setDip(false); },
  });
  const toggle = pressed !== undefined;
  return (
    <button
      type="button"
      className="cieo cieo-count-button"
      aria-label={countButtonLabel(label, count, countUnit)}
      aria-pressed={toggle ? pressed : undefined}
      data-tone={tone}
      data-size={size}
      data-pressed={toggle && pressed ? '' : undefined}
      data-has-active-icon={activeIcon !== undefined ? '' : undefined}
      disabled={disabled}
      onClick={() => {
        if (!reduced) setDip(true);
        onPress?.();
      }}
    >
      <span className="cieo-count-button-icon" ref={iconRef} aria-hidden="true">
        <span className="cieo-count-button-glyph" data-glyph="base">{icon}</span>
        {activeIcon !== undefined ? <span className="cieo-count-button-glyph" data-glyph="active">{activeIcon}</span> : null}
      </span>
      {count !== undefined ? (
        <span className="cieo-count-button-count" aria-hidden="true">
          <CompactCount value={count ?? 0} unit={countUnit} />
        </span>
      ) : null}
    </button>
  );
}
