'use client';
/* Button. Press feedback is a CSS transition on the snap spring, so it works before hydration. With `state`, the
   label blur-swaps to a spinner and then a check in place (surface and cart recipes) while the width springs to fit. */
import { forwardRef, useEffect, useLayoutEffect, useRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { S } from '../core/spring.js';
import { buttonClassName, type ButtonVariant, type ControlSize } from './classes.js';
import { CheckIcon, SpinnerIcon } from './icons.js';
import { Driver, px } from './motion.js';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export type ButtonState = 'idle' | 'pending' | 'done';

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ControlSize;
  block?: boolean;
  /** Leading icon, or the whole content of an icon-only button. */
  icon?: ReactNode;
  /** Opt into the morph: idle shows the label, pending a spinner, done a check. */
  state?: ButtonState;
  /** Announced while pending. */
  pendingLabel?: string;
  /** Shown next to the check and announced when done. Without it only the check shows and "Done" is announced. */
  doneLabel?: string;
}

type Base = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & ButtonOwnProps;
/** A text button has children; an icon-only button has an icon and must have an aria-label. */
export type ButtonProps = Base & ({ children: ReactNode } | { children?: undefined; icon: ReactNode; 'aria-label': string });

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { variant, size, block, icon, state, pendingLabel = 'Working', doneLabel, className, type, onClick, children, ...rest } = props;
  const iconOnly = children === undefined || children === null;
  const morph = state !== undefined;
  const busy = state === 'pending';
  const own = useRef<HTMLButtonElement | null>(null);
  const setRef = (el: HTMLButtonElement | null) => {
    own.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };
  const width = useRef<Driver | null>(null);

  /* Width morph: inactive layers are out of flow, so the natural width is the active layer's. Spring from the width
     on screen to the new natural width, then hand the width back to layout. The clear-plus-measure is one
     write/read pair (a single layout, only on state change while morphing); the from≈natural path below jumps
     the Driver without the extra px(from) write. */
  useIso(() => {
    const el = own.current;
    if (!el || !morph || block) return;
    const d = width.current;
    /* While animating, value is the width on screen; once settled it is the last natural width. */
    const from = d?.value;
    el.style.width = '';
    const natural = el.getBoundingClientRect().width;
    if (!d || from === undefined) {
      width.current = new Driver(natural, (v) => (el.style.width = px(v)), () => (el.style.width = ''));
      return;
    }
    if (Math.abs(from - natural) < 0.5) return d.to(natural, { jump: true });
    el.style.width = px(from);
    d.to(natural, { cfg: S.base, el });
  }, [state]);
  useEffect(() => () => width.current?.cancel(), []);

  const click = (e: MouseEvent<HTMLButtonElement>) => {
    if (busy || rest['aria-disabled'] === true || rest['aria-disabled'] === 'true') {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  const label = (
    <>
      {icon}
      {iconOnly ? null : <span className="cieo-btn-text">{children}</span>}
    </>
  );

  return (
    <button
      {...rest}
      ref={setRef}
      type={type ?? 'button'}
      className={buttonClassName({ variant, size, block, iconOnly, className })}
      data-state={morph ? state : undefined}
      aria-busy={busy || undefined}
      aria-disabled={busy ? true : rest['aria-disabled']}
      onClick={click}
    >
      {morph ? (
        <>
          <span className="cieo-layer" data-on={state === 'idle' || undefined} aria-hidden={state !== 'idle' || undefined}>
            {label}
          </span>
          <span className="cieo-layer" data-on={state === 'pending' || undefined} aria-hidden="true">
            <SpinnerIcon />
          </span>
          <span className="cieo-layer cieo-btn-done" data-on={state === 'done' || undefined} aria-hidden="true">
            <CheckIcon draw />
            {doneLabel ? <span className="cieo-btn-text">{doneLabel}</span> : null}
          </span>
          <span className="cieo-vh" role="status">
            {state === 'pending' ? pendingLabel : state === 'done' ? (doneLabel ?? 'Done') : ''}
          </span>
        </>
      ) : (
        label
      )}
    </button>
  );
});
