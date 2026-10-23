// src/primitives/LinkPreview/LinkPreview.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* LinkPreview. A link card (image, site, title) that is one tab stop. The host fetches the metadata; this draws it, safely, and fades content in over its own skeleton. */
import { useEffect, useRef, useState } from 'react';
import { usePresence } from '../../react/index.js';
import { safeHref } from '../Mention/Mention.js';
/** Hostname without a leading www., or an empty string when the address does not parse as http(s). */
export function displayDomain(url) {
    const safe = safeHref(url, { relative: false });
    if (!safe)
        return '';
    try {
        const parsed = new URL(safe);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
            return '';
        return parsed.hostname.replace(/^www\./i, '');
    }
    catch {
        return '';
    }
}
function PreviewImage({ image, className }) {
    const ref = useRef(null);
    const [state, setState] = useState('pending');
    const src = safeHref(image.src);
    useEffect(() => {
        setState('pending');
        const el = ref.current;
        if (el?.complete && el.naturalWidth > 0)
            setState('loaded');
    }, [src]);
    if (!src || state === 'failed')
        return null;
    return (_jsx("img", { ref: ref, className: className, "data-state": state, src: src, alt: image.alt, width: image.width, height: image.height, referrerPolicy: "no-referrer", loading: "lazy", decoding: "async", onLoad: () => setState('loaded'), onError: () => setState('failed') }, src));
}
export function LinkPreview({ url, title, siteName, description, image, favicon, variant = 'large', loading = false }) {
    const href = safeHref(url, { relative: false });
    const domain = displayDomain(url);
    const kind = variant === 'compact' ? 'compact' : 'large';
    const skeleton = usePresence(loading, { from: { y: 0, scale: 1 } });
    const iconSrc = favicon === undefined ? null : safeHref(favicon);
    const brand = typeof siteName === 'string' ? siteName.trim() : '';
    const separateBrand = brand !== '' && brand !== domain;
    const site = brand || domain;
    const label = _jsx("span", { className: "cieo-link-preview-title-text", children: title });
    return (_jsxs("div", { className: "cieo cieo-link-preview", "data-variant": kind, "data-loading": loading ? '' : undefined, "data-linked": href ? '' : undefined, "aria-busy": loading || undefined, children: [skeleton.mounted ? (_jsxs("span", { ref: skeleton.ref, className: "cieo-link-preview-skeleton", "aria-hidden": "true", children: [_jsx("span", { className: "cieo-link-preview-media cieo-link-preview-bone" }), _jsxs("span", { className: "cieo-link-preview-body", children: [_jsx("span", { className: "cieo-link-preview-bone cieo-link-preview-bone-site" }), _jsx("span", { className: "cieo-link-preview-bone cieo-link-preview-bone-title" }), _jsx("span", { className: "cieo-link-preview-bone cieo-link-preview-bone-title cieo-link-preview-bone-short" })] })] })) : null, loading ? (_jsx("span", { className: "cieo-sr-only", role: "status", children: "Loading link preview" })) : (_jsxs("div", { className: "cieo-link-preview-content", children: [image && safeHref(image.src) ? (_jsx("span", { className: "cieo-link-preview-media", children: _jsx(PreviewImage, { image: image, className: "cieo-link-preview-image" }, safeHref(image.src) ?? image.src) })) : null, _jsxs("span", { className: "cieo-link-preview-body", children: [site || domain || iconSrc ? (_jsxs("span", { className: "cieo-link-preview-site", children: [iconSrc ? _jsx("img", { className: "cieo-link-preview-favicon", src: iconSrc, alt: "", width: 16, height: 16, referrerPolicy: "no-referrer", loading: "lazy", decoding: "async" }) : null, separateBrand ? _jsx("span", { className: "cieo-link-preview-site-name", children: brand }) : null, domain ? _jsx("span", { className: "cieo-link-preview-domain", children: domain }) : site ? _jsx("span", { className: "cieo-link-preview-site-name", children: site }) : null] })) : null, href ? (_jsx("a", { className: "cieo-link-preview-title", href: href, target: "_blank", rel: "noopener noreferrer ugc nofollow", children: label })) : (_jsx("span", { className: "cieo-link-preview-title", children: label })), description && kind === 'large' ? _jsx("span", { className: "cieo-link-preview-description", children: description }) : null] })] }))] }));
}
