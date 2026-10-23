// src/primitives/RichText/RichText.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* RichText. Turns plain post text into safe inline nodes: links, @mentions, #tags and line breaks. Never injects HTML; only http(s) becomes a link. */
import { Fragment } from 'react';
import { Mention, safeHref } from '../Mention/Mention.js';
const TRAILING = new Set(['.', ',', ';', ':', '!', '?', '"', "'", '’', '”', '…', ']', '}']);
const count = (s, ch) => s.split(ch).length - 1;
/** Splits a matched address from the punctuation that ends the sentence around it. Parentheses are counted once, so the work is linear. */
export function trimUrl(raw) {
    let end = raw.length;
    let open = count(raw, '(');
    let close = count(raw, ')');
    while (end > 0) {
        const last = raw[end - 1];
        if (TRAILING.has(last))
            end -= 1;
        else if (last === ')' && close > open) {
            close -= 1;
            end -= 1;
        }
        else
            break;
    }
    return { url: raw.slice(0, end), rest: raw.slice(end) };
}
/** Full http(s) address for a matched url, or null when it is not a safe web address. */
function toHref(url) {
    const full = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const safe = safeHref(full, { relative: false });
    if (!safe)
        return null;
    try {
        const parsed = new URL(safe);
        // A name or password before the host can pass one site off as another in the link text.
        if (parsed.username !== '' || parsed.password !== '')
            return null;
        return parsed.hostname.includes('.') || /^https?:\/\/localhost\b/i.test(safe) ? safe : null;
    }
    catch {
        return null;
    }
}
const PATTERN = new RegExp([
    '(?<break>\\r\\n|\\r|\\n)',
    '(?<url>https?:\\/\\/[^\\s<>]+|(?<![\\p{L}\\p{N}_@./:#%-])(?:www\\.)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,}\\/[^\\s<>]*)',
    '(?<mention>(?<![\\p{L}\\p{N}!#$%&\'*+\\-/=?^_`{|}~@.:"])@[\\p{L}\\p{N}_](?:[\\p{L}\\p{N}_.]{0,28}[\\p{L}\\p{N}_])?(?![\\p{L}\\p{N}_-]))',
    '(?<tag>(?<![\\p{L}\\p{N}_&#/])#\\p{L}[\\p{L}\\p{N}_]*)',
].join('|'), 'giu');
/** Splits post text into text, url, mention, tag and break tokens. Pure; the same input always gives the same tokens, and joining every value rebuilds the text (breaks as newlines). */
export function tokenizeRichText(text) {
    const out = [];
    const pushText = (value) => {
        if (value === '')
            return;
        const prev = out[out.length - 1];
        if (prev && prev.type === 'text')
            prev.value += value;
        else
            out.push({ type: 'text', value });
    };
    const source = String(text ?? '');
    let cursor = 0;
    for (const m of source.matchAll(PATTERN)) {
        const at = m.index ?? 0;
        pushText(source.slice(cursor, at));
        cursor = at + m[0].length;
        const g = m.groups ?? {};
        if (g.break !== undefined)
            out.push({ type: 'break', value: '\n' });
        else if (g.url !== undefined) {
            const { url, rest } = trimUrl(g.url);
            const href = toHref(url);
            if (href) {
                out.push({ type: 'url', value: url, href });
                pushText(rest);
            }
            else
                pushText(g.url);
        }
        else if (g.mention !== undefined)
            out.push({ type: 'mention', value: g.mention });
        else if (g.tag !== undefined)
            out.push({ type: 'tag', value: g.tag });
    }
    pushText(source.slice(cursor));
    return out;
}
/** Display form of an address: no scheme or www.; preserve the parsed host and shorten only its path. */
export function shortenUrl(url, max = 28) {
    const source = String(url ?? '').trim();
    const bare = source.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
    const limit = Math.max(1, Math.floor(Number.isFinite(max) ? max : 28));
    const ellipsize = (value) => {
        const chars = Array.from(value);
        return chars.length <= limit ? value : `${chars.slice(0, limit - 1).join('')}…`;
    };
    const full = /^https?:\/\//i.test(source) ? source : `https://${source}`;
    const safe = safeHref(full, { relative: false });
    if (!safe)
        return ellipsize(bare);
    try {
        const parsed = new URL(safe);
        if (parsed.hostname === '')
            return ellipsize(bare);
        const host = parsed.host.replace(/^www\./i, '');
        const hostname = parsed.hostname;
        if (!hostname.includes('.') && hostname !== 'localhost' && !hostname.startsWith('['))
            return ellipsize(bare);
        let path = parsed.pathname === '/' && !parsed.search && !parsed.hash ? '' : parsed.pathname;
        if (path) {
            try {
                const decoded = decodeURI(path);
                if (!/[\p{Cc}\p{Cf}\u2028\u2029]/u.test(decoded))
                    path = decoded;
            }
            catch {
                /* Keep malformed or incomplete escapes in their safe encoded form. */
            }
        }
        const route = `${path}${parsed.search}${parsed.hash}`;
        const hostLength = Array.from(host).length;
        const available = limit - hostLength;
        if (!route)
            return host;
        if (available <= 0)
            return `${host}…`;
        const routeChars = Array.from(route);
        if (routeChars.length <= available)
            return `${host}${route}`;
        return `${host}${routeChars.slice(0, available - 1).join('')}…`;
    }
    catch {
        return ellipsize(bare);
    }
}
export function RichText({ text, hrefFor, maxUrlLength = 28 }) {
    const nodes = tokenizeRichText(text).map((t, i) => {
        if (t.type === 'break')
            return _jsx("br", {}, i);
        if (t.type === 'url' && t.href)
            return (_jsx("a", { className: "cieo-rich-text-link", href: t.href, title: t.href, target: "_blank", rel: "noopener noreferrer ugc nofollow", children: shortenUrl(t.value, maxUrlLength) }, i));
        if (t.type === 'mention') {
            const handle = t.value.slice(1);
            return _jsx(Mention, { handle: handle, href: hrefFor?.mention?.(handle) }, i);
        }
        if (t.type === 'tag') {
            const tag = t.value.slice(1);
            const href = safeHref(hrefFor?.tag?.(tag));
            return href ? (_jsx("a", { className: "cieo-rich-text-tag", href: href, children: t.value }, i)) : (_jsx("span", { className: "cieo-rich-text-tag", children: t.value }, i));
        }
        return _jsx(Fragment, { children: t.value }, i);
    });
    return _jsx("span", { className: "cieo cieo-rich-text", children: nodes });
}
