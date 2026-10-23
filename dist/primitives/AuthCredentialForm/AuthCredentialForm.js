'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* AuthCredentialForm. Email plus password with motion-preserving pending and error states. */
import { useState } from 'react';
import { AuthEmailField } from '../AuthEmailField/AuthEmailField.js';
import { AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';
import { AuthPasswordInput } from '../AuthPasswordInput/AuthPasswordInput.js';
export function AuthCredentialForm({ id, mode = 'signin', pending, error, style, onSubmit }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const submit = (e) => { e.preventDefault(); if (!pending)
        onSubmit({ email, password }); };
    return (_jsxs("form", { className: "cieo cieo-auth-credential-form", style: style, onSubmit: submit, noValidate: true, children: [_jsx(AuthEmailField, { id: `${id}-email`, value: email, onChange: setEmail }), _jsx(AuthPasswordInput, { id: `${id}-password`, value: password, onChange: setPassword, showStrength: mode === 'signup', autoComplete: mode === 'signup' ? 'new-password' : 'current-password' }), _jsx(AuthMotionMessage, { className: "cieo-auth-error", role: "alert", value: error }), _jsx("button", { type: "submit", className: "cieo-auth-submit", disabled: pending, children: _jsx(AuthSwapText, { value: pending ? (mode === 'signup' ? 'Creating account…' : 'Signing in…') : (mode === 'signup' ? 'Create account' : 'Sign in') }) })] }));
}
