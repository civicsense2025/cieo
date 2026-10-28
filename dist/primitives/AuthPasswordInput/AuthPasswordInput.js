'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* AuthPasswordInput. Password input with snap strength feedback and a focus-preserving show/hide swap. */
import { useRef, useState } from 'react';
import { AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';
import { customizePart } from '../customization.js';
function scorePassword(pw) {
    let score = 0;
    if (pw.length >= 8)
        score += 1;
    if (pw.length >= 12)
        score += 1;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw))
        score += 1;
    if (/\d/.test(pw) && /[^a-zA-Z0-9]/.test(pw))
        score += 1;
    return Math.min(score, 4);
}
const STRENGTH_LABELS = ['Too weak', 'Weak', 'Okay', 'Strong', 'Very strong'];
export function AuthPasswordInput({ className, slotProps, id, label = 'Password', value, defaultValue, error, disabled, showStrength = true, autoComplete = 'current-password', style, onChange, onBlur }) {
    const [shown, setShown] = useState(false);
    const [inner, setInner] = useState(defaultValue ?? '');
    const inputRef = useRef(null);
    const current = value ?? inner;
    const score = scorePassword(current);
    const describedBy = error ? `${id}-error` : undefined;
    return (_jsxs("span", { className: "cieo cieo-auth-password-input", "data-invalid": error ? 'true' : undefined, style: style, ...customizePart(slotProps?.root, "cieo cieo-auth-password-input", style, className), children: [_jsx("label", { className: "cieo-auth-label", htmlFor: id, ...customizePart(slotProps?.label, "cieo-auth-label", undefined), children: label }), _jsxs("span", { className: "cieo-auth-password-wrap", ...customizePart(slotProps?.control, "cieo-auth-password-wrap", undefined), children: [_jsx("input", { ref: inputRef, id: id, className: "cieo-auth-input", type: shown ? 'text' : 'password', autoComplete: autoComplete, value: value, defaultValue: value === undefined ? defaultValue : undefined, disabled: disabled, "aria-invalid": error ? 'true' : undefined, "aria-describedby": describedBy, onChange: e => { setInner(e.target.value); onChange?.(e.target.value); }, onBlur: onBlur, ...customizePart(slotProps?.input, "cieo-auth-input", undefined) }), _jsx("button", { type: "button", className: "cieo-auth-visibility", "aria-label": shown ? 'Hide password' : 'Show password', "aria-pressed": shown, disabled: disabled, onClick: () => { setShown(s => !s); inputRef.current?.focus(); }, ...customizePart(slotProps?.toggle, "cieo-auth-visibility", undefined), children: _jsx(AuthSwapText, { value: shown ? 'Hide' : 'Show' }) })] }), showStrength ? (_jsx("span", { className: "cieo-auth-meter", role: current ? 'meter' : undefined, "aria-hidden": current ? undefined : 'true', "aria-label": current ? 'Password strength' : undefined, "aria-valuemin": current ? 0 : undefined, "aria-valuemax": current ? 4 : undefined, "aria-valuenow": current ? score : undefined, "aria-valuetext": current ? STRENGTH_LABELS[score] : undefined, "data-score": score, "data-open": current ? '' : undefined, ...customizePart(slotProps?.strength, "cieo-auth-meter", undefined), children: [0, 1, 2, 3].map(i => (_jsx("i", { "data-filled": i < score ? 'true' : undefined }, i))) })) : null, _jsx(AuthMotionMessage, { id: `${id}-error`, className: "cieo-auth-error", role: "alert", value: error })] }));
}
