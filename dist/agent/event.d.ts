export type AgentStatus = 'starting' | 'running' | 'waiting' | 'completed' | 'stopped' | 'failed' | 'interrupted' | 'disconnected';
export declare const AGENT_STATUSES: readonly AgentStatus[];
/** Statuses after which an agent or run does no further work. */
export declare const SETTLED_STATUSES: readonly AgentStatus[];
export declare const CORE_EVENT_TYPES: readonly ["run.status", "agent.status", "message.delta", "message.complete", "tool.call", "approval.requested", "approval.resolved", "draft.begin", "draft.update", "draft.cancel", "draft.complete", "artifact.saved", "navigation"];
export type CoreEventType = (typeof CORE_EVENT_TYPES)[number];
export type ExtensionEventType = `x.${string}.${string}`;
export interface AgentEvent {
    v: 1;
    /** Position in the host's ordered log. The reducer applies each sequence once, in order. */
    seq: number;
    at: string;
    runId: string;
    agentId: string;
    parentAgentId: string | null;
    /** A core type, an extension (x.<ns>.<name>), or a type from a newer version, which is counted and skipped. */
    type: string;
    data: Record<string, unknown>;
}
export declare const isCoreType: (type: string) => type is CoreEventType;
export declare const isExtensionType: (type: string) => type is ExtensionEventType;
export declare const isAgentStatus: (value: unknown) => value is AgentStatus;
export declare const isSettled: (status: AgentStatus) => boolean;
export declare function isRecord(value: unknown): value is Record<string, unknown>;
/** Returns a well-formed envelope, or null. Payloads are checked per type by the reducer, not here. */
export declare function parseAgentEvent(value: unknown): AgentEvent | null;
