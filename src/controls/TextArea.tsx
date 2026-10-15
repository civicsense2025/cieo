'use client';
/* TextArea: the field treatment on a native <textarea> that grows with its text on a height spring, between
   minRows and maxRows. An optional counter rolls only the digits that change. Without JavaScript it is a plain
   resizable textarea with `minRows` rows. */
import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type TextareaHTMLAttributes } from 'react';
import { S } from '../core/spring.js';
import { Digits } from '../react/index.js';
import { FieldFrame, useField, type FieldOwnProps } from './Field.js';
import { Driver, px } from './motion.js';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'prefix' | 'rows'> &
  FieldOwnProps & {
    minRows?: number;
    maxRows?: number;
    /** Show a rolling character count (with maxLength, shows count / max). */
    showCount?: boolean;
  };

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(props, ref) {
  const { label, description, error, status, validate, onStatusChange, prefix, suffix, className, placeholder, id, minRows = 3, maxRows = 12, showCount, onInput, ...rest } = props;
  const own = { label, description, error, status, validate, onStatusChange, prefix, suffix };
  const field = useField<HTMLTextAreaElement>(own, rest, id);
  const initial = String(rest.value ?? rest.defaultValue ?? '');
  const [count, setCount] = useState(initial.length);
  const height = useRef<Driver | null>(null);

  const setRef = (el: HTMLTextAreaElement | null) => {
    field.ref.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  /* Measure the content height with the box briefly at auto, clamp to the row limits, then spring there. */
  const grow = (jump: boolean) => {
    const el = field.ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const line = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    const was = el.style.height;
    el.style.height = 'auto';
    const content = el.scrollHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    el.style.height = was;
    const target = Math.min(Math.max(content, minRows * line + pad), maxRows * line + pad);
    el.style.overflowY = content > target + 1 ? 'auto' : 'hidden';
    if (!height.current) height.current = new Driver(target, (v) => (el.style.height = px(v)));
    height.current.to(target, { cfg: S.soft, jump, el });
  };

  useIso(() => grow(true), []);
  useIso(() => {
    if (rest.value !== undefined) {
      grow(false);
      setCount(String(rest.value).length);
    }
  }, [rest.value]);
  useEffect(() => () => height.current?.cancel(), []);
  useEffect(() => {
    const el = field.ref.current;
    const form = el?.form;
    if (!el || !form) return;
    // Reset fires before the browser restores defaultValue; cancelled resets do nothing.
    const reset = (event: Event) => {
      setTimeout(() => {
        if (event.defaultPrevented || field.ref.current !== el) return;
        setCount(el.value.length);
        grow(true);
      });
    };
    form.addEventListener('reset', reset);
    return () => form.removeEventListener('reset', reset);
  });

  const input = (e: FormEvent<HTMLTextAreaElement>) => {
    setCount(e.currentTarget.value.length);
    grow(false);
    onInput?.(e);
  };

  const footer = showCount ? (
    <span className="cieo-field-count" aria-hidden="true">
      <Digits value={count} />
      {rest.maxLength ? <span>&thinsp;/&thinsp;{rest.maxLength}</span> : null}
    </span>
  ) : null;

  return (
    <FieldFrame kind="textarea" own={own} field={field} floated={!!placeholder} className={className} footer={footer}>
      <textarea
        {...rest}
        {...field.control}
        ref={setRef}
        rows={minRows}
        placeholder={placeholder ?? ' '}
        onInput={input}
        onChange={(e) => {
          rest.onChange?.(e);
          field.control.onChange(e);
        }}
        onBlur={(e) => {
          field.control.onBlur(e);
          rest.onBlur?.(e);
        }}
        className="cieo-field-control"
      />
    </FieldFrame>
  );
});
