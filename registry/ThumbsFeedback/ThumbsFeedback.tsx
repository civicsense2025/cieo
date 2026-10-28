// src/primitives/ThumbsFeedback/ThumbsFeedback.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* ThumbsFeedback. "Was this helpful?" as a short ask, an optional detail step with reasons and a comment, then a thank-you. The host owns what happens to the result. */
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { SwapText, roveFocus, useSpring, useSwap } from '../../react/index.js';

export type ThumbValue = 'up' | 'down';
export type ThumbsStep = 'ask' | 'detail' | 'done';

export interface ThumbsState {
  step: ThumbsStep;
  value: ThumbValue | null;
}

export type ThumbsEvent =
  | { type: 'rate'; value: ThumbValue; hasReasons: boolean }
  | { type: 'submit' }
  | { type: 'skip' };

export const THUMBS_INITIAL: ThumbsState = { step: 'ask', value: null };

/** Pure step machine. ask -> detail (or straight to done when that thumb has no reasons) -> done. Changing the thumb while in detail keeps the step. done is final. */
export function thumbsStep(state: ThumbsState, event: ThumbsEvent): ThumbsState {
  if (state.step === 'done') return state;
  if (event.type === 'rate') {
    if (state.step === 'detail') return { step: 'detail', value: event.value };
    return { step: event.hasReasons ? 'detail' : 'done', value: event.value };
  }
  if (state.step === 'detail') return { step: 'done', value: state.value };
  return state;
}

export interface ThumbsResult {
  value: ThumbValue;
  reasons: string[];
  comment: string;
}

export interface ThumbsFeedbackProps {
  className?: string;
  slotProps?: { thumbsButtons?: PrimitivePartProps; thumbsThumb?: PrimitivePartProps; thumbsView?: PrimitivePartProps; thumbsQuestion?: PrimitivePartProps; thumbsHead?: PrimitivePartProps; thumbsReasons?: PrimitivePartProps; thumbsReason?: PrimitivePartProps; thumbsCommentLabel?: PrimitivePartProps; thumbsComment?: PrimitivePartProps; thumbsActions?: PrimitivePartProps; thumbsSubmit?: PrimitivePartProps; thumbsSkip?: PrimitivePartProps; thumbsThanks?: PrimitivePartProps; root?: PrimitivePartProps; thumbsPanel?: PrimitivePartProps; thumbsInner?: PrimitivePartProps; thumbsLeaving?: PrimitivePartProps; thumbsEntering?: PrimitivePartProps };

  /** The question. Defaults to "Was this helpful?". */
  question?: string;
  /** Called as soon as a thumb is pressed, before any detail. */
  onRate?: (value: ThumbValue) => void;
  /** Reason chips offered after each thumb. Omit or leave a list empty to skip the detail step for that thumb. */
  reasons?: { up: readonly string[]; down: readonly string[] };
  /** Called once with the final result: from Submit, from Skip (no reasons, empty comment), or straight after the thumb when that thumb has no reasons. */
  onSubmit(result: ThumbsResult): void;
  /** Thank-you text. Defaults to "Thanks for the feedback." */
  thanks?: string;
}

function Thumb({ dir }: { dir: ThumbValue }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={dir === 'down' ? { transform: 'scaleY(-1)' } : undefined}>
      <path d="M7 9v8H4V9h3zm0 0l3-6c1.4 0 2.2 1 2 2.3L11.6 8H16a1.5 1.5 0 0 1 1.5 1.8l-1 5.5A2 2 0 0 1 14.5 17H7" />
    </svg>
  );
}

function HeightDriver({ target, outer }: { target: number; outer: React.RefObject<HTMLElement | null> }) {
  useSpring(target, (v) => { if (outer.current) outer.current.style.height = `${v}px`; }, { preset: 'soft' });
  return null;
}

