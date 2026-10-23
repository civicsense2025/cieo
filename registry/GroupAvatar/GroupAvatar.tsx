// src/primitives/GroupAvatar/GroupAvatar.tsx
'use client';
/* GroupAvatar. One circle that stands for a whole conversation: one to four faces packed inside it, or three plus a "+n" tile. The host owns the people; photos appear only when given. */

export interface GroupAvatarPerson {
  /** Full name, used for the spoken label. */
  name: string;
  /** 1–3 characters shown when there is no photo. */
  initials: string;
  /** Approved photo URL only. Omit when none exists; never guess a photo. */
  src?: string;
}

/** Names as a short phrase: "Ava", "Ava and Ben", "Ava, Ben and Cy", "Ava, Ben and 3 others". Blank names are ignored. */
export function listNames(names: readonly string[]): string {
  const list = names.map((n) => n.trim()).filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0]!;
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  if (list.length === 3) return `${list[0]}, ${list[1]} and ${list[2]}`;
  return `${list[0]}, ${list[1]} and ${list.length - 2} others`;
}

/** Spoken label for the whole group, e.g. "Ava, Ben and 3 others". */
export function groupAvatarLabel(names: readonly string[]): string {
  return listNames(names);
}

/** Which faces to draw and how many people hide behind a "+n" tile. Up to four people show as faces; five or more show three faces plus the tile. */
export function groupAvatarLayout<T>(people: readonly T[]): { faces: T[]; more: number } {
  if (people.length <= 4) return { faces: [...people], more: 0 };
  return { faces: people.slice(0, 3), more: people.length - 3 };
}

export interface GroupAvatarProps {
  /** The people in the conversation, most relevant first. */
  people: GroupAvatarPerson[];
  /** Footprint of the circle. Defaults to md. */
  size?: 'sm' | 'md' | 'lg';
}

export function GroupAvatar({ people, size = 'md' }: GroupAvatarProps) {
  if (people.length === 0) return null;
  const { faces, more } = groupAvatarLayout(people);
  const slots = faces.length + (more > 0 ? 1 : 0);
  return (
    <span role="img" aria-label={groupAvatarLabel(people.map((p) => p.name))} data-size={size} data-count={slots} className="cieo cieo-group-avatar">
      {faces.map((p, i) => (
        <span key={`${p.name}-${i}`} aria-hidden="true" className="cieo-group-avatar-face">
          {p.src ? <img src={p.src} alt="" loading="lazy" /> : <span className="cieo-group-avatar-initials">{p.initials}</span>}
        </span>
      ))}
      {more > 0 ? (
        <span aria-hidden="true" className="cieo-group-avatar-face cieo-group-avatar-more">
          +{more}
        </span>
      ) : null}
    </span>
  );
}
