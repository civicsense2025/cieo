'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* AuthSessionList. Removal is immediate; surviving device rows reflow on Cieo's base spring. */
import { useRef } from 'react';
import { useFlip } from '../../react/index.js';
import { useAuthMotionDisabled } from '../AuthSignInCard/AuthMotion.js';
function SessionReflow({ list, order }) {
    useFlip(list, order, { stagger: 0.02 });
    return null;
}
export function AuthSessionList({ id, sessions, style, onRevoke }) {
    const list = useRef(null);
    const motionDisabled = useAuthMotionDisabled(list);
    const order = sessions.map((session) => session.id).join('\u0000');
    return (_jsxs("section", { className: "cieo cieo-auth-session-list", "aria-labelledby": `${id}-title`, style: style, children: [_jsx("h2", { className: "cieo-auth-card-title", id: `${id}-title`, children: "Sessions" }), _jsx("ul", { ref: list, className: "cieo-auth-sessions", role: "list", children: sessions.map((s) => (_jsxs("li", { className: "cieo-auth-session", role: "listitem", children: [_jsx("span", { className: "cieo-auth-session-device", children: s.device }), _jsxs("span", { className: "cieo-auth-session-meta", children: [s.location, " \u00B7 ", s.lastActive] }), s.current ? (_jsx("span", { className: "cieo-auth-session-current", children: "This device" })) : (_jsx("button", { type: "button", className: "cieo-auth-revoke", "aria-label": `Revoke ${s.device} session`, onClick: () => onRevoke(s.id), children: `Revoke ${s.device}` }))] }, s.id))) }), motionDisabled ? null : _jsx(SessionReflow, { list: list, order: order })] }));
}
