'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AuthMotionMessage, AuthSwapText } from '../AuthSignInCard/AuthMotion.js';
export function AuthInviteAccept({ id, orgName, inviterName, role, pending, error, style, onAccept, onDecline }) {
    return (_jsxs("section", { className: "cieo cieo-auth-invite-accept", "aria-labelledby": `${id}-title`, style: style, children: [_jsx("h2", { className: "cieo-auth-card-title", id: `${id}-title`, children: "You're invited" }), _jsxs("p", { className: "cieo-auth-invite-text", children: [inviterName, " invited you to join ", orgName, " as ", role, "."] }), _jsx(AuthMotionMessage, { className: "cieo-auth-error", role: "alert", value: error }), _jsxs("div", { className: "cieo-auth-invite-actions", children: [_jsx("button", { type: "button", className: "cieo-auth-accept", disabled: pending, onClick: onAccept, children: _jsx(AuthSwapText, { value: pending ? 'Accepting…' : `Accept invite to ${orgName}` }) }), _jsx("button", { type: "button", className: "cieo-auth-decline", disabled: pending, onClick: onDecline, children: `Decline invite to ${orgName}` })] })] }));
}
