'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/* AuthMfaChallenge. OTP and recovery panes share a measured spring-sized frame. */
import { useState } from 'react';
import { AuthOtpInput } from '../AuthOtpInput/AuthOtpInput.js';
import { AuthMotionFrame, AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';
export function AuthMfaChallenge({ className, slotProps, id, pending, error, style, onSubmit, onRecovery }) {
    const [useRecovery, setUseRecovery] = useState(false);
    const [recovery, setRecovery] = useState('');
    const pane = useRecovery ? 'recovery' : 'otp';
    return (_jsxs("div", { className: "cieo cieo-auth-mfa-challenge", style: style, ...customizePart(slotProps?.root, "cieo cieo-auth-mfa-challenge", style, className), children: [_jsx(AuthMotionFrame, { value: pane, children: (shown, live) => shown === 'recovery' ? (_jsxs("span", { className: "cieo-auth-recovery", ...customizePart(slotProps?.recovery, "cieo-auth-recovery"), children: [_jsx("label", { className: "cieo-auth-label", htmlFor: `${id}-recovery`, ...customizePart(slotProps?.label, "cieo-auth-label"), children: "Recovery code" }), _jsx("input", { id: `${id}-recovery`, className: "cieo-auth-input", autoComplete: "off", value: recovery, disabled: pending || !live, "aria-invalid": error ? 'true' : undefined, onChange: e => setRecovery(e.target.value), ...customizePart(slotProps?.input, "cieo-auth-input") }), _jsx("button", { type: "button", className: "cieo-auth-submit", disabled: pending || !recovery || !live, onClick: () => onRecovery(recovery.toLowerCase().replace(/[\s-]/g, '')), ...customizePart(slotProps?.submit, "cieo-auth-submit"), children: _jsx(AuthSwapText, { value: pending ? 'Checking…' : 'Use recovery code' }) }), _jsx(AuthMotionMessage, { className: "cieo-auth-error", role: "alert", value: live ? error : undefined })] })) : (_jsx(AuthOtpInput, { id: `${id}-otp`, disabled: pending || !live, error: live ? error : undefined, onComplete: live ? onSubmit : undefined })) }), _jsx("button", { type: "button", className: "cieo-auth-toggle", disabled: pending, onClick: () => setUseRecovery(v => !v), ...customizePart(slotProps?.toggle, "cieo-auth-toggle"), children: _jsx(AuthSwapText, { value: useRecovery ? 'Use the authenticator instead' : 'Use a recovery code instead' }) })] }));
}
