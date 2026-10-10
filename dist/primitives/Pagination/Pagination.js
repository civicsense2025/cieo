// src/primitives/Pagination/Pagination.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Pagination({ page, pageCount, onPageChange, label = 'Pagination' }) {
    const start = Math.max(1, page - 2);
    const end = Math.min(pageCount, page + 2);
    const pages = [];
    for (let p = start; p <= end; p++)
        pages.push(p);
    return (_jsxs("nav", { "aria-label": label, className: "cieo cieo-pagination", children: [_jsx("button", { type: "button", disabled: page <= 1, "aria-label": "Previous page", onClick: () => onPageChange?.(page - 1), children: "Previous" }), pages.map((p) => (_jsx("button", { type: "button", "aria-current": p === page ? 'page' : undefined, onClick: () => onPageChange?.(p), children: p }, p))), _jsx("button", { type: "button", disabled: page >= pageCount, "aria-label": "Next page", onClick: () => onPageChange?.(page + 1), children: "Next" })] }));
}
