// src/primitives/Timestamp/Timestamp.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function Timestamp({ dateTime, children }) {
    return (_jsx("time", { dateTime: dateTime, className: "cieo cieo-p-timestamp", children: children }));
}
