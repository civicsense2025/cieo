// src/primitives/ByLine/ByLine.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { safeHref } from '../Mention/Mention.js';
import { customizePart } from '../customization.js';
function Linked({ href, className, children }) {
    const safe = safeHref(href) ?? undefined;
    return safe ? (_jsx("a", { className: className, href: safe, children: children })) : (_jsx("span", { className: className, children: children }));
}
export function ByLine({ className, slotProps, author, href, badge, context, contextHref, time, dateTime, handle, id }) {
    const hasContext = context !== undefined && context !== null && context !== false;
    return (_jsxs("span", { id: id, className: "cieo cieo-by-line", ...customizePart(slotProps?.root, "cieo cieo-by-line", undefined, className), children: [_jsx(Linked, { href: href, className: "cieo-by-line-author", children: author }), badge ? _jsx("span", { className: "cieo-by-line-badge", ...customizePart(slotProps?.badge, "cieo-by-line-badge", undefined), children: badge }) : null, handle ? _jsxs("span", { className: "cieo-by-line-handle", ...customizePart(slotProps?.handle, "cieo-by-line-handle", undefined), children: ["@", handle] }) : null, hasContext ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "cieo-by-line-sep", "aria-hidden": "true", ...customizePart(slotProps?.separator, "cieo-by-line-sep", undefined), children: "\u203A" }), _jsx(Linked, { href: contextHref, className: "cieo-by-line-context", children: context })] })) : null, time ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "cieo-by-line-sep", "aria-hidden": "true", ...customizePart(slotProps?.separator, "cieo-by-line-sep", undefined), children: "\u00B7" }), _jsx("time", { className: "cieo-by-line-time", dateTime: dateTime, ...customizePart(slotProps?.time, "cieo-by-line-time", undefined), children: time })] })) : null] }));
}
