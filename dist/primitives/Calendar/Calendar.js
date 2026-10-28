'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
// src/primitives/Calendar/Calendar.tsx
/* Calendar. Month grid for picking one ISO date. Flat group semantics (role=group, no grid roles); day buttons report selection via aria-pressed. */
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
function pad(n) {
    return String(n).padStart(2, '0');
}
export function Calendar({ className, slotProps, year, month, selected, onSelect }) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const leadBlanks = new Date(year, month - 1, 1).getDay();
    const days = [
        ...Array(leadBlanks).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => `${year}-${pad(month)}-${pad(i + 1)}`),
    ];
    return (_jsxs("div", { role: "group", "aria-label": `${year}-${month}`, className: "cieo cieo-p-calendar", ...customizePart(slotProps?.root, "cieo cieo-p-calendar", undefined, className), children: [WEEKDAYS.map((d) => (_jsx("span", { className: "cieo-p-calendar-weekday", "aria-hidden": "true", ...customizePart(slotProps?.weekday, "cieo-p-calendar-weekday"), children: d }, d))), days.map((iso, i) => iso === null ? (_jsx("span", { className: "cieo-p-calendar-blank", "aria-hidden": "true", ...customizePart(slotProps?.blank, "cieo-p-calendar-blank") }, `blank-${i}`)) : (_jsx("button", { type: "button", className: "cieo-p-calendar-day", "aria-pressed": selected === iso, "aria-label": iso, onClick: () => onSelect?.(iso), ...customizePart(slotProps?.day, "cieo-p-calendar-day"), children: Number(iso.slice(8)) }, iso)))] }));
}
