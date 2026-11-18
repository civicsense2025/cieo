'use client';
/* Button. Press feedback is a CSS transition on the snap spring, so it works before hydration. With `state`, the
   label blur-swaps to pending/done/failed/uncertain layers in place while the width springs to fit. */
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { S } from '../core/spring.js';
import { buttonClassName, type ButtonShape, type ButtonSize, type ButtonTone, type ButtonVariant } from './classes.js';
import { AlertIcon, CheckIcon, SpinnerIcon } from './icons.js';
import { Driver, px } from './motion.js';
import { customizeControlPart, type ControlPartProps } from './parts.js';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export type ButtonState = 'idle' | 'pending' | 'done' | 'succeeded' | 'failed' | 'uncertain';
export type { ButtonTone, ButtonSize };

export interface ButtonSlotProps {
  root?: ControlPartProps;
  text?: ControlPartProps;
  pending?: ControlPartProps;
  done?: ControlPartProps;
  failed?: ControlPartProps;
  uncertain?: ControlPartProps;
}

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Semantic tone for destructive, confirmation, or caution actions. */
  tone?: ButtonTone;
  /** Pill (fully rounded) shape for compact product bars. Defaults to rect. */
  shape?: ButtonShape;
  block?: boolean;
  /** Polymorphic child rendering: merges button classes, ARIA, ref, and handlers onto the single child element. */
  asChild?: boolean;
  /** Leading icon, or the whole content of an icon-only button. */
  icon?: ReactNode;
  /** Opt into the morph: idle, pending, done/succeeded, failed, or uncertain. */
  state?: ButtonState;
  /** Announced while pending. */
  pendingLabel?: string;
  /** Shown next to the check and announced when done/succeeded. */
  doneLabel?: string;
  /** Shown next to the alert icon and announced when failed. */
  failedLabel?: string;
  /** Shown next to the alert icon and announced when uncertain. */
  uncertainLabel?: string;
  slotProps?: ButtonSlotProps;
}

