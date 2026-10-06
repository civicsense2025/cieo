'use client';
/* Range: a native range input with a drawn track and fill. The server renders the fill at the initial value. After
   hydration the fill follows a drag exactly and springs (snap) on keyboard steps and track clicks, and the thumb
   grows while pressed. */
import { forwardRef, useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { S } from '../core/spring.js';
import { Digits } from '../react/index.js';
import { cx } from './classes.js';
import { Driver } from './motion.js';

export type RangeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label: ReactNode;
  hideLabel?: boolean;
  /** Show the current value next to the label, rolling as it changes. */
  showValue?: boolean;
  formatValue?: (value: number) => string;
};

const pct = (v: number, min: number, max: number) => (max > min ? ((v - min) / (max - min)) * 100 : 0);

export const Range = forwardRef<HTMLInputElement, RangeProps>(function Range(props, ref) {
  const { label, hideLabel, showValue, formatValue = String, className, id, onInput, ...rest } = props;
  const uid = useId();
  const inputId = id ?? `${uid}r`;
  const min = Number(rest.min ?? 0);
  const max = Number(rest.max ?? 100);
  const start = Number(rest.value ?? rest.defaultValue ?? (min + max) / 2);
  /* React writes the fill variable once (server and first render); the spring owns it afterwards. */
  const initial = useRef<CSSProperties>({ ['--cieo-range-p' as string]: pct(start, min, max).toFixed(3) });
  const root = useRef<HTMLDivElement>(null);
  const drv = useRef<Driver | null>(null);
  const dragging = useRef(false);
  const readout = useRef<{ set: (v: number) => void } | null>(null);

  const driver = () => (drv.current ??= new Driver(pct(start, min, max), (v) => root.current?.style.setProperty('--cieo-range-p', v.toFixed(3))));
  const follow = (v: number) => driver().to(pct(v, min, max), { cfg: S.snap, jump: dragging.current, el: root.current });

  useEffect(() => {
    if (rest.value !== undefined) follow(Number(rest.value));
  }, [rest.value, min, max]);
  useEffect(() => () => drv.current?.cancel(), []);

  const setRef = (el: HTMLInputElement | null) => {
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div ref={root} className={cx('cieo-ctl', 'cieo-range', className)} style={initial.current}>
      <div className={hideLabel ? 'cieo-vh' : 'cieo-range-head'}>
        <label htmlFor={inputId} className="cieo-label">
          {label}
        </label>
        {showValue ? (
          <output htmlFor={inputId} className="cieo-range-value">
            <RangeReadout initial={start} format={formatValue} bind={(api) => (readout.current = api)} />
          </output>
        ) : null}
      </div>
      <input
        {...rest}
        ref={setRef}
        id={inputId}
        type="range"
        className="cieo-range-input"
        onPointerDown={(e) => {
          dragging.current = false;
          rest.onPointerDown?.(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons) dragging.current = true;
          rest.onPointerMove?.(e);
        }}
        onPointerUp={(e) => {
          dragging.current = false;
          rest.onPointerUp?.(e);
        }}
        onInput={(e: FormEvent<HTMLInputElement>) => {
          const v = Number(e.currentTarget.value);
          follow(v);
          readout.current?.set(v);
          onInput?.(e);
        }}
      />
    </div>
  );
});

/* The readout keeps its own state so a drag re-renders only the number, never the whole control. */
function RangeReadout({ initial, format, bind }: { initial: number; format: (v: number) => string; bind: (api: { set: (v: number) => void }) => void }) {
  const [v, setV] = useState(initial);
  bind({ set: setV });
  return <Digits value={format(v)} />;
}
