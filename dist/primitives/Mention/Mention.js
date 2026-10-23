// src/primitives/Mention/Mention.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* Mention. An @handle inside post text: a link when the host gives a safe address, plain text otherwise. */
/** Handle without a leading @ and surrounding space. Empty when the input is blank or contains whitespace. */
export function normalizeHandle(raw) {
    const trimmed = String(raw ?? '').trim();
    const bare = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
    if (bare === '' || /\s/.test(bare))
        return '';
    return bare;
}
/** The address when it is safe to put in an href, else null. User content is untrusted, so only http and https URLs with a host pass, plus same-site relative links (/path, ./path, ../path, #hash or ?query) unless `relative` is false. Protocol-relative (//host) and backslash tricks are refused because browsers resolve them to another site. */
export function safeHref(href, opts = {}) {
    if (typeof href !== 'string')
        return null;
    const value = href.trim();
    // eslint-disable-next-line no-control-regex
    if (value === '' || /[\u0000-\u001f\u007f]/.test(value))
        return null;
    if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
        try {
            const url = new URL(value);
            return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== '' ? value : null;
        }
        catch {
            return null;
        }
    }
    if (opts.relative === false)
        return null;
    // Explicit same-site forms only; a bare "x.com/a" is almost always a mistyped outside address.
    return /^(?:\/(?![/\\])|#|\?|\.{1,2}\/)/.test(value) ? value : null;
}
export function Mention({ handle, href, name }) {
    const clean = normalizeHandle(handle);
    if (clean === '')
        return null;
    const safe = href === undefined ? null : safeHref(href);
    const text = `@${clean}`;
    return safe ? (_jsx("a", { className: "cieo cieo-mention", href: safe, title: name, children: text })) : (_jsx("span", { className: "cieo cieo-mention", title: name, children: text }));
}