type Base = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & ButtonOwnProps;
/** A text button has children; an icon-only button has an icon and must have an aria-label. */
export type ButtonProps = Base & ({ children: ReactNode } | { children?: undefined; icon: ReactNode; 'aria-label': string });

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const {
    variant,
    size,
    tone,
    shape,
    block,
    asChild = false,
    icon,
    state,
    pendingLabel = 'Working',
    doneLabel,
    failedLabel,
    uncertainLabel = 'Sending could not be confirmed',
    slotProps,
    className,
    type,
    onClick,
    children,
    ...rest
  } = props;

  const iconOnly = !asChild && (children === undefined || children === null);
  const morph = state !== undefined;
  const busy = state === 'pending';
  const isDone = state === 'done' || state === 'succeeded';
  const isFailed = state === 'failed';
  const isUncertain = state === 'uncertain';

  const own = useRef<HTMLElement | null>(null);
  const setRef = (el: HTMLElement | null) => {
    own.current = el;
    if (typeof ref === 'function') ref(el as HTMLButtonElement | null);
    else if (ref) (ref as { current: HTMLButtonElement | null }).current = el as HTMLButtonElement | null;
  };
  const width = useRef<Driver | null>(null);

  useIso(() => {
    const el = own.current;
    if (!el || !morph || block) return;
    const d = width.current;
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

  const rootClass = buttonClassName({ variant, size, tone, shape, block, iconOnly, className });
  const renderLabel = (content: ReactNode) => (
    <>
      {icon}
      {iconOnly ? null : <span className="cieo-btn-text" {...customizeControlPart(slotProps?.text, 'cieo-btn-text')}>{content}</span>}
    </>
  );

  const renderBody = (content: ReactNode) =>
    morph ? (
      <>
        <span className="cieo-layer" data-on={state === 'idle' || undefined} aria-hidden={state !== 'idle' || undefined}>
          {renderLabel(content)}
        </span>
        <span className="cieo-layer" data-on={busy || undefined} aria-hidden="true" {...customizeControlPart(slotProps?.pending, 'cieo-layer')}>
          <SpinnerIcon />
        </span>
        <span className="cieo-layer cieo-btn-done" data-on={isDone || undefined} aria-hidden="true" {...customizeControlPart(slotProps?.done, 'cieo-layer cieo-btn-done')}>
          <CheckIcon draw />
          {doneLabel ? <span className="cieo-btn-text" {...customizeControlPart(slotProps?.text, 'cieo-btn-text')}>{doneLabel}</span> : null}
        </span>
        <span className="cieo-layer cieo-btn-failed" data-on={isFailed || undefined} aria-hidden="true" {...customizeControlPart(slotProps?.failed, 'cieo-layer cieo-btn-failed')}>
          <AlertIcon />
          {failedLabel ? <span className="cieo-btn-text" {...customizeControlPart(slotProps?.text, 'cieo-btn-text')}>{failedLabel}</span> : null}
        </span>
        <span className="cieo-layer cieo-btn-uncertain" data-on={isUncertain || undefined} aria-hidden="true" {...customizeControlPart(slotProps?.uncertain, 'cieo-layer cieo-btn-uncertain')}>
          <AlertIcon />
          <span className="cieo-btn-text" {...customizeControlPart(slotProps?.text, 'cieo-btn-text')}>{uncertainLabel}</span>
        </span>
        <span className="cieo-vh" role="status">
          {busy ? pendingLabel : isDone ? (doneLabel ?? 'Done') : isFailed ? (failedLabel ?? 'Failed') : isUncertain ? uncertainLabel : ''}
        </span>
      </>
    ) : (
      renderLabel(content)
    );

  const customizedRoot = customizeControlPart(slotProps?.root, rootClass, rest.style);

  if (asChild && Children.count(children) === 1 && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childRef = (child.props as { ref?: Ref<HTMLElement> }).ref ?? (child as unknown as { ref?: Ref<HTMLElement> }).ref;
    const mergedClass = [customizedRoot.className ?? rootClass, child.props.className as string | undefined].filter(Boolean).join(' ');
    const mergedStyle = customizedRoot.style || child.props.style
      ? { ...(customizedRoot.style as CSSProperties | undefined), ...(child.props.style as CSSProperties | undefined) }
      : undefined;
    const childClick = child.props.onClick as ((e: MouseEvent<HTMLButtonElement>) => void) | undefined;
    const isDisabled = Boolean(
      busy ||
      rest.disabled ||
      rest['aria-disabled'] === true ||
      rest['aria-disabled'] === 'true' ||
      child.props.disabled ||
      child.props['aria-disabled'] === true ||
      child.props['aria-disabled'] === 'true',
    );
    return cloneElement(child, {
      ...rest,
      ...customizedRoot,
      ...child.props,
      className: mergedClass,
      style: mergedStyle,
      'data-state': morph ? state : undefined,
      'data-tone': tone,
      'aria-busy': busy || undefined,
      'aria-disabled': isDisabled || undefined,
      tabIndex: isDisabled ? -1 : ((child.props.tabIndex as number | undefined) ?? rest.tabIndex),
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        if (isDisabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        childClick?.(e);
        onClick?.(e);
      },
      ref: (el: HTMLElement | null) => {
        setRef(el);
        if (typeof childRef === 'function') childRef(el);
        else if (childRef && typeof childRef === 'object') (childRef as { current: HTMLElement | null }).current = el;
      },
      children: morph || icon ? renderBody(child.props.children as ReactNode) : child.props.children,
    });
  }

  return (
    <button
      {...rest}
      ref={setRef}
      type={type ?? 'button'}
      className={rootClass}
      data-state={morph ? state : undefined}
      data-tone={tone}
      aria-busy={busy || undefined}
      aria-disabled={busy ? true : rest['aria-disabled']}
      onClick={click}
      {...customizedRoot}
    >
      {renderBody(children)}
    </button>
  );
});
