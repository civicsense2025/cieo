'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function MetadataListItem({ className, slotProps, term, children }) {
    return (_jsxs("div", { className: "cieo cieo-metadata-list-item", ...customizePart(slotProps?.root, "cieo cieo-metadata-list-item", undefined, className), children: [_jsx("dt", { ...customizePart(slotProps?.term), children: term }), _jsx("dd", { ...customizePart(slotProps?.description), children: children })] }));
}
