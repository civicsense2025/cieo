// src/primitives/SeenBy/SeenBy.tsx
'use client';
/* SeenBy. Tiny overlapping faces of the people who have read a message, with a "+n" for the rest. The host owns who has read; a new reader slides in. */
import { useRef } from 'react';
import { useFlip } from '../../react/index.js';
import { listNames, type GroupAvatarPerson } from '../GroupAvatar/GroupAvatar.js';

/** Spoken line for readers: "Seen by Ava", "Seen by Ava and Ben", "Seen by Ava, Ben and 2 others". Empty for nobody. */
export function seenByLabel(names: readonly string[]): string {
  const who = listNames(names);
  return who ? `Seen by ${who}` : '';
}

export interface SeenByProps {
  /** People who have read, oldest reader first. Nothing renders when empty. */
  people: GroupAvatarPerson[];
  /** Faces shown before the rest collapse into "+n". Defaults to 3. */
  max?: number;
}

export function SeenBy({ people, max = 3 }: SeenByProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const limit = Math.max(1, Number.isFinite(max) ? Math.floor(max) : 3);
  const shown = people.slice(0, limit);
  const rest = people.length - shown.length;
  useFlip(ref, shown.map((p) => p.name).join('\u0000') + rest);
  if (people.length === 0) return null;
  const label = seenByLabel(people.map((p) => p.name));
  return (
    <span title={label} className="cieo cieo-seen-by">
      <span ref={ref} aria-hidden="true" className="cieo-seen-by-stack">
        {shown.map((p) => (
          <span key={p.name} className="cieo-seen-by-face">
            {p.src ? <img src={p.src} alt="" loading="lazy" /> : <span className="cieo-seen-by-initials">{p.initials}</span>}
          </span>
        ))}
        {rest > 0 ? (
          <span key="more" className="cieo-seen-by-face cieo-seen-by-more">
            +{rest}
          </span>
        ) : null}
      </span>
      <span className="cieo-sr-only">{label}</span>
    </span>
  );
}
