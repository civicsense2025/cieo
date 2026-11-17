// src/primitives/Portrait/Portrait.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
/** A quoted CSS url() value. Quotes, backslashes, parentheses and control characters are percent-encoded; JSON escaping is not CSS escaping. */
export function cssUrl(src) {
    return `url("${src.replace(/[\u0000-\u001f\u007f"'\\()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`)}")`;
}
export function Portrait({ className, slotProps, src, size = 'regular', ring, grayscale = false }) {
    return (_jsx("span", { ...customizePart(slotProps?.root, "cieo cieo-p-portrait", undefined, className), "aria-hidden": "true", "data-size": size, "data-grayscale": grayscale ? '' : undefined, style: { ...(ring ? { ['--cieo-portrait-ring']: ring } : {}), ...(src ? { backgroundImage: cssUrl(src) } : {}) } }));
}
