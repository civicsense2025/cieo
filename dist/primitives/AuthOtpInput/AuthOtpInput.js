'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* AuthOtpInput (static). Digit boxes for verification codes. Paste with spaces or dashes normalizes to digits; focus advances on entry and retreats on Backspace. */
import { useRef, useState } from 'react';
export function AuthOtpInput({ id, length = 6, label = 'Verification code', error, disabled, style, onComplete, onChange }) {
    const [digits, setDigits] = useState(() => Array.from({ length }, () => ''));
    const boxes = useRef([]);
    const describedBy = error ? `${id}-error` : undefined;
    const commit = (next) => {
        setDigits(next);
        const code = next.join('');
        onChange?.(code);
        if (next.every(d => d !== ''))
            onComplete?.(code);
    };
    const focusBox = (i) => boxes.current[Math.max(0, Math.min(length - 1, i))]?.focus();
    const onPasteText = (text, start) => {
        const clean = text.replace(/\D/g, '').slice(0, length - start);
        if (!clean)
            return;
        const next = [...digits];
        for (let k = 0; k < clean.length; k += 1)
            next[start + k] = clean[k];
        commit(next);
        focusBox(start + clean.length);
    };
    return (_jsxs("span", { className: "cieo cieo-auth-otp-input", "data-invalid": error ? 'true' : undefined, style: style, role: "group", "aria-labelledby": `${id}-label`, children: [_jsx("span", { className: "cieo-auth-label", id: `${id}-label`, children: label }), _jsx("span", { className: "cieo-auth-otp-boxes", children: digits.map((d, i) => (_jsx("input", { ref: el => { boxes.current[i] = el; }, className: "cieo-auth-otp-box", inputMode: "numeric", autoComplete: i === 0 ? 'one-time-code' : 'off', maxLength: 1, value: d, disabled: disabled, "aria-label": `Digit ${i + 1} of ${length}`, "aria-invalid": error ? 'true' : undefined, "aria-describedby": describedBy, onChange: e => {
                        const v = e.target.value.replace(/\D/g, '').slice(-1);
                        if (!v && e.target.value)
                            return;
                        const next = [...digits];
                        next[i] = v;
                        commit(next);
                        if (v)
                            focusBox(i + 1);
                    }, onKeyDown: e => {
                        if (e.key === 'Backspace' && !digits[i])
                            focusBox(i - 1);
                    }, onPaste: e => { e.preventDefault(); onPasteText(e.clipboardData.getData('text'), i); } }, i))) }), error ? _jsx("span", { id: `${id}-error`, className: "cieo-auth-error", role: "alert", children: error }) : null] }));
}
