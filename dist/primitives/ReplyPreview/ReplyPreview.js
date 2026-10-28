// src/primitives/ReplyPreview/ReplyPreview.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/** Accessible name of the composer dismiss button. */
export function replyDismissLabel(author) {
    return `Cancel reply to ${author}`;
}
/** Accessible name of the quote jump button. */
export function replyJumpLabel(author) {
    return `Go to the message from ${author}`;
}
export function ReplyPreview({ className, slotProps, author, excerpt, variant = 'quote', onDismiss, onJump }) {
    const body = (_jsxs(_Fragment, { children: [_jsx("span", { className: "cieo-reply-preview-bar", "aria-hidden": "true", ...customizePart(slotProps?.bar, "cieo-reply-preview-bar", undefined) }), _jsxs("span", { className: "cieo-reply-preview-text", ...customizePart(slotProps?.text, "cieo-reply-preview-text", undefined), children: [_jsx("span", { className: "cieo-reply-preview-author", ...customizePart(slotProps?.author, "cieo-reply-preview-author", undefined), children: author }), _jsx("span", { className: "cieo-reply-preview-excerpt", ...customizePart(slotProps?.excerpt, "cieo-reply-preview-excerpt", undefined), children: excerpt })] })] }));
    if (variant === 'composer') {
        return (_jsxs("div", { className: "cieo cieo-reply-preview", "data-variant": "composer", ...customizePart(slotProps?.root, "cieo cieo-reply-preview", undefined, className), children: [body, onDismiss ? (_jsx("button", { type: "button", className: "cieo-reply-preview-dismiss", "aria-label": replyDismissLabel(author), onClick: onDismiss, ...customizePart(slotProps?.dismiss, "cieo-reply-preview-dismiss", undefined), children: _jsx("svg", { viewBox: "0 0 16 16", width: "12", height: "12", "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: "M4 4l8 8M12 4l-8 8", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }) }) })) : null] }));
    }
    if (onJump) {
        return (_jsx("button", { type: "button", className: "cieo cieo-reply-preview", "data-variant": "quote", "data-interactive": "", "aria-label": replyJumpLabel(author), onClick: onJump, ...customizePart(slotProps?.root, "cieo cieo-reply-preview", undefined, className), children: body }));
    }
    return (_jsx("div", { className: "cieo cieo-reply-preview", "data-variant": "quote", ...customizePart(slotProps?.root, "cieo cieo-reply-preview", undefined, className), children: body }));
}
