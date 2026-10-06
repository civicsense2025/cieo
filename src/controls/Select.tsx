'use client';
/* Select. The server (and any page whose scripts never run) renders a real <select name> that submits with the
   form. After hydration a combobox trigger and listbox take over the look and the keyboard, while the native
   select stays the value source: hidden from sight and from assistive tech, still submitted, and every pick is
   written to it with a real change event. Motion follows the dropdown recipe: the list grows from the trigger at
   97% scale, options fade in 30ms apart, and the highlight plate leads with one edge and trails with the other. */
import { useEffect, useId, useLayoutEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react';
import { BLUR, LAG, S, STAGGER_MAX, Track, allowed, clamp, config, now, prog, run } from '../core/spring.js';
import { SwapText } from '../react/index.js';
import { cx, type ControlSize } from './classes.js';
import { CheckIcon, ChevronIcon } from './icons.js';
import { Typeahead, firstEnabled, listboxKey } from './listbox.js';
import { px } from './motion.js';
import { indexOfValue, normalizeOptions, setNativeValue, submitOwner, type SelectOption } from './native.js';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export type { SelectOption };

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
  /** Submit the owning form after each pick (filter dropdowns in GET forms). Keep a submit button for no-JS. */
  autoSubmit?: boolean;
  /** Associates the native select with a form elsewhere on the page. */
  form?: string;
  disabled?: boolean;
  required?: boolean;
  size?: ControlSize;
  description?: ReactNode;
  className?: string;
}

