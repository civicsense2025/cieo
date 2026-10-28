// src/primitives/ActivityItem/ActivityItem.tsx
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/** Which element carries the row's main action: a link, a button, or nothing when the row is informational. */
export function activityMainTag(href, onSelect) {
    if (href)
        return 'a';
    if (onSelect)
        return 'button';
    return 'div';
}
export function ActivityItem({ className, slotProps, actor, icon, tone = 'neutral', children, preview, time, dateTime, unread = false, href, onSelect, actions }) {
    const Main = activityMainTag(href, onSelect);
    const text = (_jsxs(_Fragment, { children: [_jsxs("span", { className: "cieo-activity-item-line", ...customizePart(slotProps?.line, "cieo-activity-item-line"), children: [_jsx("strong", { className: "cieo-activity-item-actor", ...customizePart(slotProps?.actor, "cieo-activity-item-actor"), children: actor.name }), " ", _jsx("span", { className: "cieo-activity-item-what", ...customizePart(slotProps?.what, "cieo-activity-item-what"), children: children }), time ? _jsxs(_Fragment, { children: [" ", _jsx(ActivityTime, { time: time, dateTime: dateTime })] }) : null] }), preview ? _jsx("span", { className: "cieo-activity-item-preview", ...customizePart(slotProps?.preview, "cieo-activity-item-preview"), children: preview }) : null, unread ? _jsx("span", { className: "cieo-sr-only", children: ", unread" }) : null] }));
    return (_jsxs("div", { "data-unread": unread ? 'true' : undefined, "data-tone": tone, "data-interactive": Main === 'div' ? undefined : 'true', className: "cieo cieo-activity-item", ...customizePart(slotProps?.root, "cieo cieo-activity-item", undefined, className), children: [_jsxs("span", { className: "cieo-activity-item-lead", ...customizePart(slotProps?.lead, "cieo-activity-item-lead"), children: [_jsx("span", { className: "cieo-activity-item-avatar", ...customizePart(slotProps?.avatar, "cieo-activity-item-avatar"), children: actor.avatar }), icon ? _jsx("span", { "aria-hidden": "true", className: "cieo-activity-item-badge", ...customizePart(slotProps?.badge, "cieo-activity-item-badge"), children: icon }) : null] }), Main === 'a' ? (_jsx("a", { href: href, onClick: onSelect, className: "cieo-activity-item-main", ...customizePart(slotProps?.main, "cieo-activity-item-main"), children: text })) : Main === 'button' ? (_jsx("button", { type: "button", onClick: onSelect, className: "cieo-activity-item-main", ...customizePart(slotProps?.main, "cieo-activity-item-main"), children: text })) : (_jsx("div", { className: "cieo-activity-item-main", ...customizePart(slotProps?.main, "cieo-activity-item-main"), children: text })), _jsx("span", { "aria-hidden": "true", className: "cieo-activity-item-dot", ...customizePart(slotProps?.dot, "cieo-activity-item-dot") }), actions ? _jsx("span", { className: "cieo-activity-item-actions", ...customizePart(slotProps?.actions, "cieo-activity-item-actions"), children: actions }) : null] }));
}
function ActivityTime({ time, dateTime }) {
    return _jsx("time", { dateTime: dateTime, className: "cieo-activity-item-time", children: time });
}
