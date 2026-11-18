'use client';
/* Select. The server (and any page whose scripts never run) renders a real <select name> that submits with the
   form. After hydration a combobox trigger and listbox take over the look and the keyboard, while the native
   select stays the value source: hidden from sight and from assistive tech, still submitted, and every pick is
   written to it with a real change event. */
import { useEffect, useId, useLayoutEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Track } from '../core/spring.js';
import { SwapText } from '../react/index.js';
import { useControllableState } from '../state/react.js';
import { cx, type ControlSize } from './classes.js';
import { CheckIcon, ChevronIcon } from './icons.js';
import { Typeahead, firstEnabled, listboxKey } from './listbox.js';
import { indexOfValue, normalizeOptions, setNativeValue, submitOwner, type SelectOption } from './native.js';
import { customizeControlPart, type ControlPartProps } from './parts.js';
import {
  paintLiveOptions,
  resolveOptionNodes,
  syncSelectPlate,
  syncSelectPopup,
  type SelectPlateState,
  type SelectPresenceState,
} from './select-popup.js';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export { resolveOptionNodes, paintLiveOptions };
export type { SelectOption };

export interface SelectSlotProps {
  root?: ControlPartProps; label?: ControlPartProps; box?: ControlPartProps; native?: ControlPartProps;
  trigger?: ControlPartProps; value?: ControlPartProps; popup?: ControlPartProps; list?: ControlPartProps;
  plate?: ControlPartProps; option?: ControlPartProps; description?: ControlPartProps;
}

export interface SelectProps {
  /** Visible label (required: it names both the native select and the combobox). */
  label: ReactNode;
  /** Keeps the label for assistive tech but hides it visually. */
  hideLabel?: boolean;
  options: ReadonlyArray<SelectOption | string>;
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Submit the owning form after each pick (filter dropdowns in GET forms). Keep a submit button for no-JS. */
  autoSubmit?: boolean;
  /** Associates the native select with a form elsewhere on the page. */
  form?: string;
  disabled?: boolean;
  required?: boolean;
  size?: ControlSize;
  description?: ReactNode;
  className?: string;
  slotProps?: SelectSlotProps;
}

