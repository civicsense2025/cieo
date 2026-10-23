// src/primitives/ReactionPicker/ReactionPicker.tsx
'use client';
/* ReactionPicker. A row of emoji buttons that reports one pick. The host owns where it sits (inline or inside a Popover) and what a pick means. */
import { useState } from 'react';
import { roveFocus } from '../../react/index.js';

export interface Reaction {
  /** Stable id the host stores (never the emoji itself). */
  id: string;
  /** The emoji character shown. */
  emoji: string;
  /** Plain-words name; the accessible name of the button. */
  label: string;
}

/** The default set, in the order people reach for them. */
export const DEFAULT_REACTIONS: readonly Reaction[] = [
  { id: 'like', emoji: '👍', label: 'Like' },
  { id: 'love', emoji: '❤️', label: 'Love' },
  { id: 'laugh', emoji: '😂', label: 'Funny' },
  { id: 'wow', emoji: '😮', label: 'Wow' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'thanks', emoji: '🙏', label: 'Thanks' },
];

export interface ReactionPickerProps {
  /** Called with the id of the reaction the person picked. */
  onPick(id: string): void;
  /** Reactions to offer. Defaults to DEFAULT_REACTIONS. */
  reactions?: readonly Reaction[];
  /** Accessible name of the toolbar. Defaults to "Add a reaction". */
  label?: string;
  /** Ids already chosen by this person; those buttons report aria-pressed. */
  selected?: readonly string[];
}

/** Index that holds the roving tab stop: the first selected reaction, else the first. */
export function pickerStartIndex(reactions: readonly Reaction[], selected: readonly string[] = []): number {
  const at = reactions.findIndex((r) => selected.includes(r.id));
  return at < 0 ? 0 : at;
}

export function ReactionPicker({ onPick, reactions = DEFAULT_REACTIONS, label = 'Add a reaction', selected = [] }: ReactionPickerProps) {
  const [active, setActive] = useState(() => pickerStartIndex(reactions, selected));
  const tab = Math.min(active, Math.max(0, reactions.length - 1));
  return (
    <div
      className="cieo cieo-reaction-picker"
      role="toolbar"
      aria-label={label}
      aria-orientation="horizontal"
      onKeyDown={(e) => {
        roveFocus(e, e.currentTarget, 'button', { orientation: 'horizontal' });
      }}
    >
      {reactions.map((r, i) => (
        <button
          key={r.id}
          type="button"
          className="cieo-reaction-picker-item"
          aria-label={r.label}
          aria-pressed={selected.includes(r.id)}
          title={r.label}
          tabIndex={i === tab ? 0 : -1}
          style={{ ['--cieo-i' as string]: i }}
          onFocus={() => setActive(i)}
          onClick={() => onPick(r.id)}
        >
          <span aria-hidden="true" className="cieo-reaction-picker-emoji">{r.emoji}</span>
        </button>
      ))}
    </div>
  );
}
