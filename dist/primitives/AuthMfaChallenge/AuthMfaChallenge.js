'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* AuthMfaChallenge (static). OTP plus verify, with a recovery-code fallback toggle. */
import { useState } from 'react';
import { AuthOtpInput } from '../AuthOtpInput/AuthOtpInput.js';
export function AuthMfaChallenge({ id, pending, error, style, onSubmit, onRecovery }) {
    const [useRecovery, setUseRecovery] = useState(false);
    const [recovery, setRecovery] = useState('');
    return (_jsxs("div", { className: "cieo cieo-auth-mfa-challenge", style: style, children: [useRecovery ? (_jsxs("span", { className: "cieo-auth-recovery", children: [_jsx("label", { className: "cieo-auth-label", htmlFor: `${id}-recovery`, children: "Recovery code" }), _jsx("input", { id: `${id}-recovery`, className: "cieo-auth-input", autoComplete: "off", value: recovery, disabled: pending, onChange: e => setRecovery(e.target.value) }), _jsx("button", { type: "button", className: "cieo-auth-submit", disabled: pending || !recovery, onClick: () => onRecovery(recovery.toLowerCase().replace(/[\s-]/g, '')), children: pending ? 'Checking…' : 'Use recovery code' })] })) : (_jsx(AuthOtpInput, { id: `${id}-otp`, disabled: pending, error: error, onComplete: onSubmit })), error ? _jsx("span", { className: "cieo-auth-error", role: "alert", children: error }) : null, _jsx("button", { type: "button", className: "cieo-auth-toggle", disabled: pending, onClick: () => setUseRecovery(v => !v), children: useRecovery ? 'Use the authenticator instead' : 'Use a recovery code instead' })] }));
}
