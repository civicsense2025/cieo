// src/primitives/UnreadDivider/UnreadDivider.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* UnreadDivider. A rule with a centered label that marks where the unread messages begin. The host decides where it sits and how many are unread. */
/** Text for the divider: the host's label when given, else "3 new messages" / "1 new message" for a count, else "New messages". */
export function unreadDividerLabel(count, label) {
    const custom = label?.trim();
    if (custom)
        return custom;
    const n = typeof count === 'number' && Number.isFinite(count) ? Math.floor(count) : 0;
    if (n <= 0)
        return 'New messages';
    return `${n} new ${n === 1 ? 'message' : 'messages'}`;
}
export function UnreadDivider({ count, label }) {
    const text = unreadDividerLabel(count, label);
    return (_jsxs("div", { role: "separator", "aria-label": text, className: "cieo cieo-unread-divider", children: [_jsx("span", { "aria-hidden": "true", className: "cieo-unread-divider-rule" }), _jsx("span", { "aria-hidden": "true", className: "cieo-unread-divider-label", children: text }), _jsx("span", { "aria-hidden": "true", className: "cieo-unread-divider-rule" })] }));
}