export function Select(props: SelectProps) {
  const { label, hideLabel, name, form, disabled, required, size = 'md', description, className, autoSubmit, onValueChange } = props;
  const uid = useId();
  const ids = { label: `${uid}l`, select: props.id ?? `${uid}s`, trigger: `${uid}t`, list: `${uid}x`, desc: `${uid}d` };
  const optId = (i: number) => `${uid}o${i}`;
  const opts = normalizeOptions(props.options);
  const [inner, setInner] = useState(() => props.defaultValue ?? opts[indexOfValue(opts, undefined)]?.value ?? '');
  const current = props.value ?? inner;
  const selected = indexOfValue(opts, current);

  const [enhanced, setEnhanced] = useState(false);
  const [open, setOpen] = useState(false);
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
    const onReset = () => setTimeout(() => native.current && setInner(native.current.value), 0);
    f.addEventListener('reset', onReset);
    return () => f.removeEventListener('reset', onReset);
  }, [enhanced, props.value]);

  const onNativeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.currentTarget.value;
    if (props.value === undefined) setInner(v);
    onValueChange?.(v);
    if (autoSubmit) submitOwner(e.currentTarget);
  };

  /* `at` comes from the keyboard model (which may have just fed the type-ahead); a pointer open starts fresh. */
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

  /* Close on a pointer press outside. */
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  /* Presence: one spring for the list, options staggered on open. */
  const presence = useRef<{ o: Track; t0: number; stop: (() => void) | null }>({ o: new Track(0), t0: -9, stop: null });
  useIso(() => {
    const el = pop.current;
    if (!el) return;
    const p = presence.current;
    const items = list.current ? [...list.current.querySelectorAll<HTMLElement>('[role="option"]')] : [];
    const gap = Math.min(0.03, STAGGER_MAX / Math.max(1, items.length - 1));
    const paint = (t: number) => {
      const v = clamp(p.o.at(t));
      const up = side === 'top' ? 1 : -1;
      el.style.visibility = v < 0.01 && !p.o.target ? 'hidden' : 'visible';
      el.style.opacity = v.toFixed(3);
      el.style.transform = v > 0.999 ? '' : `translateY(${px((1 - v) * 4 * up)}) scale(${(0.97 + 0.03 * v).toFixed(4)})`;
      el.style.filter = v < 0.98 ? `blur(${((1 - v) * BLUR).toFixed(2)}px)` : '';
      items.forEach((it, i) => {
        const q = p.o.target ? clamp(prog(t, p.t0 + 0.04 + i * gap, S.base)) : v;
        it.style.opacity = q > 0.999 ? '' : q.toFixed(3);
      });
    };
    if (open) p.t0 = now();
    if (!allowed('feedback', trigger.current)) {
      p.stop?.();
      p.o.jump(open ? 1 : 0);
      paint(now());
      return;
    }
    p.o.set(open ? 1 : 0, config('feedback', open ? S.base : S.snap));
    if (!p.stop)
      p.stop = run({
        kind: 'feedback',
        step: (t) => {
          paint(t);
          return p.o.prune(t) > 0 || (!!p.o.target && t < p.t0 + 0.04 + items.length * gap + 0.3);
        },
        finish: () => {
          p.stop = null;
          p.o.jump(p.o.target);
          p.t0 = -9;
          paint(now());
        },
      });
  }, [open, enhanced, side]);
  useEffect(() => () => presence.current.stop?.(), []);

  /* Highlight plate: springs between options, leading edge first, trailing edge LAG behind. Jumps on open. */
  const edges = useRef<{ top: Track; bottom: Track; stop: (() => void) | null; shown: boolean }>({ top: new Track(0), bottom: new Track(0), stop: null, shown: false });
  useIso(() => {
    const el = plate.current;
    const box = list.current;
    const e = edges.current;
    if (!el || !box) return;
    const row = document.getElementById(optId(active));
    if (!open || !row) {
      e.shown = false;
      el.style.opacity = '0';
      return;
    }
    const top = row.offsetTop;
    const bottom = top + row.offsetHeight;
    const paint = (t: number) => {
      const a = e.top.at(t);
      el.style.transform = `translateY(${px(a)})`;
      el.style.height = px(Math.max(0, e.bottom.at(t) - a));
    };
    el.style.opacity = '1';
    if (keyboard.current) row.scrollIntoView?.({ block: 'nearest' });
    if (!e.shown || !allowed('feedback', el)) {
      e.shown = true;
      e.stop?.();
      e.top.jump(top);
      e.bottom.jump(bottom);
      paint(now());
      return;
    }
    const t0 = now();
    const down = top >= e.top.target;
    const cfg = config('feedback', S.base);
    (down ? e.bottom : e.top).set(down ? bottom : top, cfg, t0);
    (down ? e.top : e.bottom).set(down ? top : bottom, cfg, t0 + LAG);
    if (!e.stop)
      e.stop = run({
        kind: 'feedback',
        step: (t) => {
          paint(t);
          return e.top.prune(t) + e.bottom.prune(t) > 0;
        },
        finish: () => {
          e.stop = null;
          e.top.jump(e.top.target);
          e.bottom.jump(e.bottom.target);
          paint(now());
        },
      });
  }, [active, open]);
  useEffect(() => () => edges.current.stop?.(), []);

  const shownLabel = opts[selected]?.label ?? '';

  return (
    <div
      ref={root}
      className={cx('cieo-ctl', 'cieo-select', `cieo-select--${size}`, className)}
      data-enhanced={enhanced || undefined}
      data-open={open || undefined}
      data-side={side}
    >
      <label
        id={ids.label}
        htmlFor={enhanced ? ids.trigger : ids.select}
        className={hideLabel ? 'cieo-vh' : 'cieo-label'}
        onClick={
          enhanced
            ? (e) => {
                e.preventDefault();
                trigger.current?.focus();
              }
            : undefined
        }
      >
        {label}
      </label>
      <div className="cieo-select-box">
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
                /* A button clicks on Space keyup; the keydown already acted. */
                if (e.key === ' ') e.preventDefault();
              }}
              onBlur={(e) => {
                if (!root.current?.contains(e.relatedTarget as Node)) setOpen(false);
              }}
            >
              <span className="cieo-select-value">
                <SwapText value={shownLabel} />
              </span>
              <ChevronIcon />
            </button>
            <div ref={pop} className="cieo-select-pop" data-side={side}>
              <div ref={list} role="listbox" id={ids.list} aria-labelledby={ids.label} tabIndex={-1} className="cieo-select-list">
                <div ref={plate} className="cieo-select-plate" aria-hidden="true" />
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
        <p id={ids.desc} className="cieo-desc">
          {description}
        </p>
      ) : null}
    </div>
  );
}
