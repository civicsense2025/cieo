'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* AuthResetForm. Request and confirmation steps swap inside a soft measured-height frame. */
import { useState } from 'react';
import { AuthEmailField } from '../AuthEmailField/AuthEmailField.js';
import { AuthPasswordInput } from '../AuthPasswordInput/AuthPasswordInput.js';
import { AuthMotionFrame, AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';
export function AuthResetForm({ className, slotProps, id, step, pending, error, style, onRequest, onConfirm }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const request = (e) => { e.preventDefault(); if (!pending)
        onRequest(email); };
    const confirm = (e) => { e.preventDefault(); if (!pending)
        onConfirm(password); };
    return (_jsx("div", { className: "cieo cieo-auth-reset-form", style: style, ...customizePart(slotProps?.root, "cieo cieo-auth-reset-form", style, className), children: _jsx(AuthMotionFrame, { value: step, children: (shown, live) => shown === 'request' ? (_jsxs("form", { onSubmit: request, children: [_jsx(AuthEmailField, { id: `${id}-email`, value: email, onChange: setEmail }), _jsx(AuthMotionMessage, { className: "cieo-auth-error", role: "alert", value: live ? error : undefined }), _jsx("button", { type: "submit", className: "cieo-auth-submit", disabled: pending || !live, ...customizePart(slotProps?.submit, "cieo-auth-submit"), children: _jsx(AuthSwapText, { value: pending ? 'Sending…' : 'Send reset link' }) })] })) : (_jsxs("form", { onSubmit: confirm, children: [_jsx(AuthPasswordInput, { id: `${id}-password`, value: password, onChange: setPassword, autoComplete: "new-password", showStrength: true }), _jsx(AuthMotionMessage, { className: "cieo-auth-error", role: "alert", value: live ? error : undefined }), _jsx("button", { type: "submit", className: "cieo-auth-submit", disabled: pending || !live, ...customizePart(slotProps?.submit, "cieo-auth-submit"), children: _jsx(AuthSwapText, { value: pending ? 'Saving…' : 'Save new password' }) })] })) }) }));
}
