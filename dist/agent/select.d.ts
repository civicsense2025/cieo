import type { AgentRunState, AgentView, ApprovalView, ArtifactView, DraftView, MessageView, RunView, ToolCallView } from './reduce.js';
export declare const selectRuns: (s: AgentRunState) => readonly RunView[];
export declare const selectAgents: (s: AgentRunState) => readonly AgentView[];
export declare const selectActiveAgents: (s: AgentRunState) => readonly AgentView[];
export declare const selectRunAgents: (s: AgentRunState, id: string) => readonly AgentView[];
export declare const selectActivity: (s: AgentRunState) => readonly import("./reduce.js").ActivityEntry[];
export declare const selectPendingApprovals: (s: AgentRunState) => readonly ApprovalView[];
export declare const selectOpenDrafts: (s: AgentRunState) => readonly DraftView[];
export declare const selectToolCalls: (s: AgentRunState) => readonly ToolCallView[];
export declare const selectArtifacts: (s: AgentRunState) => readonly ArtifactView[];
export declare const selectAgentMessages: (s: AgentRunState, id: string) => readonly MessageView[];
/** The message an agent is writing right now, or null. */
export declare const selectStreamingMessage: (s: AgentRunState, agentId: string) => MessageView | null;
/** Work that needs a person: pending approvals and agents waiting on input. */
export declare const selectAttention: (s: AgentRunState) => number;
