'use client';
/* Checkbox, Radio and Switch. Each is a native input (so forms, keyboard, no-JS and assistive tech all work as the
   platform does) laid over a drawn visual. The motion is CSS keyed off :checked, on the spring tokens:
   the checkbox fills, then its check draws 40ms later (checklist recipe); the radio dot grows on snap; the switch
   knob leads with one edge and trails with the other, and widens toward its destination while pressed (switch recipe). */
import { createContext, forwardRef, useContext, useEffect, useId, useRef, type ChangeEvent, type ForwardedRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './classes.js';

type InputBase = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>;

interface ToggleOwn {
  /** Required: the visible name. Use hideLabel to keep it for assistive tech only. */
  label: ReactNode;
  hideLabel?: boolean;
  description?: ReactNode;
}

function useMergedRef<T>(ref: ForwardedRef<T>) {
  const own = useRef<T | null>(null);
  const set = (el: T | null) => {
    own.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };
  return [own, set] as const;
}

function ToggleText({ label, hideLabel, description, descId }: ToggleOwn & { descId: string }) {
  return (
    <span className={hideLabel ? 'cieo-vh' : 'cieo-toggle-text'}>
      <span className="cieo-toggle-label">{label}</span>
      {description ? (
        <span id={descId} className="cieo-desc">
          {description}
        </span>
      ) : null}
    </span>
  );
}

export type CheckboxProps = InputBase & ToggleOwn & { indeterminate?: boolean };

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(props, ref) {
  const { label, hideLabel, description, indeterminate, className, ...rest } = props;
  const uid = useId();
  const [own, set] = useMergedRef(ref);
  useEffect(() => {
    if (own.current) own.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <label className={cx('cieo-ctl', 'cieo-toggle', 'cieo-check', className)}>
      <span className="cieo-toggle-hit">
        <input {...rest} ref={set} type="checkbox" className="cieo-toggle-input" aria-describedby={description ? `${uid}d` : rest['aria-describedby']} />
        <span className="cieo-check-box" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" focusable={false}>
            <path className="cieo-check-tick" d="M5 12.5 10 17.5 19 7" pathLength={1} />
            <path className="cieo-check-dash" d="M6 12h12" pathLength={1} />
          </svg>
        </span>
      </span>
      <ToggleText label={label} hideLabel={hideLabel} description={description} descId={`${uid}d`} />
    </label>
  );
});

export type SwitchProps = InputBase & ToggleOwn;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(props, ref) {
  const { label, hideLabel, description, className, ...rest } = props;
  const uid = useId();
  return (
    <label className={cx('cieo-ctl', 'cieo-toggle', 'cieo-switch', className)}>
      <span className="cieo-toggle-hit">
        <input {...rest} ref={ref} type="checkbox" role="switch" className="cieo-toggle-input" aria-describedby={description ? `${uid}d` : rest['aria-describedby']} />
        <span className="cieo-switch-track" aria-hidden="true">
          <span className="cieo-switch-knob" />
        </span>
      </span>
      <ToggleText label={label} hideLabel={hideLabel} description={description} descId={`${uid}d`} />
    </label>
  );
});

interface RadioCtx {
  name: string;
  value: string | undefined;
  controlled: boolean;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  form?: string;
  pick: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
}
const Group = createContext<RadioCtx | null>(null);

export interface RadioGroupProps {
  /** Required: rendered as the fieldset legend. */
  label: ReactNode;
  hideLabel?: boolean;
  description?: ReactNode;
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  form?: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  children: ReactNode;
}

export function RadioGroup(props: RadioGroupProps) {
  const { label, hideLabel, description, name, onValueChange, disabled, required, form, orientation = 'vertical', className, children } = props;
  const uid = useId();
  const controlled = props.value !== undefined;
  const ctx: RadioCtx = {
    name,
    value: props.value,
    controlled,
    defaultValue: props.defaultValue,
    disabled,
    required,
    form,
    pick: (v) => {
      onValueChange?.(v);
    },
  };
  return (
    <fieldset className={cx('cieo-ctl', 'cieo-radio-group', className)} data-orientation={orientation} disabled={disabled} aria-describedby={description ? `${uid}d` : undefined}>
      <legend className={hideLabel ? 'cieo-vh' : 'cieo-label'}>{label}</legend>
      {description ? (
        <p id={`${uid}d`} className="cieo-desc">
          {description}
        </p>
      ) : null}
      <div className="cieo-radio-items">
        <Group.Provider value={ctx}>{children}</Group.Provider>
      </div>
    </fieldset>
  );
}

export type RadioProps = Omit<InputBase, 'value'> & ToggleOwn & { value: string };

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(props, ref) {
  const { label, hideLabel, description, className, value, onChange, ...rest } = props;
  const g = useContext(Group);
  const uid = useId();
  /* Uncontrolled groups retain native checked ownership, including grouping and form reset. */
  const checked = g ? (g.controlled ? g.value === value : undefined) : rest.checked;
  const defaultChecked = g ? (g.controlled ? undefined : g.defaultValue === value) : rest.defaultChecked;
  return (
    <label className={cx('cieo-ctl', 'cieo-toggle', 'cieo-radio', className)}>
      <span className="cieo-toggle-hit">
        <input
          {...rest}
          ref={ref}
          type="radio"
          name={g?.name ?? rest.name}
          value={value}
          form={g?.form ?? rest.form}
          required={g?.required ?? rest.required}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={(e) => {
            g?.pick(value, e);
            onChange?.(e);
          }}
          className="cieo-toggle-input"
          aria-describedby={description ? `${uid}d` : rest['aria-describedby']}
        />
        <span className="cieo-radio-dot" aria-hidden="true" />
      </span>
      <ToggleText label={label} hideLabel={hideLabel} description={description} descId={`${uid}d`} />
    </label>
  );
});
