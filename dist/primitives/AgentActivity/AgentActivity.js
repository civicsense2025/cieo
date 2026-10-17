// src/primitives/AgentActivity/AgentActivity.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function AgentActivity({ entries, describe, label = 'Agent activity', emptyText }) {
    return (_jsxs("ol", { className: "cieo cieo-p-agent-activity", role: "log", "aria-label": label, children: [entries.length === 0 && emptyText ? _jsx("li", { "data-empty": true, children: emptyText }) : null, entries.map((entry) => (_jsx("li", { "data-type": entry.type, "data-seq": entry.seq, children: describe(entry) }, entry.seq)))] }));
}