export function Select(props: SelectProps) {
  const { label, hideLabel, name, form, disabled, required, size = 'md', description, className, slotProps, autoSubmit, onValueChange } = props;
  const uid = useId();
  const ids = { label: `${uid}l`, select: props.id ?? `${uid}s`, trigger: `${uid}t`, list: `${uid}x`, desc: `${uid}d` };
  const optId = (i: number) => `${uid}o${i}`;
  const opts = normalizeOptions(props.options);
  const [current, setCurrent] = useControllableState<string>({ value: props.value, defaultValue: props.defaultValue ?? opts[indexOfValue(opts, undefined)]?.value ?? '', onChange: onValueChange });
  const selected = indexOfValue(opts, current);

  const [enhanced, setEnhanced] = useState(false);
  const [open, setOpen] = useControllableState<boolean>({ value: props.open, defaultValue: props.defaultOpen ?? false, onChange: props.onOpenChange });
  const [active, setActive] = useState(selected);
  const [side, setSide] = useState<'bottom' | 'top'>('bottom');
  const root = useRef<HTMLDivElement>(null);
  const native = useRef<HTMLSelectElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const ta = useRef(new Typeahead());
  const keyboard = useRef(false);

  useEffect(() => setEnhanced(true), []);

  /* A form reset moves the native select without a change event; follow it. */
  useEffect(() => {
    const f = native.current?.form;
    if (!f || props.value !== undefined) return;
    const onReset = () => setTimeout(() => native.current && setCurrent(native.current.value), 0);
    f.addEventListener('reset', onReset);
    return () => f.removeEventListener('reset', onReset);
  }, [enhanced, props.value, setCurrent]);

  const onNativeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrent(e.currentTarget.value);
    if (autoSubmit) submitOwner(e.currentTarget);
  };

  const show = (next: boolean, at?: number) => {
    if (next && trigger.current && pop.current && typeof window !== 'undefined') {
      const r = trigger.current.getBoundingClientRect();
      const h = Math.min(pop.current.scrollHeight, 320);
      setSide(r.bottom + h + 8 > window.innerHeight && r.top > h + 8 ? 'top' : 'bottom');
    }
    if (next) {
      if (at === undefined) ta.current.reset();
      setActive(at ?? (selected >= 0 ? selected : firstEnabled(opts)));
    }
    setOpen(next);
  };

  const pick = (i: number) => {
    const el = native.current;
    const o = opts[i];
    if (!el || !o || o.disabled) return;
    show(false);
    trigger.current?.focus();
    setNativeValue(el, o.value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const r = listboxKey({ open, active, selected }, e, opts, ta.current, e.timeStamp || performance.now());
    if (r.handled) e.preventDefault();
    keyboard.current = true;
    if (r.state.open !== open) {
      if (r.state.open) show(true, r.state.active);
      else show(false);
    } else setActive(r.state.active);
    if (r.commit !== undefined && r.commit !== selected) {
      const el = native.current;
      const o = opts[r.commit];
      if (el && o) setNativeValue(el, o.value);
    }
  };

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  const presence = useRef<SelectPresenceState>({ o: new Track(0), t0: -9, stop: null });
  const optionCache = useRef<HTMLElement[]>([]);
  useIso(() => {
    syncSelectPopup({
      pop: pop.current,
      list: list.current,
      trigger: trigger.current,
      open,
      side,
      presence: presence.current,
      optionCache,
    });
  }, [open, enhanced, side]);
  useEffect(() => () => presence.current.stop?.(), []);

  const edges = useRef<SelectPlateState>({ top: new Track(0), bottom: new Track(0), stop: null, shown: false });
  useIso(() => {
    syncSelectPlate({
      plate: plate.current,
      list: list.current,
      activeId: optId(active),
      open,
      keyboard: keyboard.current,
      edges: edges.current,
    });
  }, [active, open]);
  useEffect(() => () => edges.current.stop?.(), []);

  const shownLabel = opts[selected]?.label ?? '';
  const rootClass = cx('cieo-ctl', 'cieo-select', `cieo-select--${size}`, className);
  const labelClass = hideLabel ? 'cieo-vh' : 'cieo-label';

  return (
    <div
      ref={root}
      className={rootClass}
      data-enhanced={enhanced || undefined}
      data-open={open || undefined}
      data-side={side}
      {...customizeControlPart(slotProps?.root, rootClass)}
    >
      <label
        id={ids.label}
        htmlFor={enhanced ? ids.trigger : ids.select}
        className={labelClass}
        onClick={
          enhanced
            ? (e) => {
                e.preventDefault();
                trigger.current?.focus();
              }
            : undefined
        }
        {...customizeControlPart(slotProps?.label, labelClass)}
      >
        {label}
      </label>
      <div className="cieo-select-box" {...customizeControlPart(slotProps?.box, 'cieo-select-box')}>
        <select
          ref={native}
          id={ids.select}
          name={name}
          form={form}
          value={current}
          onChange={onNativeChange}
          disabled={disabled}
          required={required}
          className="cieo-select-native"
          aria-describedby={description ? ids.desc : undefined}
          aria-hidden={enhanced || undefined}
          tabIndex={enhanced ? -1 : undefined}
          {...customizeControlPart(slotProps?.native, 'cieo-select-native')}
        >
          {opts.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        {enhanced ? (
          <>
            <button
              ref={trigger}
              type="button"
              id={ids.trigger}
              role="combobox"
              className="cieo-select-trigger"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={ids.list}
              aria-labelledby={ids.label}
              aria-activedescendant={open && active >= 0 ? optId(active) : undefined}
              aria-describedby={description ? ids.desc : undefined}
              aria-required={required || undefined}
              disabled={disabled}
              onClick={() => {
                keyboard.current = false;
                show(!open);
              }}
              onKeyDown={onKeyDown}
              onKeyUp={(e) => {
                if (e.key === ' ') e.preventDefault();
              }}
              onBlur={(e) => {
                if (!root.current?.contains(e.relatedTarget as Node)) setOpen(false);
              }}
              {...customizeControlPart(slotProps?.trigger, 'cieo-select-trigger')}
            >
              <span className="cieo-select-value" {...customizeControlPart(slotProps?.value, 'cieo-select-value')}>
                <SwapText value={shownLabel} />
              </span>
              <ChevronIcon />
            </button>
            <div ref={pop} className="cieo-select-pop" data-side={side} {...customizeControlPart(slotProps?.popup, 'cieo-select-pop')}>
              <div ref={list} role="listbox" id={ids.list} aria-labelledby={ids.label} tabIndex={-1} className="cieo-select-list" {...customizeControlPart(slotProps?.list, 'cieo-select-list')}>
                <div ref={plate} className="cieo-select-plate" aria-hidden="true" {...customizeControlPart(slotProps?.plate, 'cieo-select-plate')} />
                {opts.map((o, i) => (
                  <div
                    key={o.value}
                    id={optId(i)}
                    role="option"
                    aria-selected={i === selected}
                    aria-disabled={o.disabled || undefined}
                    data-active={(open && i === active) || undefined}
                    className="cieo-select-option"
                    onPointerDown={(e) => e.preventDefault()}
                    onPointerMove={() => {
                      keyboard.current = false;
                      if (!o.disabled && i !== active) setActive(i);
                    }}
                    onClick={() => pick(i)}
                    {...customizeControlPart(slotProps?.option, 'cieo-select-option')}
                  >
                    <span className="cieo-select-mark">{i === selected ? <CheckIcon /> : null}</span>
                    <span className="cieo-select-option-label">{o.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
        {enhanced ? null : <ChevronIcon />}
      </div>
      {description ? (
        <p id={ids.desc} className="cieo-desc" {...customizeControlPart(slotProps?.description, 'cieo-desc')}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
