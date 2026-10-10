'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/* Overlay. Full-viewport scrim behind dialogs and sheets. Presentational only; the host owns open state and dismissal. */
export function Overlay() {
    return (_jsx("div", { "aria-hidden": "true", className: "cieo cieo-p-overlay" }));
}
