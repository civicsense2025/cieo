'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* Checkbox, Radio and Switch. Each is a native input (so forms, keyboard, no-JS and assistive tech all work as the
   platform does) laid over a drawn visual. The motion is CSS keyed off :checked, on the spring tokens:
   the checkbox fills, then its check draws 40ms later (checklist recipe); the radio dot grows on snap; the switch
   knob leads with one edge and trails with the other, and widens toward its destination while pressed (switch recipe). */
import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState } from 'react';
import { cx } from './classes.js';
function useMergedRef(ref) {
    const own = useRef(null);
    const set = (el) => {
        own.current = el;
        if (typeof ref === 'function')
            ref(el);
        else if (ref)
            ref.current = el;
    };
    return [own, set];
}
function ToggleText({ label, hideLabel, description, descId }) {
    return (_jsxs("span", { className: hideLabel ? 'cieo-vh' : 'cieo-toggle-text', children: [_jsx("span", { className: "cieo-toggle-label", children: label }), description ? (_jsx("span", { id: descId, className: "cieo-desc", children: description })) : null] }));
}
export const Checkbox = forwardRef(function Checkbox(props, ref) {
    const { label, hideLabel, description, indeterminate, className, ...rest } = props;
    const uid = useId();
    const [own, set] = useMergedRef(ref);
    useEffect(() => {
        if (own.current)
            own.current.indeterminate = !!indeterminate;
    }, [indeterminate]);
    return (_jsxs("label", { className: cx('cieo-ctl', 'cieo-toggle', 'cieo-check', className), children: [_jsxs("span", { className: "cieo-toggle-hit", children: [_jsx("input", { ...rest, ref: set, type: "checkbox", className: "cieo-toggle-input", "aria-describedby": description ? `${uid}d` : rest['aria-describedby'] }), _jsx("span", { className: "cieo-check-box", "aria-hidden": "true", children: _jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round", focusable: false, children: [_jsx("path", { className: "cieo-check-tick", d: "M5 12.5 10 17.5 19 7", pathLength: 1 }), _jsx("path", { className: "cieo-check-dash", d: "M6 12h12", pathLength: 1 })] }) })] }), _jsx(ToggleText, { label: label, hideLabel: hideLabel, description: description, descId: `${uid}d` })] }));
});
export const Switch = forwardRef(function Switch(props, ref) {
    const { label, hideLabel, description, className, ...rest } = props;
    const uid = useId();
    return (_jsxs("label", { className: cx('cieo-ctl', 'cieo-toggle', 'cieo-switch', className), children: [_jsxs("span", { className: "cieo-toggle-hit", children: [_jsx("input", { ...rest, ref: ref, type: "checkbox", role: "switch", className: "cieo-toggle-input", "aria-describedby": description ? `${uid}d` : rest['aria-describedby'] }), _jsx("span", { className: "cieo-switch-track", "aria-hidden": "true", children: _jsx("span", { className: "cieo-switch-knob" }) })] }), _jsx(ToggleText, { label: label, hideLabel: hideLabel, description: description, descId: `${uid}d` })] }));
});
const Group = createContext(null);
export function RadioGroup(props) {
    const { label, hideLabel, description, name, onValueChange, disabled, required, form, orientation = 'vertical', className, children } = props;
    const uid = useId();
    const [inner, setInner] = useState(props.defaultValue);
    const controlled = props.value !== undefined;
    const ctx = {
        name,
        value: controlled ? props.value : inner,
        defaultValue: props.defaultValue,
        disabled,
        required,
        form,
        pick: (v) => {
            if (!controlled)
                setInner(v);
            onValueChange?.(v);
        },
    };
    return (_jsxs("fieldset", { className: cx('cieo-ctl', 'cieo-radio-group', className), "data-orientation": orientation, disabled: disabled, "aria-describedby": description ? `${uid}d` : undefined, children: [_jsx("legend", { className: hideLabel ? 'cieo-vh' : 'cieo-label', children: label }), description ? (_jsx("p", { id: `${uid}d`, className: "cieo-desc", children: description })) : null, _jsx("div", { className: "cieo-radio-items", children: _jsx(Group.Provider, { value: ctx, children: children }) })] }));
}
export const Radio = forwardRef(function Radio(props, ref) {
    const { label, hideLabel, description, className, value, onChange, ...rest } = props;
    const g = useContext(Group);
    const uid = useId();
    /* Inside a group the group owns checked; it is always controlled after hydration and server-rendered checked. */
    const checked = g ? g.value === value : rest.checked;
    return (_jsxs("label", { className: cx('cieo-ctl', 'cieo-toggle', 'cieo-radio', className), children: [_jsxs("span", { className: "cieo-toggle-hit", children: [_jsx("input", { ...rest, ref: ref, type: "radio", name: g?.name, value: value, form: g?.form ?? rest.form, required: g?.required ?? rest.required, checked: checked, onChange: (e) => {
                            g?.pick(value, e);
                            onChange?.(e);
                        }, className: "cieo-toggle-input", "aria-describedby": description ? `${uid}d` : rest['aria-describedby'] }), _jsx("span", { className: "cieo-radio-dot", "aria-hidden": "true" })] }), _jsx(ToggleText, { label: label, hideLabel: hideLabel, description: description, descId: `${uid}d` })] }));
});
