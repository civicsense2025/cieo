'use client';
/* Shared text-field frame, after the field recipe. The label floats on focus or once there is a value (pure CSS, so it
   works before hydration). The status machine settles the field into neutral, valid or invalid; the border, label
   and icon follow, and the message area opens on a height spring. */
import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent, type ReactNode } from 'react';
import { cx } from './classes.js';
import { nextFieldStatus, resolveFieldStatus, type FieldEvent, type FieldStatus } from './field-state.js';
import { AlertIcon, CheckIcon } from './icons.js';

export type { FieldStatus };

/** Return a message (or false) when the value is invalid; null, undefined or true when it is fine. */
export type Validator = (value: string) => string | boolean | null | undefined;

export interface FieldOwnProps {
  /** Required: names the control, floats above the value. */
  label: ReactNode;
  description?: ReactNode;
  /** An error from the server or the app. Forces the invalid state and shows the message. */
  error?: ReactNode;
  /** Controlled status, overriding the machine. */
  status?: FieldStatus;
  validate?: Validator;
  onStatusChange?: (status: FieldStatus) => void;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

type TextControl = HTMLInputElement | HTMLTextAreaElement;

interface Rules {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
  type?: string;
}

/** Wires the status machine to a native control and returns the props both halves need. */
export function useField<T extends TextControl>(own: FieldOwnProps, rules: Rules, id?: string) {
  const uid = useId();
  const ids = { control: id ?? `${uid}c`, desc: `${uid}d`, msg: `${uid}m` };
  const [machine, setMachine] = useState<FieldStatus>('neutral');
  const [custom, setCustom] = useState<string>('');
  const ref = useRef<T | null>(null);
  const checks = !!(own.validate || rules.required || rules.pattern || rules.minLength || rules.min !== undefined || rules.max !== undefined || rules.type === 'email' || rules.type === 'url');

  const read = (el: T) => {
    const v = el.value;
    const result = own.validate?.(v);
    const bad = result === false || (typeof result === 'string' && result.length > 0);
    return { empty: v.length === 0, valid: !bad && (el.validity?.valid ?? true), checks, message: typeof result === 'string' ? result : el.validationMessage };
  };
  const fire = (event: FieldEvent, el: T | null) => {
    if (!el) return;
    const r = read(el);
    const next = nextFieldStatus(machine, event, r);
    if (next !== machine) {
      setMachine(next);
      own.onStatusChange?.(next);
    }
    setCustom(r.message);
  };

  const status = resolveFieldStatus(machine, { status: own.status, error: own.error });
  const message: ReactNode = own.error || (status === 'invalid' ? custom : '');
  /* Keep the last message while the area closes, so it never collapses around empty text. */
  const shown = useRef<ReactNode>(message);
  if (message) shown.current = message;

  useEffect(() => {
    const el = ref.current;
    const f = el?.form;
    if (!el) return;
    const onInvalid = () => fire('invalid', el);
    const onReset = () => setMachine('neutral');
    el.addEventListener('invalid', onInvalid);
    f?.addEventListener('reset', onReset);
    return () => {
      el.removeEventListener('invalid', onInvalid);
      f?.removeEventListener('reset', onReset);
    };
  });

  const describedBy = cx(own.description ? ids.desc : null, status === 'invalid' && message ? ids.msg : null) || undefined;
  return {
    ids,
    ref,
    status,
    message: shown.current,
    open: status === 'invalid' && !!message,
    control: {
      id: ids.control,
      'aria-invalid': status === 'invalid' || undefined,
      'aria-describedby': describedBy,
      onBlurCapture: (e: FocusEvent<T>) => fire('blur', e.currentTarget),
      onInputCapture: (e: FormEvent<T>) => fire('input', e.currentTarget),
    },
  };
}

/** The frame around a control: border box, floating label, status icon, description and message. */
export function FieldFrame(props: {
  kind: 'input' | 'textarea';
  own: FieldOwnProps;
  field: { ids: { control: string; desc: string; msg: string }; status: FieldStatus; message: ReactNode; open: boolean };
  floated: boolean;
  className?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const { own, field, kind } = props;
  return (
    <div className={cx('cieo-ctl', 'cieo-field', `cieo-field--${kind}`, props.className)} data-status={field.status} data-floated={props.floated || undefined}>
      <div className="cieo-field-box">
        {own.prefix ? <span className="cieo-field-affix">{own.prefix}</span> : null}
        <div className="cieo-field-main">
          {props.children}
          <label htmlFor={field.ids.control} className="cieo-field-label">
            {own.label}
          </label>
        </div>
        <span className="cieo-field-icon" aria-hidden="true">
          <span className="cieo-layer" data-on={field.status === 'valid' || undefined}>
            <CheckIcon />
          </span>
          <span className="cieo-layer" data-on={field.status === 'invalid' || undefined}>
            <AlertIcon />
          </span>
        </span>
        {own.suffix ? <span className="cieo-field-affix">{own.suffix}</span> : null}
      </div>
      {own.description || props.footer ? (
        <div className="cieo-field-foot">
          {own.description ? (
            <p id={field.ids.desc} className="cieo-desc">
              {own.description}
            </p>
          ) : (
            <span />
          )}
          {props.footer}
        </div>
      ) : null}
      <div className="cieo-field-msg" data-open={field.open || undefined}>
        <div>
          <p id={field.ids.msg} className="cieo-field-error" aria-live="polite">
            {field.message}
          </p>
        </div>
      </div>
    </div>
  );
}
