// src/primitives/AgentStatus/AgentStatus.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StatusDot } from '../StatusDot/StatusDot.js';
/** Dot tone for each reported status. Settled failures read as danger; a plain stop is neutral. */
export const AGENT_STATUS_TONES = {
    starting: 'info',
    running: 'info',
    waiting: 'warning',
    completed: 'success',
    stopped: 'default',
    failed: 'danger',
    interrupted: 'danger',
    disconnected: 'danger',
};
/** Default words for each status. Pass `label` to localize or rephrase. */
export const AGENT_STATUS_WORDS = {
    starting: 'Starting',
    running: 'Working',
    waiting: 'Needs you',
    completed: 'Done',
    stopped: 'Stopped',
    failed: 'Failed',
    interrupted: 'Interrupted',
    disconnected: 'Disconnected',
};
export function AgentStatus({ status, label, name }) {
    const tone = AGENT_STATUS_TONES[status] ?? 'default';
    return (_jsxs("span", { className: "cieo cieo-p-agent-status", "data-status": status, "data-tone": tone, children: [_jsx(StatusDot, { status: tone }), name ? _jsx("span", { "data-name": true, children: name }) : null, _jsx("span", { "data-label": true, children: label || AGENT_STATUS_WORDS[status] || status })] }));
}
