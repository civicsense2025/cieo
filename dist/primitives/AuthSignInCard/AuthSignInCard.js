'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { AuthCredentialForm } from '../AuthCredentialForm/AuthCredentialForm.js';
import { AuthCardShell } from '../auth-shared.js';
export { AuthCardShell } from '../auth-shared.js';
export function AuthSignInCard({ id, title = 'Sign in', pending, error, status, magicLinkHref, resetHref, signupHref, style, onSubmit, className, slotProps, slots }) {
    return (_jsx(AuthCardShell, { className: className, slotProps: slotProps, slots: slots, id: id, title: title, status: status, style: style, footer: _jsxs(_Fragment, { children: [magicLinkHref ? _jsx("a", { href: magicLinkHref, children: "Email me a link instead" }) : null, resetHref ? _jsx("a", { href: resetHref, children: "Forgot password?" }) : null, signupHref ? _jsx("a", { href: signupHref, children: "Create an account" }) : null] }), children: _jsx(AuthCredentialForm, { id: `${id}-form`, mode: "signin", pending: pending, error: error, onSubmit: onSubmit }) }));
}
