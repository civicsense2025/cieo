'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* AuthResetForm (static). Request step plus confirm step for password reset. */
import { useState } from 'react';
import { AuthEmailField } from '../AuthEmailField/AuthEmailField.js';
import { AuthPasswordInput } from '../AuthPasswordInput/AuthPasswordInput.js';
export function AuthResetForm({ id, step, pending, error, style, onRequest, onConfirm }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const request = (e) => { e.preventDefault(); if (!pending)
        onRequest(email); };
    const confirm = (e) => { e.preventDefault(); if (!pending)
        onConfirm(password); };
    return (_jsx("div", { className: "cieo cieo-auth-reset-form", style: style, children: step === 'request' ? (_jsxs("form", { onSubmit: request, children: [_jsx(AuthEmailField, { id: `${id}-email`, value: email, onChange: setEmail }), error ? _jsx("span", { className: "cieo-auth-error", role: "alert", children: error }) : null, _jsx("button", { type: "submit", className: "cieo-auth-submit", disabled: pending, children: pending ? 'Sending…' : 'Send reset link' })] })) : (_jsxs("form", { onSubmit: confirm, children: [_jsx(AuthPasswordInput, { id: `${id}-password`, value: password, onChange: setPassword, autoComplete: "new-password", showStrength: true }), error ? _jsx("span", { className: "cieo-auth-error", role: "alert", children: error }) : null, _jsx("button", { type: "submit", className: "cieo-auth-submit", disabled: pending, children: pending ? 'Saving…' : 'Save new password' })] })) }));
}
