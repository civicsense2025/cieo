// src/primitives/AgentLanes/AgentLanes.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { customizePart } from '../customization.js';
import { useId } from 'react';
import { AgentStatus } from '../AgentStatus/AgentStatus.js';
function Lane({ agent, depth, tree, seen, renderLane, statusLabel, slotProps }) {
    const nameId = useId();
    const path = new Set(seen).add(agent.id);
    // A malformed host log could make an agent its own ancestor; the path guard stops that from recursing forever.
    const kids = (tree.get(agent.id) ?? []).filter((k) => !path.has(k.id));
    return (_jsx("li", { "data-agent-id": agent.id, "data-depth": depth, "data-status": agent.status, ...customizePart(slotProps?.lane), children: _jsxs("section", { "aria-labelledby": nameId, children: [_jsxs("header", { ...customizePart(slotProps?.header), children: [_jsx("span", { id: nameId, ...customizePart(slotProps?.name), "data-agent-name": true, children: agent.name ?? agent.id }), _jsx(AgentStatus, { status: agent.status, label: statusLabel?.(agent.status) })] }), _jsx("div", { ...customizePart(slotProps?.body), "data-lane-body": true, children: renderLane(agent) }), kids.length ? (_jsx("ul", { ...customizePart(slotProps?.children), children: kids.map((k) => _jsx(Lane, { agent: k, depth: depth + 1, tree: tree, seen: path, renderLane: renderLane, statusLabel: statusLabel, slotProps: slotProps }, k.id)) })) : null] }) }));
}
export function AgentLanes({ agents, renderLane, label = 'Agents', statusLabel, className, slotProps }) {
    const ids = new Set(agents.map((a) => a.id));
    const tree = new Map();
    for (const agent of agents) {
        const parent = agent.parentAgentId && ids.has(agent.parentAgentId) && agent.parentAgentId !== agent.id ? agent.parentAgentId : null;
        const list = tree.get(parent);
        if (list)
            list.push(agent);
        else
            tree.set(parent, [agent]);
    }
    return (_jsx("ul", { className: "cieo cieo-p-agent-lanes", "aria-label": label, ...customizePart(slotProps?.root, "cieo cieo-p-agent-lanes", undefined, className), children: (tree.get(null) ?? []).map((a) => _jsx(Lane, { agent: a, depth: 0, tree: tree, seen: new Set(), renderLane: renderLane, statusLabel: statusLabel, slotProps: slotProps }, a.id)) }));
}
