'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { AuthCardShell } from '../AuthSignInCard/AuthSignInCard';
import { AuthResetForm } from '../AuthResetForm/AuthResetForm';
export function AuthResetFlow({ id, title = 'Reset your password', step, pending, error, status, signinHref, style, onRequest, onConfirm }) {
    return (_jsx(AuthCardShell, { id: id, title: title, status: status, style: style, footer: signinHref ? _jsx("a", { href: signinHref, children: "Back to sign in" }) : null, children: _jsx(AuthResetForm, { id: `${id}-form`, step: step, pending: pending, error: error, onRequest: onRequest, onConfirm: onConfirm }) }));
}
