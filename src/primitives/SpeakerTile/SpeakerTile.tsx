// src/primitives/SpeakerTile/SpeakerTile.tsx
'use client';
/* SpeakerTile. One person in a live audio room: avatar, name, a ring that swells with their voice, and badges for muted and raised hand. The host owns the audio and passes the level. */
import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useSpring } from '../../react/index.js';

export type SpeakerRole = 'host' | 'speaker' | 'listener';

const clamp01 = (n: number): number => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

/** Speaking threshold with hysteresis so the ring does not flicker: on above 0.12, off below 0.06, otherwise unchanged. */
export function speakingStep(prev: boolean, level: number): boolean {
  const l = clamp01(level);
  if (prev) return l >= 0.06;
  return l > 0.12;
}

/** Screen-reader sentence for a tile: "Ava, host, speaking" or "Ben, muted, hand raised". Muted people are never described as speaking. */
export function speakerLabel(o: { name: string; role?: SpeakerRole; muted?: boolean; speaking?: boolean; handRaised?: boolean }): string {
  return [o.name, o.role, o.muted ? 'muted' : o.speaking ? 'speaking' : '', o.handRaised ? 'hand raised' : ''].filter(Boolean).join(', ');
}

export interface SpeakerTileProps {
  /** Display name, shown under the avatar and read aloud. */
  name: string;
  /** Avatar node (usually an Avatar). Hidden from assistive tech; the tile's own text names the person. */
  avatar: ReactNode;
  /** Live loudness, 0 to 1. The ring follows it on a spring. */
  level?: number;
  /** Shows a muted badge and keeps the ring still. */
  muted?: boolean;
  /** Role in the room; read aloud and exposed as data-role. */
  role?: SpeakerRole;
  /** Shows a raised-hand badge. */
  handRaised?: boolean;
  /** Tile size. Defaults to md. */
  size?: 'sm' | 'md' | 'lg';
}

export function SpeakerTile({ name, avatar, level = 0, muted = false, role, handRaised = false, size = 'md' }: SpeakerTileProps) {
  const heard = muted ? 0 : clamp01(level);
  const was = useRef(false);
  const speaking = speakingStep(was.current, heard);
  was.current = speaking;
  const ring = useRef<HTMLSpanElement>(null);
  /* Inline style is written once; after that the spring owns the vars so React never fights it. */
  const seed = useRef({ '--cieo-ring-scale': (1 + heard * 0.22).toFixed(3), '--cieo-ring-opacity': Math.min(1, heard * 2.5).toFixed(3) } as CSSProperties);
  useSpring(heard, (v) => {
    const el = ring.current;
    if (!el) return;
    el.style.setProperty('--cieo-ring-scale', (1 + v * 0.22).toFixed(3));
    el.style.setProperty('--cieo-ring-opacity', Math.min(1, v * 2.5).toFixed(3));
  });
  return (
    <div className="cieo cieo-speaker-tile" data-size={size} data-role={role} data-speaking={speaking ? '' : undefined} data-muted={muted ? '' : undefined} data-hand-raised={handRaised ? '' : undefined}>
      <span className="cieo-sr-only">{speakerLabel({ name, role, muted, speaking, handRaised })}</span>
      <span className="cieo-speaker-tile-face" aria-hidden="true">
        <span ref={ring} className="cieo-speaker-tile-ring" style={seed.current} />
        <span className="cieo-speaker-tile-avatar">{avatar}</span>
        {muted ? (
          <span className="cieo-speaker-tile-badge" data-badge="muted">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V5a3 3 0 0 0-5.9-.8M5 11a7 7 0 0 0 11.2 5.6M19 11a7 7 0 0 1-.6 2.8M12 18v3M3 3l18 18" />
            </svg>
          </span>
        ) : null}
        {handRaised ? (
          <span className="cieo-speaker-tile-badge" data-badge="hand">
            {'✋'}
          </span>
        ) : null}
      </span>
      <span className="cieo-speaker-tile-name" aria-hidden="true">
        {name}
      </span>
    </div>
  );
}
