'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* TextArea: the field treatment on a native <textarea> that grows with its text on a height spring, between
   minRows and maxRows. An optional counter rolls only the digits that change. Without JavaScript it is a plain
   resizable textarea with `minRows` rows. */
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { S } from '../core/spring.js';
import { Digits } from '../react/index.js';
import { FieldFrame, useField } from './Field.js';
import { Driver, px } from './motion.js';
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
export const TextArea = forwardRef(function TextArea(props, ref) {
    const { label, description, error, status, validate, onStatusChange, prefix, suffix, className, placeholder, id, minRows = 3, maxRows = 12, showCount, onInput, ...rest } = props;
    const own = { label, description, error, status, validate, onStatusChange, prefix, suffix };
    const field = useField(own, rest, id);
    const initial = String(rest.value ?? rest.defaultValue ?? '');
    const [count, setCount] = useState(initial.length);
    const height = useRef(null);
    const setRef = (el) => {
        field.ref.current = el;
        if (typeof ref === 'function')
            ref(el);
        else if (ref)
            ref.current = el;
    };
    /* Measure the content height with the box briefly at auto, clamp to the row limits, then spring there. */
    const grow = (jump) => {
        const el = field.ref.current;
        if (!el)
            return;
        const cs = getComputedStyle(el);
        const line = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
        const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
        const was = el.style.height;
        el.style.height = 'auto';
        const content = el.scrollHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
        el.style.height = was;
        const target = Math.min(Math.max(content, minRows * line + pad), maxRows * line + pad);
        el.style.overflowY = content > target + 1 ? 'auto' : 'hidden';
        if (!height.current)
            height.current = new Driver(target, (v) => (el.style.height = px(v)));
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
    const input = (e) => {
        setCount(e.currentTarget.value.length);
        grow(false);
        onInput?.(e);
    };
    const footer = showCount ? (_jsxs("span", { className: "cieo-field-count", "aria-hidden": "true", children: [_jsx(Digits, { value: count }), rest.maxLength ? _jsxs("span", { children: ["\u2009/\u2009", rest.maxLength] }) : null] })) : null;
    return (_jsx(FieldFrame, { kind: "textarea", own: own, field: field, floated: !!placeholder, className: className, footer: footer, children: _jsx("textarea", { ...rest, ...field.control, ref: setRef, rows: minRows, placeholder: placeholder ?? ' ', onInput: input, className: "cieo-field-control" }) }));
});
