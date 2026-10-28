// src/primitives/FollowButton/FollowButton.tsx
'use client';
/* FollowButton. Filled "Follow" that becomes an outlined "Following"; hovering or focusing "Following" previews "Unfollow". The host owns the follow state. */
import { useLayoutEffect, useRef, useState } from 'react';
import { SwapText, useSpring } from '../../react/index.js';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';

/** Visible label for the button. `previewing` only matters while following: it shows the action a press would take. */
export function followLabel(following: boolean, previewing: boolean): 'Follow' | 'Following' | 'Unfollow' {
  if (!following) return 'Follow';
  return previewing ? 'Unfollow' : 'Following';
}

export interface FollowButtonProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** Whether the viewer follows the person right now. */
  following: boolean;
  /** Called on every press; the host flips `following`. */
  onToggle: () => void;
  /** Who is being followed, for the accessible name ("Follow Ava"). Optional. */
  name?: string;
  /** Control height. Defaults to md. */
  size?: 'sm' | 'md';
}

/** Drives the button's width toward `target`; mounted only once the first measurement exists so it never animates in from zero. */
function WidthSpring({ target, element }: { target: number; element: React.RefObject<HTMLElement | null> }) {
  useSpring(target, (v) => { if (element.current) element.current.style.width = `${v}px`; }, { preset: 'base' });
  return null;
}

export function FollowButton({ className, slotProps, following, onToggle, name, size = 'md' }: FollowButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [settled, setSettled] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const previewing = following && !settled && (hover || focus);
  const text = followLabel(following, previewing);

  useLayoutEffect(() => {
    const button = ref.current;
    const probe = measure.current;
    if (!button || !probe) return;
    const css = getComputedStyle(button);
    const chrome = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'].reduce((sum, k) => sum + (parseFloat(css[k as 'paddingLeft']) || 0), 0);
    const next = Math.ceil(probe.getBoundingClientRect().width + chrome);
    if (next > 0) setWidth(next);
  }, [text, size]);

  return (
    <button
      ref={ref}
      type="button"
      className="cieo cieo-follow-button"
      aria-label={`${text}${name ? ` ${name}` : ''}`}
      data-following={following ? '' : undefined}
      data-previewing={previewing ? '' : undefined}
      data-size={size}
      onClick={() => {
        setSettled(true);
        onToggle();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setSettled(false); }}
      onFocus={() => setFocus(true)}
      onBlur={() => { setFocus(false); setSettled(false); }} {...customizePart(slotProps?.root, "cieo cieo-follow-button", undefined, className)}
    >
      <SwapText value={text} />
      <span ref={measure} className="cieo-follow-button-measure" aria-hidden="true">{text}</span>
      {width !== null ? <WidthSpring target={width} element={ref} /> : null}
    </button>
  );
}
