import { isSettled } from './event.js';
/* Selectors cache on the identity of the map they read, so useSyncExternalStore sees a stable value until that
   map changes. A streaming message does not rebuild the approval list, and vice versa. */
function keyed(pick, derive) {
    const cache = new WeakMap();
    return (s) => {
        const source = pick(s);
        let value = cache.get(source);
        if (value === undefined)
            cache.set(source, (value = derive(source)));
        return value;
    };
}
function keyedBy(pick, derive) {
    const cache = new WeakMap();
    return (s, id) => {
        const source = pick(s);
        let byId = cache.get(source);
        if (!byId)
            cache.set(source, (byId = new Map()));
        let value = byId.get(id);
        if (value === undefined)
            byId.set(id, (value = derive(source, id)));
        return value;
    };
}
export const selectRuns = keyed((s) => s.runs, (m) => [...m.values()]);
export const selectAgents = keyed((s) => s.agents, (m) => [...m.values()]);
export const selectActiveAgents = keyed((s) => s.agents, (m) => [...m.values()].filter((a) => !isSettled(a.status)));
export const selectRunAgents = keyedBy((s) => s.agents, (m, runId) => [...m.values()].filter((a) => a.runId === runId));
export const selectActivity = (s) => s.activity;
export const selectPendingApprovals = keyed((s) => s.approvals, (m) => [...m.values()].filter((a) => a.status === 'pending'));
export const selectOpenDrafts = keyed((s) => s.drafts, (m) => [...m.values()].filter((d) => d.status === 'open'));
export const selectToolCalls = keyed((s) => s.tools, (m) => [...m.values()]);
export const selectArtifacts = keyed((s) => s.artifacts, (m) => [...m.values()]);
export const selectAgentMessages = keyedBy((s) => s.messages, (m, agentId) => [...m.values()].filter((x) => x.agentId === agentId));
/** The message an agent is writing right now, or null. */
export const selectStreamingMessage = (s, agentId) => {
    const id = s.agents.get(agentId)?.openMessageId;
    return (id && s.messages.get(id)) || null;
};
/** Work that needs a person: pending approvals and agents waiting on input. */
export const selectAttention = (s) => selectPendingApprovals(s).length + selectAgents(s).filter((a) => a.status === 'waiting').length;
