// src/primitives/Thumbnail/Thumbnail.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function Thumbnail({ className, slotProps, src, alt, size = 'md' }) {
    return _jsx("img", { src: src, alt: alt, "data-size": size, loading: "lazy", className: "cieo cieo-p-thumbnail", ...customizePart(slotProps?.root, "cieo cieo-p-thumbnail", undefined, className) });
}