export function ThumbsFeedback({ className, slotProps, question = 'Was this helpful?', onRate, reasons, onSubmit, thanks = 'Thanks for the feedback.' }: ThumbsFeedbackProps) {
  const [state, setState] = useState<ThumbsState>(THUMBS_INITIAL);
  const [picked, setPicked] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const thanksRef = useRef<HTMLParagraphElement>(null);
  const first = useRef(true);
  const commentId = useId();
  const swap = useSwap<ThumbsStep>(state.step);
  const list = (v: ThumbValue | null) => (v && reasons ? reasons[v] : undefined) ?? [];

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (state.step === 'detail') outerRef.current?.querySelector<HTMLElement>('[data-view="detail"] .cieo-thumbs-reason')?.focus();
    if (state.step === 'done') thanksRef.current?.focus();
  }, [state.step]);

  const rate = (value: ThumbValue) => {
    if (state.step === 'done') return;
    const has = list(value).length > 0;
    if (state.value !== value) setPicked([]);
    setState((s) => thumbsStep(s, { type: 'rate', value, hasReasons: has }));
    onRate?.(value);
    if (state.step === 'ask' && !has) onSubmit({ value, reasons: [], comment: '' });
  };
  const finish = (send: boolean) => {
    if (state.step !== 'detail' || !state.value) return;
    setState((s) => thumbsStep(s, { type: send ? 'submit' : 'skip' }));
    onSubmit({ value: state.value, reasons: send ? picked : [], comment: send ? comment.trim() : '' });
  };

  const thumbs = (pressedValue: ThumbValue | null, locked: boolean) => (
    <div className="cieo-thumbs-buttons" role="group" aria-label={question} {...customizePart(slotProps?.thumbsButtons, "cieo-thumbs-buttons")}>
      {(['up', 'down'] as const).map((v) => (
        <button key={v} type="button" className="cieo-thumbs-thumb" aria-label={v === 'up' ? 'Yes, helpful' : 'No, not helpful'} aria-pressed={pressedValue === v} disabled={locked} onClick={() => rate(v)} {...customizePart(slotProps?.thumbsThumb, "cieo-thumbs-thumb")}>
          <Thumb dir={v} />
        </button>
      ))}
    </div>
  );

  const view = (step: ThumbsStep, live: boolean) => {
    if (step === 'ask') {
      return (
        <div className="cieo-thumbs-view" data-view="ask" {...customizePart(slotProps?.thumbsView, "cieo-thumbs-view")}>
          <p className="cieo-thumbs-question" {...customizePart(slotProps?.thumbsQuestion, "cieo-thumbs-question")}>{question}</p>
          {thumbs(null, !live)}
        </div>
      );
    }
    if (step === 'detail') {
      const chips = list(state.value);
      return (
        <div className="cieo-thumbs-view" data-view="detail" {...customizePart(slotProps?.thumbsView, "cieo-thumbs-view")}>
          <div className="cieo-thumbs-head" {...customizePart(slotProps?.thumbsHead, "cieo-thumbs-head")}>
            <p className="cieo-thumbs-question" {...customizePart(slotProps?.thumbsQuestion, "cieo-thumbs-question")}>{question}</p>
            {thumbs(state.value, !live)}
          </div>
          <div className="cieo-thumbs-reasons" role="group" aria-label="Reasons" onKeyDown={(e) => { roveFocus(e, e.currentTarget, 'button', { orientation: 'horizontal' }); }} {...customizePart(slotProps?.thumbsReasons, "cieo-thumbs-reasons")}>
            {chips.map((r) => (
              <button key={r} type="button" className="cieo-thumbs-reason" aria-pressed={picked.includes(r)} disabled={!live} onClick={() => setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]))} {...customizePart(slotProps?.thumbsReason, "cieo-thumbs-reason")}>
                {r}
              </button>
            ))}
          </div>
          <label className="cieo-thumbs-comment-label" htmlFor={`${commentId}-${live ? 'live' : 'old'}`} {...customizePart(slotProps?.thumbsCommentLabel, "cieo-thumbs-comment-label")}>Anything to add? (optional)</label>
          <textarea id={`${commentId}-${live ? 'live' : 'old'}`} className="cieo-thumbs-comment" rows={2} value={comment} disabled={!live} onChange={(e) => setComment(e.target.value)} {...customizePart(slotProps?.thumbsComment, "cieo-thumbs-comment")} />
          <div className="cieo-thumbs-actions" {...customizePart(slotProps?.thumbsActions, "cieo-thumbs-actions")}>
            <button type="button" className="cieo-thumbs-submit" disabled={!live} onClick={() => finish(true)} {...customizePart(slotProps?.thumbsSubmit, "cieo-thumbs-submit")}>Submit</button>
            <button type="button" className="cieo-thumbs-skip" disabled={!live} onClick={() => finish(false)} {...customizePart(slotProps?.thumbsSkip, "cieo-thumbs-skip")}>Skip</button>
          </div>
        </div>
      );
    }
    return (
      <div className="cieo-thumbs-view" data-view="done" {...customizePart(slotProps?.thumbsView, "cieo-thumbs-view")}>
        <p ref={live ? thanksRef : undefined} className="cieo-thumbs-thanks" tabIndex={live ? -1 : undefined} role={live ? 'status' : undefined} {...customizePart(slotProps?.thumbsThanks, "cieo-thumbs-thanks")}>
          <SwapText value={thanks} />
        </p>
      </div>
    );
  };

  return (
    <div className="cieo cieo-thumbs-feedback" data-step={state.step} data-value={state.value ?? undefined} {...customizePart(slotProps?.root, "cieo cieo-thumbs-feedback", undefined, className)}>
      <div ref={outerRef} className="cieo-thumbs-panel" {...customizePart(slotProps?.thumbsPanel, "cieo-thumbs-panel")}>
        {height !== null ? <HeightDriver target={height} outer={outerRef} /> : null}
        <div ref={innerRef} className="cieo-thumbs-inner" {...customizePart(slotProps?.thumbsInner, "cieo-thumbs-inner")}>
          {swap.leaving !== null ? (
            <div key={`o${swap.key}`} className="cieo-thumbs-leaving" aria-hidden="true" inert onAnimationEnd={(e) => { if (e.target === e.currentTarget) swap.done(swap.key); }} {...customizePart(slotProps?.thumbsLeaving, "cieo-thumbs-leaving")}>
              {view(swap.leaving, false)}
            </div>
          ) : null}
          <div key={`i${swap.key}`} className="cieo-thumbs-entering" data-swap={swap.leaving !== null ? '' : undefined} {...customizePart(slotProps?.thumbsEntering, "cieo-thumbs-entering")}>
            {view(swap.shown, true)}
          </div>
        </div>
      </div>
    </div>
  );
}
