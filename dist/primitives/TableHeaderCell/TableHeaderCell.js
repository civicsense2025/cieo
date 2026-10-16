'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function TableHeaderCell({ scope = 'col', sort = 'none', onSort, children }) {
    if (sort === 'none' && !onSort) {
        return (_jsx("th", { scope: scope, className: "cieo cieo-table-header-cell", children: children }));
    }
    return (_jsx("th", { scope: scope, "aria-sort": sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : 'none', "data-sort": sort, className: "cieo cieo-table-header-cell", children: _jsx("button", { type: "button", onClick: onSort, "aria-label": typeof children === 'string' ? `Sort by ${children}` : undefined, children: children }) }));
}
