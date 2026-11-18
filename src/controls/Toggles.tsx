'use client';
/* Checkbox, Radio and Switch. Each is a native input (so forms, keyboard, no-JS and assistive tech all work as the
   platform does) laid over a drawn visual. The motion is CSS keyed off :checked, on the spring tokens:
   the checkbox fills, then its check draws 40ms later (checklist recipe); the radio dot grows on snap; the switch
   knob leads with one edge and trails with the other, and widens toward its destination while pressed (switch recipe). */
import { createContext, forwardRef, useContext, useEffect, useId, useRef, type ChangeEvent, type ForwardedRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './classes.js';
import { customizeControlPart, type ControlPartProps } from './parts.js';

type InputBase = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>;

interface ToggleTextSlots {
  text?: ControlPartProps;
  label?: ControlPartProps;
  description?: ControlPartProps;
}

export interface CheckboxSlotProps extends ToggleTextSlots {
  root?: ControlPartProps;
  hit?: ControlPartProps;
  input?: ControlPartProps;
  indicator?: ControlPartProps;
}

export interface SwitchSlotProps extends ToggleTextSlots {
  root?: ControlPartProps;
  hit?: ControlPartProps;
  input?: ControlPartProps;
  track?: ControlPartProps;
  knob?: ControlPartProps;
}

export interface RadioGroupSlotProps {
  root?: ControlPartProps;
  legend?: ControlPartProps;
  description?: ControlPartProps;
  items?: ControlPartProps;
}

export interface RadioSlotProps extends ToggleTextSlots {
  root?: ControlPartProps;
  hit?: ControlPartProps;
  input?: ControlPartProps;
  indicator?: ControlPartProps;
}

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

function ToggleText({ label, hideLabel, description, descId, slotProps }: ToggleOwn & { descId: string; slotProps?: ToggleTextSlots }) {
  const textClass = hideLabel ? 'cieo-vh' : 'cieo-toggle-text';
  return (
    <span className={textClass} {...customizeControlPart(slotProps?.text, textClass)}>
      <span className="cieo-toggle-label" {...customizeControlPart(slotProps?.label, 'cieo-toggle-label')}>{label}</span>
      {description ? (
        <span id={descId} className="cieo-desc" {...customizeControlPart(slotProps?.description, 'cieo-desc')}>
          {description}
        </span>
      ) : null}
    </span>
  );
}

export type CheckboxProps = InputBase & ToggleOwn & { indeterminate?: boolean; slotProps?: CheckboxSlotProps };

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(props, ref) {
  const { label, hideLabel, description, indeterminate, slotProps, className, ...rest } = props;
  const uid = useId();
  const [own, set] = useMergedRef(ref);
  const rootClass = cx('cieo-ctl', 'cieo-toggle', 'cieo-check', className);
  useEffect(() => {
    if (own.current) own.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <label className={rootClass} {...customizeControlPart(slotProps?.root, rootClass)}>
      <span className="cieo-toggle-hit" {...customizeControlPart(slotProps?.hit, 'cieo-toggle-hit')}>
        <input {...rest} ref={set} type="checkbox" className="cieo-toggle-input" aria-describedby={description ? `${uid}d` : rest['aria-describedby']} {...customizeControlPart(slotProps?.input, 'cieo-toggle-input', rest.style)} />
        <span className="cieo-check-box" aria-hidden="true" {...customizeControlPart(slotProps?.indicator, 'cieo-check-box')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" focusable={false}>
            <path className="cieo-check-tick" d="M5 12.5 10 17.5 19 7" pathLength={1} />
            <path className="cieo-check-dash" d="M6 12h12" pathLength={1} />
          </svg>
        </span>
      </span>
      <ToggleText label={label} hideLabel={hideLabel} description={description} descId={`${uid}d`} slotProps={slotProps} />
    </label>
  );
});

export type SwitchProps = InputBase & ToggleOwn & { slotProps?: SwitchSlotProps };

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(props, ref) {
  const { label, hideLabel, description, slotProps, className, ...rest } = props;
  const uid = useId();
  const rootClass = cx('cieo-ctl', 'cieo-toggle', 'cieo-switch', className);
  return (
    <label className={rootClass} {...customizeControlPart(slotProps?.root, rootClass)}>
      <span className="cieo-toggle-hit" {...customizeControlPart(slotProps?.hit, 'cieo-toggle-hit')}>
        <input {...rest} ref={ref} type="checkbox" role="switch" className="cieo-toggle-input" aria-describedby={description ? `${uid}d` : rest['aria-describedby']} {...customizeControlPart(slotProps?.input, 'cieo-toggle-input', rest.style)} />
        <span className="cieo-switch-track" aria-hidden="true" {...customizeControlPart(slotProps?.track, 'cieo-switch-track')}>
          <span className="cieo-switch-knob" {...customizeControlPart(slotProps?.knob, 'cieo-switch-knob')} />
        </span>
      </span>
      <ToggleText label={label} hideLabel={hideLabel} description={description} descId={`${uid}d`} slotProps={slotProps} />
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
  slotProps?: RadioGroupSlotProps;
  children: ReactNode;
}

export function RadioGroup(props: RadioGroupProps) {
  const { label, hideLabel, description, name, onValueChange, disabled, required, form, orientation = 'vertical', slotProps, className, children } = props;
  const uid = useId();
  const controlled = props.value !== undefined;
  const rootClass = cx('cieo-ctl', 'cieo-radio-group', className);
  const legendClass = hideLabel ? 'cieo-vh' : 'cieo-label';
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
    <fieldset className={rootClass} data-orientation={orientation} disabled={disabled} aria-describedby={description ? `${uid}d` : undefined} {...customizeControlPart(slotProps?.root, rootClass)}>
      <legend className={legendClass} {...customizeControlPart(slotProps?.legend, legendClass)}>{label}</legend>
      {description ? (
        <p id={`${uid}d`} className="cieo-desc" {...customizeControlPart(slotProps?.description, 'cieo-desc')}>
          {description}
        </p>
      ) : null}
      <div className="cieo-radio-items" {...customizeControlPart(slotProps?.items, 'cieo-radio-items')}>
        <Group.Provider value={ctx}>{children}</Group.Provider>
      </div>
    </fieldset>
  );
}

export type RadioProps = Omit<InputBase, 'value'> & ToggleOwn & { value: string; slotProps?: RadioSlotProps };

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(props, ref) {
  const { label, hideLabel, description, slotProps, className, value, onChange, ...rest } = props;
  const g = useContext(Group);
  const uid = useId();
  const rootClass = cx('cieo-ctl', 'cieo-toggle', 'cieo-radio', className);
  /* Uncontrolled groups retain native checked ownership, including grouping and form reset. */
  const checked = g ? (g.controlled ? g.value === value : undefined) : rest.checked;
  const defaultChecked = g ? (g.controlled ? undefined : g.defaultValue === value) : rest.defaultChecked;
  return (
    <label className={rootClass} {...customizeControlPart(slotProps?.root, rootClass)}>
      <span className="cieo-toggle-hit" {...customizeControlPart(slotProps?.hit, 'cieo-toggle-hit')}>
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
          {...customizeControlPart(slotProps?.input, 'cieo-toggle-input', rest.style)}
        />
        <span className="cieo-radio-dot" aria-hidden="true" {...customizeControlPart(slotProps?.indicator, 'cieo-radio-dot')} />
      </span>
      <ToggleText label={label} hideLabel={hideLabel} description={description} descId={`${uid}d`} slotProps={slotProps} />
    </label>
  );
});
