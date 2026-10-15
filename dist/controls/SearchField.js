'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* SearchField, after the search recipe. A native type=search input: Enter submits its form with no JavaScript.
   After hydration a clear button springs in while there is text, and the collapsible variant starts as an icon
   button that widens into the field (the input fades in once the shape has mostly opened). */
import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { cx } from './classes.js';
import { CloseIcon, SearchIcon } from './icons.js';
import { setNativeValue } from './native.js';
export const SearchField = forwardRef(function SearchField(props, ref) {
    const { label, showLabel, onSearch, onClear, clearLabel = 'Clear search', collapsible, size = 'md', className, id, onInput, onKeyDown, onBlur, ...rest } = props;
    const uid = useId();
    const inputId = id ?? `${uid}i`;
    const input = useRef(null);
    const [enhanced, setEnhanced] = useState(false);
    const [uncontrolledFilled, setFilled] = useState(String(rest.value ?? rest.defaultValue ?? '').length > 0);
    const filled = rest.value !== undefined ? String(rest.value).length > 0 : uncontrolledFilled;
    const [open, setOpen] = useState(true);
    useEffect(() => {
        setEnhanced(true);
        if (collapsible && !input.current?.value)
            setOpen(false);
    }, []);
    useEffect(() => {
        const el = input.current;
        const form = el?.form;
        if (!el || !form)
            return;
        const reset = (event) => {
            setTimeout(() => {
                if (event.defaultPrevented || input.current !== el)
                    return;
                setFilled(el.value.length > 0);
            });
        };
        form.addEventListener('reset', reset);
        return () => form.removeEventListener('reset', reset);
    });
    const setRef = (el) => {
        input.current = el;
        if (typeof ref === 'function')
            ref(el);
        else if (ref)
            ref.current = el;
    };
    const clear = () => {
        const el = input.current;
        if (!el)
            return;
        setNativeValue(el, '');
        setFilled(false);
        el.focus();
        onClear?.();
    };
    const expand = () => {
        setOpen(true);
        setTimeout(() => input.current?.focus(), 0);
    };
    return (_jsxs("div", { className: cx('cieo-ctl', 'cieo-search', `cieo-search--${size}`, className), "data-enhanced": enhanced || undefined, "data-collapsible": collapsible || undefined, "data-open": open || undefined, "data-filled": filled || undefined, children: [_jsx("label", { htmlFor: inputId, className: showLabel ? 'cieo-label' : 'cieo-vh', children: label }), _jsxs("div", { className: "cieo-search-box", children: [collapsible && enhanced ? (_jsx("button", { type: "button", className: "cieo-search-toggle", "aria-label": label, "aria-expanded": open, "aria-controls": inputId, tabIndex: open ? -1 : 0, onClick: () => (open ? input.current?.focus() : expand()), children: _jsx(SearchIcon, {}) })) : (_jsx("span", { className: "cieo-search-icon", "aria-hidden": "true", children: _jsx(SearchIcon, {}) })), _jsx("input", { ...rest, ref: setRef, id: inputId, type: "search", className: "cieo-search-input", placeholder: rest.placeholder ?? label, tabIndex: collapsible && enhanced && !open ? -1 : rest.tabIndex, onInput: (e) => {
                            setFilled(e.currentTarget.value.length > 0);
                            onInput?.(e);
                        }, onKeyDown: (e) => {
                            if (e.key === 'Enter')
                                onSearch?.(e.currentTarget.value);
                            if (e.key === 'Escape' && collapsible && !e.currentTarget.value) {
                                setOpen(false);
                                e.currentTarget.blur();
                            }
                            onKeyDown?.(e);
                        }, onBlur: (e) => {
                            if (collapsible && !e.currentTarget.value && !e.currentTarget.parentElement?.contains(e.relatedTarget))
                                setOpen(false);
                            onBlur?.(e);
                        } }), enhanced ? (_jsx("button", { type: "button", className: "cieo-search-clear", "aria-label": clearLabel, "aria-controls": inputId, "data-on": filled || undefined, tabIndex: filled ? 0 : -1, "aria-hidden": !filled || undefined, onClick: clear, children: _jsx(CloseIcon, {}) })) : null] })] }));
});
