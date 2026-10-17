import { type AgentEvent, type AgentStatus } from './event.js';
export interface AgentLimits {
    maxActivity: number;
    maxTextChars: number;
    maxEntities: number;
    /** True when the host's log has no holes (a global ledger). False for a filtered stream. */
    contiguous: boolean;
}
export declare const DEFAULT_LIMITS: Readonly<AgentLimits>;
export interface RunView {
    id: string;
    status: AgentStatus;
    reason: string | null;
    startedAt: string;
    updatedAt: string;
}
export interface AgentView {
    id: string;
    runId: string;
    parentAgentId: string | null;
    name: string | null;
    status: AgentStatus;
    reason: string | null;
    location: string | null;
    /** The message a delta without a messageId continues. */
    openMessageId: string | null;
    updatedAt: string;
}
export interface MessageView {
    id: string;
    runId: string;
    agentId: string;
    text: string;
    complete: boolean;
    truncated: boolean;
    startedAt: string;
    updatedAt: string;
}
export type ToolPhase = 'started' | 'finished' | 'failed';
export interface ToolCallView {
    id: string;
    runId: string;
    agentId: string;
    name: string;
    phase: ToolPhase;
    summary: string | null;
    error: string | null;
    startedAt: string;
    updatedAt: string;
}
export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'expired';
export interface ApprovalView {
    id: string;
    runId: string;
    agentId: string;
    title: string | null;
    detail: string | null;
    status: ApprovalStatus;
    requestedAt: string;
    resolvedAt: string | null;
}
export type DraftStatus = 'open' | 'cancelled' | 'complete';
export interface DraftView {
    id: string;
    runId: string;
    agentId: string;
    text: string;
    anchor: unknown;
    status: DraftStatus;
    artifactId: string | null;
    updatedAt: string;
}
export interface ArtifactView {
    id: string;
    runId: string;
    agentId: string;
    kind: string;
    title: string | null;
    savedAt: string;
}
export interface ActivityEntry {
    seq: number;
    at: string;
    runId: string;
    agentId: string;
    type: string;
    /** The id of the view this entry changed, when it has one. */
    ref: string | null;
    /** Extension payloads are kept as-is; core payloads live in their views. */
    data?: Record<string, unknown>;
}
export interface AgentRunState {
    /** Highest sequence applied. A stream resumes after it. */
    cursor: number;
    /** Set when an event arrived past a hole in a contiguous log; the host refetches after `cursor`. */
    gap: {
        after: number;
        received: number;
    } | null;
    runs: ReadonlyMap<string, RunView>;
    agents: ReadonlyMap<string, AgentView>;
    messages: ReadonlyMap<string, MessageView>;
    tools: ReadonlyMap<string, ToolCallView>;
    approvals: ReadonlyMap<string, ApprovalView>;
    drafts: ReadonlyMap<string, DraftView>;
    artifacts: ReadonlyMap<string, ArtifactView>;
    activity: readonly ActivityEntry[];
    /** Events whose type is unknown or whose payload is malformed. They advance the cursor and change nothing else. */
    rejected: number;
}
export declare function createAgentState(cursor?: number): AgentRunState;
/** Applies one event. Returns the same state object when the event changes nothing. */
export declare function reduce(state: AgentRunState, event: AgentEvent, limits?: Readonly<AgentLimits>): AgentRunState;
