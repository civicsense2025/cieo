// src/primitives/AgentIcon/AgentIcon.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AGENT_ICON_VIEWBOX, agentIconGlyph, agentIconOutline, agentIconStrokeWidth, getAgentIcon, roundIconUnit, } from '../../agent/icons.js';
import { customizePart } from '../customization.js';
const camel = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
function draw(nodes, prefix) {
    return nodes.map(([tag, attrs, kids], i) => {
        const props = {};
        for (const key in attrs)
            props[camel(key)] = attrs[key];
        const Tag = tag;
        return _jsx(Tag, { ...props, children: kids ? draw(kids, `${prefix}${i}.`) : null }, `${prefix}${i}`);
    });
}
export function AgentIcon({ className, slotProps, icon, size = 24, label, outline = true }) {
    const def = typeof icon === 'string' ? getAgentIcon(icon) : icon;
    if (!def)
        return null;
    const stroke = agentIconStrokeWidth(size);
    const sw = roundIconUnit(stroke);
    const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: 'false' };
    return (_jsxs("svg", { className: "cieo cieo-p-agent-icon", viewBox: AGENT_ICON_VIEWBOX, width: size, height: size, "data-icon": def.id, "data-tone": def.tone ?? undefined, ...a11y, ...customizePart(slotProps?.root, "cieo cieo-p-agent-icon", undefined, className), children: [outline ? _jsx("rect", { ...agentIconOutline(stroke), fill: "none", stroke: "currentColor", strokeWidth: sw }) : null, _jsx("g", { fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", children: draw(agentIconGlyph(def, size), '') })] }));
}
