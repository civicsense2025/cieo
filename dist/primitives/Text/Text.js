'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function Text({ as: Tag = 'p', size = 'default', children }) {
    return (_jsx(Tag, { "data-size": size, className: "cieo cieo-p-text", children: children }));
}
