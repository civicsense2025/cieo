// src/primitives/RichText/RichText.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* RichText. Turns plain post text into safe inline nodes: links, @mentions, #tags and line breaks. Never injects HTML; only http(s) becomes a link. */
import { Fragment } from 'react';
import { Mention, safeHref } from '../Mention/Mention.js';
const TRAILING = new Set(['.', ',', ';', ':', '!', '?', '"', "'", '’', '”', '…', ']', '}']);
const count = (s, ch) => s.split(ch).length - 1;
/** Splits a matched address from the punctuation that ends the sentence around it. */
export function trimUrl(raw) {
    let end = raw.length;
    while (end > 0) {
        const last = raw[end - 1];
        const head = raw.slice(0, end);
        if (TRAILING.has(last) || (last === ')' && count(head, ')') > count(head, '(')))
            end -= 1;
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
        return new URL(safe).hostname.includes('.') || /^https?:\/\/localhost\b/i.test(safe) ? safe : null;
    }
    catch {
        return null;
    }
}
const PATTERN = new RegExp([
    '(?<break>\\r\\n|\\r|\\n)',
    '(?<url>https?:\\/\\/[^\\s<>]+|(?<![\\p{L}\\p{N}_@./:#%-])(?:www\\.)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,}\\/[^\\s<>]*)',
    '(?<mention>(?<![\\p{L}\\p{N}_@./:#&])@[\\p{L}\\p{N}_](?:[\\p{L}\\p{N}_.]{0,28}[\\p{L}\\p{N}_])?)',
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
/** Display form of an address: no scheme, no www., end ellipsized so the result is at most `max` characters. */
export function shortenUrl(url, max = 28) {
    const bare = String(url ?? '')
        .trim()
        .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
        .replace(/^www\./i, '')
        .replace(/\/$/, '');
    const limit = Math.max(1, Math.floor(Number.isFinite(max) ? max : 28));
    const chars = Array.from(bare);
    return chars.length <= limit ? bare : `${chars.slice(0, limit - 1).join('')}…`;
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
