'use client';
/* AvatarGroup (static). Decorative overlapping face stack for rows: up to `max` faces plus a +N disc. No hover fan-out here; the animated demo lives separately. The parent row owns the accessible name. */
import type { CSSProperties } from 'react';

export interface AvatarPerson {
  /** Full name, used by the row label (not rendered as text here). */
  name: string;
  /** 1–3 characters shown when there is no photo. Always required so exclusions render safely. */
  initials: string;
  /** Approved photo URL only. Omit when none exists; never guess a photo. */
  src?: string;
}

export interface AvatarGroupProps {
  people: AvatarPerson[];
  /** Max faces before collapsing into +N. Defaults to 4. */
  max?: number;
  size?: 'sm' | 'md';
  style?: CSSProperties;
}

export function AvatarGroup({ people, max = 4, size = 'md', style }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span aria-hidden="true" data-size={size} className="cieo cieo-avatar-group" style={style}>
      {shown.map((p) => (
        <span key={p.name} className="cieo-avatar" title={p.name}>
          {p.src ? <img src={p.src} alt="" loading="lazy" /> : <span className="cieo-avatar-initials">{p.initials}</span>}
        </span>
      ))}
      {rest > 0 ? <span className="cieo-avatar cieo-avatar-overflow">+{rest}</span> : null}
    </span>
  );
}
