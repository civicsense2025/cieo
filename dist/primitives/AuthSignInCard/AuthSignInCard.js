'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { AuthCredentialForm } from '../AuthCredentialForm/AuthCredentialForm';
export function AuthCardShell({ id, title, status, style, children, footer }) {
    return (_jsxs("section", { className: "cieo cieo-auth-card", "aria-labelledby": `${id}-title`, style: style, children: [_jsx("h2", { className: "cieo-auth-card-title", id: `${id}-title`, children: title }), children, status ? _jsx("p", { className: "cieo-auth-status", role: "status", children: status }) : null, footer ? _jsx("p", { className: "cieo-auth-routes", children: footer }) : null] }));
}
export function AuthSignInCard({ id, title = 'Sign in', pending, error, status, magicLinkHref, resetHref, signupHref, style, onSubmit }) {
    return (_jsx(AuthCardShell, { id: id, title: title, status: status, style: style, footer: _jsxs(_Fragment, { children: [magicLinkHref ? _jsx("a", { href: magicLinkHref, children: "Email me a link instead" }) : null, resetHref ? _jsx("a", { href: resetHref, children: "Forgot password?" }) : null, signupHref ? _jsx("a", { href: signupHref, children: "Create an account" }) : null] }), children: _jsx(AuthCredentialForm, { id: `${id}-form`, mode: "signin", pending: pending, error: error, onSubmit: onSubmit }) }));
}
