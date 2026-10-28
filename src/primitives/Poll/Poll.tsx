// src/primitives/Poll/Poll.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* Poll. One question, several options. Before a vote each option is a button; after a vote (or when closed) the same rows become result bars. The host owns the counts. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Digits, roveFocus, useSpring } from '../../react/index.js';
import { CompactCount } from '../CompactCount/CompactCount.js';

export interface PollOption {
  /** Stable id the host stores. */
  id: string;
  /** Text of the option. */
  label: string;
  /** Votes this option has, including the current person's. */
  votes: number;
}

/** Whole-number percentages that sum to exactly 100 (largest-remainder rounding; ties go to the earlier option). All zeros when there are no votes. */
export function pollPercentages(votes: readonly number[]): number[] {
  const clean = votes.map((v) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0));
  const total = clean.reduce((a, b) => a + b, 0);
  if (total === 0) return clean.map(() => 0);
  const exact = clean.map((v) => (v / total) * 100);
  const floors = exact.map(Math.floor);
  let left = 100 - floors.reduce((a, b) => a + b, 0);
  const order = exact.map((x, i) => ({ i, r: x - Math.floor(x) })).sort((a, b) => b.r - a.r || a.i - b.i);
  for (const { i } of order) {
    if (left <= 0) break;
    floors[i]! += 1;
    left -= 1;
  }
  return floors;
}

/** Sentence for the live region after a vote: "Vote counted. Option A leads with 54%." Ties and empty polls are named honestly. */
export function pollAnnouncement(options: readonly PollOption[]): string {
  const pct = pollPercentages(options.map((o) => o.votes));
  const top = Math.max(0, ...pct);
  if (top === 0) return 'Vote counted.';
  const leaders = options.filter((_, i) => pct[i] === top);
  if (leaders.length === 1) return `Vote counted. ${leaders[0]!.label} leads with ${top}%.`;
  return `Vote counted. ${leaders.map((o) => o.label).join(' and ')} are tied at ${top}%.`;
}

export interface PollProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps; question?: PrimitivePartProps; options?: PrimitivePartProps; total?: PrimitivePartProps; closed?: PrimitivePartProps; footnote?: PrimitivePartProps };

  /** The question, shown above the options and used as the group name. */
  question: string;
  /** The options, in display order. */
  options: readonly PollOption[];
  /** Id of the option this person chose, or null/undefined if they have not voted. */
  voted?: string | null;
  /** Called with the option id when the person votes. Shown results do not call it again. */
  onVote(id: string): void;
  /** True once voting is over; results show even without a vote. */
  closed?: boolean;
  /** Extra line under the total, such as who can see the votes or when it closes. */
  footnote?: ReactNode;
}

const STAGGER_MS = 50;
const STAGGER_CAP_MS = 300;

function PollRow({ option, pct, index, results, chosen, leader, onVote, tabbable }: { option: PollOption; pct: number; index: number; results: boolean; chosen: boolean; leader: boolean; onVote(id: string): void; tabbable: boolean }) {
  const fillRef = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(results);
  useEffect(() => {
    if (!results) return setRevealed(false);
    const id = setTimeout(() => setRevealed(true), Math.min(index * STAGGER_MS, STAGGER_CAP_MS));
    return () => clearTimeout(id);
  }, [results, index]);
  const shown = results && revealed ? pct : 0;
  useSpring(shown, (v) => fillRef.current?.style.setProperty('--cieo-poll-fill', `${v}%`), { preset: 'soft' });
  const body = (
    <>
      <span ref={fillRef} aria-hidden="true" className="cieo-poll-fill" style={{ ['--cieo-poll-fill' as string]: `${shown}%` }} />
      <span className="cieo-poll-label">{option.label}</span>
      {chosen ? (
        <span className="cieo-poll-check">
          <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-7" /></svg>
          <span className="cieo-sr-only">Your vote</span>
        </span>
      ) : null}
      <span aria-hidden="true" className="cieo-poll-percent"><Digits value={shown} />%</span>
      {results ? <span className="cieo-sr-only">{`${pct}%, ${option.votes} ${option.votes === 1 ? 'vote' : 'votes'}`}</span> : null}
    </>
  );
  return (
    <div
      role={results ? 'listitem' : 'presentation'}
      className="cieo-poll-option"
      data-state={results ? 'result' : 'choice'}
      data-chosen={chosen ? '' : undefined}
      data-leader={results && leader ? '' : undefined}
    >
      {results ? (
        <div className="cieo-poll-row">{body}</div>
      ) : (
        <button type="button" role="radio" aria-checked={false} className="cieo-poll-row" tabIndex={tabbable ? 0 : -1} onClick={() => onVote(option.id)}>
          {body}
        </button>
      )}
    </div>
  );
}

export function Poll({ className, slotProps, question, options, voted = null, onVote, closed = false, footnote }: PollProps) {
  const titleId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const results = closed || voted != null;
  const pct = pollPercentages(options.map((o) => o.votes));
  const top = Math.max(0, ...pct);
  const total = options.reduce((sum, o) => sum + (Number.isFinite(o.votes) && o.votes > 0 ? Math.floor(o.votes) : 0), 0);
  const [announce, setAnnounce] = useState('');
  const hadVote = useRef(voted != null);
  useEffect(() => {
    const has = voted != null;
    if (has && !hadVote.current) setAnnounce(pollAnnouncement(options));
    if (!has) setAnnounce('');
    hadVote.current = has;
  }, [voted]); // eslint-disable-line react-hooks/exhaustive-deps -- announce once per vote, not on every count change
  return (
    <div className="cieo cieo-poll" data-closed={closed ? '' : undefined} data-results={results ? '' : undefined} {...customizePart(slotProps?.root, "cieo cieo-poll", undefined, className)}>
      <p id={titleId} className="cieo-poll-question" {...customizePart(slotProps?.question, "cieo-poll-question")}>{question}</p>
      <div
        ref={groupRef}
        className="cieo-poll-options"
        role={results ? 'list' : 'radiogroup'}
        aria-labelledby={titleId}
        onKeyDown={results ? undefined : (e) => { roveFocus(e, groupRef.current, '[role="radio"]', { orientation: 'vertical' }); }} {...customizePart(slotProps?.options, "cieo-poll-options")}
      >
        {options.map((o, i) => (
          <PollRow
            key={o.id}
            option={o}
            pct={pct[i]!}
            index={i}
            results={results}
            chosen={voted === o.id}
            leader={top > 0 && pct[i] === top}
            onVote={onVote}
            tabbable={i === 0}
          />
        ))}
      </div>
      <p className="cieo-poll-total" {...customizePart(slotProps?.total, "cieo-poll-total")}>
        <CompactCount value={total} unit={total === 1 ? 'vote' : 'votes'} hideZero={false} />
        <span aria-hidden="true"> {total === 1 ? 'vote' : 'votes'}</span>
        {closed ? <span className="cieo-poll-closed" {...customizePart(slotProps?.closed, "cieo-poll-closed")}> · Closed</span> : null}
      </p>
      {footnote ? <p className="cieo-poll-footnote" {...customizePart(slotProps?.footnote, "cieo-poll-footnote")}>{footnote}</p> : null}
      <span className="cieo-sr-only" role="status" aria-live="polite">{announce}</span>
    </div>
  );
}
