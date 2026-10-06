'use client';
/* SearchField, after the search recipe. A native type=search input: Enter submits its form with no JavaScript.
   After hydration a clear button springs in while there is text, and the collapsible variant starts as an icon
   button that widens into the field (the input fades in once the shape has mostly opened). */
import { forwardRef, useEffect, useId, useRef, useState, type FormEvent, type InputHTMLAttributes, type KeyboardEvent } from 'react';
import { cx, type ControlSize } from './classes.js';
import { CloseIcon, SearchIcon } from './icons.js';
import { setNativeValue } from './native.js';

export type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  /** Required accessible name. Hidden visually unless showLabel. */
  label: string;
  showLabel?: boolean;
  /** Called with the value on Enter (the form, if any, still submits). */
  onSearch?: (value: string) => void;
  onClear?: () => void;
  clearLabel?: string;
  /** Start as an icon button that expands into the field. Renders expanded until hydrated. */
  collapsible?: boolean;
  size?: ControlSize;
};

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(props, ref) {
  const { label, showLabel, onSearch, onClear, clearLabel = 'Clear search', collapsible, size = 'md', className, id, onInput, onKeyDown, onBlur, ...rest } = props;
  const uid = useId();
  const inputId = id ?? `${uid}i`;
  const input = useRef<HTMLInputElement | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [filled, setFilled] = useState(String(rest.value ?? rest.defaultValue ?? '').length > 0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setEnhanced(true);
    if (collapsible && !input.current?.value) setOpen(false);
  }, []);
  useEffect(() => {
    if (rest.value !== undefined) setFilled(String(rest.value).length > 0);
  }, [rest.value]);

  const setRef = (el: HTMLInputElement | null) => {
    input.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };
  const clear = () => {
    const el = input.current;
    if (!el) return;
    setNativeValue(el, '');
    setFilled(false);
    el.focus();
    onClear?.();
  };
  const expand = () => {
    setOpen(true);
    setTimeout(() => input.current?.focus(), 0);
  };

  return (
    <div
      className={cx('cieo-ctl', 'cieo-search', `cieo-search--${size}`, className)}
      data-enhanced={enhanced || undefined}
      data-collapsible={collapsible || undefined}
      data-open={open || undefined}
      data-filled={filled || undefined}
    >
      <label htmlFor={inputId} className={showLabel ? 'cieo-label' : 'cieo-vh'}>
        {label}
      </label>
      <div className="cieo-search-box">
        {collapsible && enhanced ? (
          <button type="button" className="cieo-search-toggle" aria-label={label} aria-expanded={open} aria-controls={inputId} tabIndex={open ? -1 : 0} onClick={() => (open ? input.current?.focus() : expand())}>
            <SearchIcon />
          </button>
        ) : (
          <span className="cieo-search-icon" aria-hidden="true">
            <SearchIcon />
          </span>
        )}
        <input
          {...rest}
          ref={setRef}
          id={inputId}
          type="search"
          className="cieo-search-input"
          placeholder={rest.placeholder ?? label}
          tabIndex={collapsible && enhanced && !open ? -1 : rest.tabIndex}
          onInput={(e: FormEvent<HTMLInputElement>) => {
            setFilled(e.currentTarget.value.length > 0);
            onInput?.(e);
          }}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') onSearch?.(e.currentTarget.value);
            if (e.key === 'Escape' && collapsible && !e.currentTarget.value) {
              setOpen(false);
              e.currentTarget.blur();
            }
            onKeyDown?.(e);
          }}
          onBlur={(e) => {
            if (collapsible && !e.currentTarget.value && !e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) setOpen(false);
            onBlur?.(e);
          }}
        />
        {enhanced ? (
          <button type="button" className="cieo-search-clear" aria-label={clearLabel} aria-controls={inputId} data-on={filled || undefined} tabIndex={filled ? 0 : -1} aria-hidden={!filled || undefined} onClick={clear}>
            <CloseIcon />
          </button>
        ) : null}
      </div>
    </div>
  );
});
