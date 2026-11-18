import { jsx as _jsx } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
export function BlockPanel({ className, slotProps, tone = 'block', children }) {
    return (_jsx("section", { className: "cieo cieo-p-block-panel", ...customizePart(slotProps?.root, "cieo cieo-p-block-panel", undefined, className), "data-tone": tone, children: children }));
}
