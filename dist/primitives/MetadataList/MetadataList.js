'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function MetadataList({ className, slotProps, children }) {
    return (_jsx("dl", { className: "cieo cieo-metadata-list", ...customizePart(slotProps?.root, "cieo cieo-metadata-list", undefined, className), children: children }));
}
