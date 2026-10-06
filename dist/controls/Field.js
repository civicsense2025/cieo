'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Shared text-field frame, after the field recipe. The label floats on focus or once there is a value (pure CSS, so it
   works before hydration). The status machine settles the field into neutral, valid or invalid; the border, label
   and icon follow, and the message area opens on a height spring. */
import { useEffect, useId, useRef, useState } from 'react';
import { cx } from './classes.js';
import { nextFieldStatus, resolveFieldStatus } from './field-state.js';
import { AlertIcon, CheckIcon } from './icons.js';
/** Wires the status machine to a native control and returns the props both halves need. */
export function useField(own, rules, id) {
    const uid = useId();
    const ids = { control: id ?? `${uid}c`, desc: `${uid}d`, msg: `${uid}m` };
    const [machine, setMachine] = useState('neutral');
    const [custom, setCustom] = useState('');
    const ref = useRef(null);
    const checks = !!(own.validate || rules.required || rules.pattern || rules.minLength || rules.min !== undefined || rules.max !== undefined || rules.type === 'email' || rules.type === 'url');
    const read = (el) => {
        const v = el.value;
        const result = own.validate?.(v);
        const bad = result === false || (typeof result === 'string' && result.length > 0);
        return { empty: v.length === 0, valid: !bad && (el.validity?.valid ?? true), checks, message: typeof result === 'string' ? result : el.validationMessage };
    };
    const fire = (event, el) => {
        if (!el)
            return;
        const r = read(el);
        const next = nextFieldStatus(machine, event, r);
        if (next !== machine) {
            setMachine(next);
            own.onStatusChange?.(next);
        }
        setCustom(r.message);
    };
    const status = resolveFieldStatus(machine, { status: own.status, error: own.error });
    const message = own.error || (status === 'invalid' ? custom : '');
    /* Keep the last message while the area closes, so it never collapses around empty text. */
    const shown = useRef(message);
    if (message)
        shown.current = message;
    useEffect(() => {
        const el = ref.current;
        const f = el?.form;
        if (!el)
            return;
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
            onBlurCapture: (e) => fire('blur', e.currentTarget),
            onInputCapture: (e) => fire('input', e.currentTarget),
        },
    };
}
/** The frame around a control: border box, floating label, status icon, description and message. */
export function FieldFrame(props) {
    const { own, field, kind } = props;
    return (_jsxs("div", { className: cx('cieo-ctl', 'cieo-field', `cieo-field--${kind}`, props.className), "data-status": field.status, "data-floated": props.floated || undefined, children: [_jsxs("div", { className: "cieo-field-box", children: [own.prefix ? _jsx("span", { className: "cieo-field-affix", children: own.prefix }) : null, _jsxs("div", { className: "cieo-field-main", children: [props.children, _jsx("label", { htmlFor: field.ids.control, className: "cieo-field-label", children: own.label })] }), _jsxs("span", { className: "cieo-field-icon", "aria-hidden": "true", children: [_jsx("span", { className: "cieo-layer", "data-on": field.status === 'valid' || undefined, children: _jsx(CheckIcon, {}) }), _jsx("span", { className: "cieo-layer", "data-on": field.status === 'invalid' || undefined, children: _jsx(AlertIcon, {}) })] }), own.suffix ? _jsx("span", { className: "cieo-field-affix", children: own.suffix }) : null] }), own.description || props.footer ? (_jsxs("div", { className: "cieo-field-foot", children: [own.description ? (_jsx("p", { id: field.ids.desc, className: "cieo-desc", children: own.description })) : (_jsx("span", {})), props.footer] })) : null, _jsx("div", { className: "cieo-field-msg", "data-open": field.open || undefined, children: _jsx("div", { children: _jsx("p", { id: field.ids.msg, className: "cieo-field-error", "aria-live": "polite", children: field.message }) }) })] }));
}
