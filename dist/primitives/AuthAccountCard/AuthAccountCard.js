'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* AuthAccountCard (static). Profile row with sign out; an inline confirm step guards bulk sign-out. */
import { useState } from 'react';
export function AuthAccountCard({ id, name, email, avatarInitials, signOutConfirm, style, onSignOut }) {
    const [confirming, setConfirming] = useState(false);
    const start = () => {
        if (signOutConfirm)
            setConfirming(true);
        else
            onSignOut();
    };
    const confirm = () => { setConfirming(false); onSignOut(); };
    return (_jsxs("section", { className: "cieo cieo-auth-account-card", "aria-labelledby": `${id}-title`, style: style, children: [_jsx("h2", { className: "cieo-auth-card-title", id: `${id}-title`, children: "Account" }), _jsxs("p", { className: "cieo-auth-profile", children: [_jsx("span", { className: "cieo-auth-avatar", "aria-hidden": "true", children: avatarInitials }), _jsxs("span", { className: "cieo-auth-identity", children: [_jsx("span", { className: "cieo-auth-name", children: name }), _jsx("span", { className: "cieo-auth-email", children: email })] })] }), confirming ? (_jsxs("div", { className: "cieo-auth-signout-confirm", children: [_jsx("p", { className: "cieo-auth-status", role: "status", children: "Sign out of all devices?" }), _jsxs("div", { className: "cieo-auth-invite-actions", children: [_jsx("button", { type: "button", className: "cieo-auth-accept", onClick: confirm, children: "Confirm sign out" }), _jsx("button", { type: "button", className: "cieo-auth-decline", onClick: () => setConfirming(false), children: "Cancel" })] })] })) : (_jsx("button", { type: "button", className: "cieo-auth-signout", onClick: start, children: "Sign out" }))] }));
}
