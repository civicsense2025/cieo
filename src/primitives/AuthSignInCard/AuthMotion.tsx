'use client';
import { useLayoutEffect, useRef, useState, type AnimationEvent, type ReactNode, type RefObject } from 'react';
import { useReducedMotion, useSpring, useSwap } from '../../react/index.js';

const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function HeightSpring({ target, element }: { target: number; element: RefObject<HTMLDivElement | null> }) {
  useSpring(target, (value) => {
    if (element.current) element.current.style.blockSize = `${Math.max(0, value)}px`;
  }, { preset: 'soft', kind: 'feedback' });
  return null;
}

function HeightJump({ target, element }: { target: number; element: RefObject<HTMLDivElement | null> }) {
  useLayoutEffect(() => {
    if (element.current) element.current.style.blockSize = `${Math.max(0, target)}px`;
  }, [target, element]);
  return null;
}

export function useAuthMotionDisabled(element: RefObject<HTMLElement | null>): boolean {
  const [disabled, setDisabled] = useState(false);
  useLayoutEffect(() => {
    const sync = () => setDisabled(Boolean(element.current?.closest('[data-motion="off"], [data-motion="reduced"], [data-reduced-motion="true"]')));
    sync();
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['data-motion', 'data-reduced-motion'] });
    return () => observer.disconnect();
  }, [element]);
  return disabled;
}

export function AuthMotionFrame<T extends string>({ value, children, focus = FOCUSABLE }: { value: T; children: (value: T, live: boolean) => ReactNode; focus?: string | false }) {
  const { shown, leaving, key, done } = useSwap(value, 520);
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const previous = useRef(value);
  const [height, setHeight] = useState<number | null>(null);
  const localMotionDisabled = useAuthMotionDisabled(frame);
  const reducedMotion = useReducedMotion();
  const motionDisabled = localMotionDisabled || reducedMotion;

  useLayoutEffect(() => {
    const element = inner.current;
    if (!element) return;
    const measure = () => setHeight(element.offsetHeight);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (Object.is(previous.current, value)) return;
    previous.current = value;
    const pane = inner.current?.querySelector<HTMLElement>('[data-auth-motion-phase="enter"]') ?? inner.current?.querySelector<HTMLElement>('[data-auth-motion-phase="rest"]');
    const target = focus === false ? null : pane?.querySelector<HTMLElement>(focus) ?? pane;
    target?.focus({ preventScroll: true });
  }, [value, focus]);

  useLayoutEffect(() => {
    if (motionDisabled && leaving !== null) done(key);
  }, [motionDisabled, leaving, key, done]);

  const phase = (candidate: T) => leaving === candidate ? 'leave' : leaving !== null && shown === candidate ? 'enter' : 'rest';
  const onEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) done(key);
  };

  return (
    <div ref={frame} className="cieo-auth-motion-frame" data-auth-motion-frame="">
      {height !== null ? motionDisabled ? <HeightJump target={height} element={frame} /> : <HeightSpring target={height} element={frame} /> : null}
      <div ref={inner} className="cieo-auth-motion-inner">
        {leaving !== null ? (
          <div key={`out-${key}`} className="cieo-auth-motion-pane" data-auth-motion-pane="" data-auth-motion-phase={phase(leaving)} aria-hidden="true" inert onAnimationEnd={onEnd}>
            {children(leaving, false)}
          </div>
        ) : null}
        <div key={`in-${key}`} className="cieo-auth-motion-pane" data-auth-motion-pane="" data-auth-motion-phase={phase(shown)}>
          {children(shown, true)}
        </div>
      </div>
    </div>
  );
}

export function AuthSwapText({ value }: { value: string | number }) {
  const { shown, leaving, key, done } = useSwap(value, 520);
  const root = useRef<HTMLSpanElement>(null);
  const localMotionDisabled = useAuthMotionDisabled(root);
  const reducedMotion = useReducedMotion();
  const motionDisabled = localMotionDisabled || reducedMotion;
  useLayoutEffect(() => {
    if (motionDisabled && leaving !== null) done(key);
  }, [motionDisabled, leaving, key, done]);
  return (
    <span ref={root} className="cieo-swap cieo-auth-swap">
      {leaving !== null ? <span key={`out-${key}`} className="cieo-swap-out cieo-auth-swap-out" aria-hidden="true" onAnimationEnd={(event) => { if (event.target === event.currentTarget) done(key); }}>{leaving}</span> : null}
      <span key={`in-${key}`} className="cieo-swap-in cieo-auth-swap-in" data-swap={leaving !== null ? '' : undefined}>{shown}</span>
    </span>
  );
}

export function AuthMotionMessage({ id, value, className, role }: { id?: string; value?: string; className: string; role?: 'alert' | 'status' }) {
  const text = value ?? '';
  const { shown, leaving, key, done } = useSwap(text, 520);
  const root = useRef<HTMLSpanElement>(null);
  const localMotionDisabled = useAuthMotionDisabled(root);
  const reducedMotion = useReducedMotion();
  const motionDisabled = localMotionDisabled || reducedMotion;
  const open = Boolean(shown || leaving);
  useLayoutEffect(() => {
    if (motionDisabled && leaving !== null) done(key);
  }, [motionDisabled, leaving, key, done]);
  return (
    <span ref={root} id={id} className={`cieo-auth-motion-message ${className}`} data-open={open ? '' : undefined} role={role} aria-live={role === 'status' ? 'polite' : undefined} aria-atomic={role ? 'true' : undefined}>
      <span className="cieo-swap cieo-auth-swap cieo-auth-motion-message-inner">
        {leaving ? <span key={`out-${key}`} className="cieo-swap-out cieo-auth-swap-out" aria-hidden="true" onAnimationEnd={(event) => { if (event.target === event.currentTarget) done(key); }}>{leaving}</span> : null}
        <span key={`in-${key}`} className="cieo-swap-in cieo-auth-swap-in" data-swap={leaving !== null ? '' : undefined}>{shown}</span>
      </span>
    </span>
  );
}
