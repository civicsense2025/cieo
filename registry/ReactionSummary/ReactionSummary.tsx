// src/primitives/ReactionSummary/ReactionSummary.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ReactionSummary. Chips under a message or comment showing who reacted with what. The host owns the list; toggleReaction computes the next one. */
import { useEffect, useRef, useState } from 'react';
import { useFlip } from '../../react/index.js';
import { CompactCount } from '../CompactCount/CompactCount.js';
import { Popover } from '../Popover/Popover.js';
import { DEFAULT_REACTIONS, ReactionPicker, type Reaction } from '../ReactionPicker/ReactionPicker.js';

export interface ReactionTally extends Reaction {
  /** How many people used this reaction. */
  count: number;
  /** True when the current person is one of them. */
  mine?: boolean;
}

/** Next list after the current person toggles `id`. Off decrements and drops the chip at 0; on increments, or appends a new chip (count 1, mine). Never mutates. */
export function toggleReaction(list: readonly ReactionTally[], id: string, emoji?: string, label?: string): ReactionTally[] {
  const at = list.findIndex((r) => r.id === id);
  if (at < 0) return [...list, { id, emoji: emoji ?? id, label: label ?? id, count: 1, mine: true }];
  const r = list[at]!;
  if (r.mine) {
    const count = Math.max(0, r.count - 1);
    if (count === 0) return list.filter((_, i) => i !== at);
    return list.map((x, i) => (i === at ? { ...x, count, mine: false } : x));
  }
  return list.map((x, i) => (i === at ? { ...x, count: x.count + 1, mine: true } : x));
}

/** Accessible name of a chip: "Love, 3 people including you". */
export function reactionName(r: ReactionTally): string {
  const count = Math.max(0, Math.floor(Number.isFinite(r.count) ? r.count : 0));
  if (r.mine && count <= 1) return `${r.label}, just you`;
  const people = `${count} ${count === 1 ? 'person' : 'people'}`;
  return `${r.label}, ${people}${r.mine ? ' including you' : ''}`;
}

export interface ReactionSummaryProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; list?: PrimitivePartProps; slot?: PrimitivePartProps; chip?: PrimitivePartProps; emoji?: PrimitivePartProps; count?: PrimitivePartProps; add?: PrimitivePartProps };

  /** The chips to show, in display order. */
  reactions: readonly ReactionTally[];
  /** Called with a chip's id when the person presses it. */
  onToggle(id: string): void;
  /** When given, an add-reaction button opens a picker; called with the picked id. */
  onAdd?: (id: string) => void;
  /** Reactions the picker offers. Defaults to DEFAULT_REACTIONS. */
  available?: readonly Reaction[];
}

const SETTLE_MS = 400;

/** Which ids are new since the last list, and which chips just left (with their old index). Pure so it can be tested. */
export function reactionDiff(prev: readonly ReactionTally[], next: readonly ReactionTally[]): { entering: string[]; leaving: { at: number; chip: ReactionTally }[] } {
  const had = new Set(prev.map((r) => r.id));
  const has = new Set(next.map((r) => r.id));
  return {
    entering: next.filter((r) => !had.has(r.id)).map((r) => r.id),
    leaving: prev.flatMap((chip, at) => (has.has(chip.id) ? [] : [{ at, chip }])),
  };
}

export function ReactionSummary({ className, slotProps, reactions, onToggle, onAdd, available = DEFAULT_REACTIONS }: ReactionSummaryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const prev = useRef(reactions);
  const [entering, setEntering] = useState<readonly string[]>([]);
  const [leaving, setLeaving] = useState<{ at: number; chip: ReactionTally }[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const diff = reactionDiff(prev.current, reactions);
    prev.current = reactions;
    if (!diff.entering.length && !diff.leaving.length) return;
    setEntering(diff.entering);
    setLeaving(diff.leaving);
    const id = setTimeout(() => {
      setEntering([]);
      setLeaving([]);
    }, SETTLE_MS);
    return () => clearTimeout(id);
  }, [reactions]);
  const shown: { chip: ReactionTally; gone: boolean }[] = reactions.map((chip) => ({ chip, gone: false }));
  for (const l of leaving) shown.splice(Math.min(l.at, shown.length), 0, { chip: l.chip, gone: true });
  useFlip(listRef, shown.map((s) => s.chip.id).join('|'));
  const mine = reactions.filter((r) => r.mine).map((r) => r.id);
  return (
    <div ref={rootRef} className="cieo cieo-reaction-summary" role="group" aria-label="Reactions" {...customizePart(slotProps?.root, "cieo cieo-reaction-summary", undefined, className)}>
      <ul ref={listRef} className="cieo-reaction-summary-list" {...customizePart(slotProps?.list, "cieo-reaction-summary-list")}>
        {shown.map(({ chip, gone }) => (
          <li
            key={chip.id}
            className="cieo-reaction-summary-slot"
            data-entering={entering.includes(chip.id) ? '' : undefined}
            data-leaving={gone ? '' : undefined} {...customizePart(slotProps?.slot, "cieo-reaction-summary-slot")}
          >
            <button
              type="button"
              className="cieo-reaction-summary-chip"
              aria-label={reactionName(chip)}
              aria-pressed={!!chip.mine}
              data-mine={chip.mine ? '' : undefined}
              disabled={gone}
              tabIndex={gone ? -1 : undefined}
              onClick={() => onToggle(chip.id)} {...customizePart(slotProps?.chip, "cieo-reaction-summary-chip")}
            >
              <span aria-hidden="true" className="cieo-reaction-summary-emoji" {...customizePart(slotProps?.emoji, "cieo-reaction-summary-emoji")}>{chip.emoji}</span>
              <span aria-hidden="true" className="cieo-reaction-summary-count" {...customizePart(slotProps?.count, "cieo-reaction-summary-count")}>
                <CompactCount value={chip.count} hideZero={false} />
              </span>
            </button>
          </li>
        ))}
        {onAdd ? (
          <li className="cieo-reaction-summary-slot" {...customizePart(slotProps?.slot, "cieo-reaction-summary-slot")}>
            <Popover
              open={open}
              onOpenChange={setOpen}
              trigger={
                <button type="button" className="cieo-reaction-summary-add" aria-label="Add a reaction" {...customizePart(slotProps?.add, "cieo-reaction-summary-add")}>
                  <span aria-hidden="true">+</span>
                </button>
              }
            >
              <ReactionPicker
                reactions={available}
                selected={mine}
                onPick={(id) => {
                  setOpen(false);
                  onAdd(id);
                  rootRef.current?.querySelector<HTMLElement>('.cieo-reaction-summary-add')?.focus();
                }}
              />
            </Popover>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
