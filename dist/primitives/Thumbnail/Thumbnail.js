// src/primitives/Thumbnail/Thumbnail.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function Thumbnail({ src, alt, size = 'md' }) {
    return _jsx("img", { src: src, alt: alt, "data-size": size, loading: "lazy", className: "cieo cieo-p-thumbnail" });
}
