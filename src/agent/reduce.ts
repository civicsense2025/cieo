import { isAgentStatus, isCoreType, isExtensionType, isSettled, type AgentEvent, type AgentStatus } from './event.js';

/* One pure reducer folds an ordered event log into views a UI can render. Every map is replaced only when it
   changes, so a selector keyed on a map's identity recomputes only for the facts it reads. Memory is bounded:
   activity is a ring, text is capped, and each map evicts its oldest settled entry first. */
export interface AgentLimits {
  maxActivity: number;
  maxTextChars: number;
  maxEntities: number;
  /** True when the host's log has no holes (a global ledger). False for a filtered stream. */
  contiguous: boolean;
}
export const DEFAULT_LIMITS: Readonly<AgentLimits> = { maxActivity: 500, maxTextChars: 20_000, maxEntities: 500, contiguous: true };

export interface RunView { id: string; status: AgentStatus; reason: string | null; startedAt: string; updatedAt: string; }
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
export interface MessageView { id: string; runId: string; agentId: string; text: string; complete: boolean; truncated: boolean; startedAt: string; updatedAt: string; }
export type ToolPhase = 'started' | 'finished' | 'failed';
export interface ToolCallView { id: string; runId: string; agentId: string; name: string; phase: ToolPhase; summary: string | null; error: string | null; startedAt: string; updatedAt: string; }
export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'expired';
export interface ApprovalView { id: string; runId: string; agentId: string; title: string | null; detail: string | null; status: ApprovalStatus; requestedAt: string; resolvedAt: string | null; }
export type DraftStatus = 'open' | 'cancelled' | 'complete';
export interface DraftView { id: string; runId: string; agentId: string; text: string; anchor: unknown; status: DraftStatus; artifactId: string | null; updatedAt: string; }
export interface ArtifactView { id: string; runId: string; agentId: string; kind: string; title: string | null; savedAt: string; }
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
  gap: { after: number; received: number } | null;
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

export function createAgentState(cursor = 0): AgentRunState {
  if (!Number.isSafeInteger(cursor) || cursor < 0) throw new RangeError('cursor');
  const empty = new Map();
  return { cursor, gap: null, runs: empty, agents: empty, messages: empty, tools: empty, approvals: empty, drafts: empty, artifacts: empty, activity: [], rejected: 0 };
}

const QUIET = new Set(['message.delta', 'draft.update']);
const MAX_LABEL = 512;
const MAX_DETAIL = 4000;

function text(data: Record<string, unknown>, key: string, max = MAX_LABEL): string | null {
  const value = data[key];
  return typeof value === 'string' && value.length > 0 ? value.slice(0, max) : null;
}

function put<V>(map: ReadonlyMap<string, V>, key: string, value: V, max: number, settled: (value: V) => boolean): ReadonlyMap<string, V> {
  const next = new Map(map);
  next.set(key, value);
  if (next.size > max) {
    let victim: string | undefined;
    for (const [k, v] of next) if (k !== key && settled(v)) { victim = k; break; }
    // Everything still live: drop the oldest anyway, so a runaway host cannot grow memory without bound.
    next.delete(victim ?? next.keys().next().value!);
  }
  return next;
}

/** Applies one event. Returns the same state object when the event changes nothing. */
export function reduce(state: AgentRunState, event: AgentEvent, limits: Readonly<AgentLimits> = DEFAULT_LIMITS): AgentRunState {
  if (event.seq <= state.cursor) return state;
  if (limits.contiguous && event.seq !== state.cursor + 1) {
    const received = Math.max(event.seq, state.gap?.received ?? 0);
    return state.gap?.received === received ? state : { ...state, gap: { after: state.cursor, received } };
  }
  const advanced: AgentRunState = { ...state, cursor: event.seq, gap: null };
  const applied = apply(advanced, event, limits);
  if (!applied) return { ...advanced, rejected: state.rejected + 1 };
  if (QUIET.has(event.type)) return applied.next;
  const entry: ActivityEntry = { seq: event.seq, at: event.at, runId: event.runId, agentId: event.agentId, type: event.type, ref: applied.ref };
  if (isExtensionType(event.type)) entry.data = event.data;
  const activity = [...state.activity, entry];
  return { ...applied.next, activity: activity.length > limits.maxActivity ? activity.slice(-limits.maxActivity) : activity };
}

interface Applied { next: AgentRunState; ref: string | null; }

function apply(s: AgentRunState, e: AgentEvent, limits: Readonly<AgentLimits>): Applied | null {
  const { data, at } = e;
  const max = limits.maxEntities;
  const withRun = ensureRun(s, e, max);

  switch (e.type) {
    case 'run.status': {
      if (!isAgentStatus(data.status)) return null;
      const prior = withRun.runs.get(e.runId)!;
      return { next: { ...withRun, runs: put(withRun.runs, e.runId, { ...prior, status: data.status, reason: text(data, 'reason'), updatedAt: at }, max, runSettled) }, ref: e.runId };
    }
    case 'agent.status': {
      if (!isAgentStatus(data.status)) return null;
      const prior = agentOf(withRun, e);
      const agent: AgentView = { ...prior, status: data.status, reason: text(data, 'reason'), name: text(data, 'name') ?? prior.name, updatedAt: at };
      let next: AgentRunState = { ...withRun, agents: put(withRun.agents, e.agentId, agent, max, agentSettled) };
      // An agent update may carry its run's status, so one host event never has to become two.
      if (isAgentStatus(data.runStatus)) {
        const run = next.runs.get(e.runId)!;
        next = { ...next, runs: put(next.runs, e.runId, { ...run, status: data.runStatus, updatedAt: at }, max, runSettled) };
      }
      return { next, ref: e.agentId };
    }
    case 'message.delta':
    case 'message.complete': {
      const chunk = typeof data.text === 'string' ? data.text : null;
      if (chunk === null) return null;
      const agent = agentOf(withRun, e);
      const id = text(data, 'messageId', 256) ?? agent.openMessageId ?? `${e.agentId}#${e.seq}`;
      const prior = withRun.messages.get(id);
      if (prior?.complete) return null;
      const replace = e.type === 'message.complete' || data.mode === 'replace';
      const whole = replace ? chunk : (prior?.text ?? '') + chunk;
      const message: MessageView = {
        id, runId: e.runId, agentId: e.agentId,
        text: whole.slice(0, limits.maxTextChars),
        complete: e.type === 'message.complete',
        truncated: whole.length > limits.maxTextChars,
        startedAt: prior?.startedAt ?? at,
        updatedAt: at,
      };
      const open = message.complete ? (agent.openMessageId === id ? null : agent.openMessageId) : id;
      return {
        next: {
          ...withRun,
          messages: put(withRun.messages, id, message, max, (m) => m.complete),
          agents: open === agent.openMessageId && withRun.agents.has(e.agentId) ? withRun.agents : put(withRun.agents, e.agentId, { ...agent, openMessageId: open, updatedAt: at }, max, agentSettled),
        },
        ref: id,
      };
    }
    case 'tool.call': {
      const id = text(data, 'callId', 256);
      const phase = data.phase;
      if (!id || (phase !== 'started' && phase !== 'finished' && phase !== 'failed')) return null;
      const prior = withRun.tools.get(id);
      const name = text(data, 'name') ?? prior?.name;
      if (!name) return null;
      const call: ToolCallView = {
        id, runId: e.runId, agentId: e.agentId, name, phase,
        summary: text(data, 'summary', MAX_DETAIL) ?? prior?.summary ?? null,
        error: phase === 'failed' ? text(data, 'error', MAX_DETAIL) ?? 'The tool call failed.' : null,
        startedAt: prior?.startedAt ?? at,
        updatedAt: at,
      };
      return { next: { ...withRun, agents: touchAgent(withRun, e, max), tools: put(withRun.tools, id, call, max, (c) => c.phase !== 'started') }, ref: id };
    }
    case 'approval.requested': {
      const id = text(data, 'approvalId', 256);
      if (!id) return null;
      const prior = withRun.approvals.get(id);
      // A repeated request never reopens a decision the host already reported.
      if (prior && prior.status !== 'pending') return { next: withRun, ref: id };
      const approval: ApprovalView = { id, runId: e.runId, agentId: e.agentId, title: text(data, 'title'), detail: text(data, 'detail', MAX_DETAIL), status: 'pending', requestedAt: prior?.requestedAt ?? at, resolvedAt: null };
      return { next: { ...withRun, agents: touchAgent(withRun, e, max), approvals: put(withRun.approvals, id, approval, max, approvalSettled) }, ref: id };
    }
    case 'approval.resolved': {
      const id = text(data, 'approvalId', 256);
      const decision = data.decision;
      if (!id || (decision !== 'approved' && decision !== 'denied' && decision !== 'expired')) return null;
      const prior = withRun.approvals.get(id);
      const approval: ApprovalView = { id, runId: e.runId, agentId: e.agentId, title: prior?.title ?? null, detail: prior?.detail ?? null, status: decision, requestedAt: prior?.requestedAt ?? at, resolvedAt: at };
      return { next: { ...withRun, approvals: put(withRun.approvals, id, approval, max, approvalSettled) }, ref: id };
    }
    case 'draft.begin':
    case 'draft.update':
    case 'draft.cancel':
    case 'draft.complete': {
      const id = text(data, 'draftId', 256);
      if (!id) return null;
      const prior = withRun.drafts.get(id);
      if (e.type !== 'draft.begin' && !prior) return null;
      if (prior && prior.status !== 'open') return null;
      const status: DraftStatus = e.type === 'draft.cancel' ? 'cancelled' : e.type === 'draft.complete' ? 'complete' : 'open';
      const draft: DraftView = {
        id, runId: e.runId, agentId: e.agentId,
        text: typeof data.text === 'string' ? data.text.slice(0, limits.maxTextChars) : prior?.text ?? '',
        anchor: 'anchor' in data ? data.anchor : prior?.anchor ?? null,
        status,
        artifactId: text(data, 'artifactId', 256) ?? prior?.artifactId ?? null,
        updatedAt: at,
      };
      return { next: { ...withRun, agents: touchAgent(withRun, e, max), drafts: put(withRun.drafts, id, draft, max, (d) => d.status !== 'open') }, ref: id };
    }
    case 'artifact.saved': {
      const id = text(data, 'artifactId', 256);
      const kind = text(data, 'kind', 64);
      if (!id || !kind) return null;
      const artifact: ArtifactView = { id, runId: e.runId, agentId: e.agentId, kind, title: text(data, 'title'), savedAt: at };
      return { next: { ...withRun, agents: touchAgent(withRun, e, max), artifacts: put(withRun.artifacts, id, artifact, max, () => true) }, ref: id };
    }
    case 'navigation': {
      const location = text(data, 'location', 2048);
      if (!location) return null;
      const agent = agentOf(withRun, e);
      return { next: { ...withRun, agents: put(withRun.agents, e.agentId, { ...agent, location, updatedAt: at }, max, agentSettled) }, ref: e.agentId };
    }
    default:
      if (isExtensionType(e.type) && !isCoreType(e.type)) return { next: { ...withRun, agents: touchAgent(withRun, e, max) }, ref: null };
      return null;
  }
}

const runSettled = (r: RunView) => isSettled(r.status);
const agentSettled = (a: AgentView) => isSettled(a.status);
const approvalSettled = (a: ApprovalView) => a.status !== 'pending';

function ensureRun(s: AgentRunState, e: AgentEvent, max: number): AgentRunState {
  if (s.runs.has(e.runId)) return s;
  const run: RunView = { id: e.runId, status: 'starting', reason: null, startedAt: e.at, updatedAt: e.at };
  return { ...s, runs: put(s.runs, e.runId, run, max, runSettled) };
}

function agentOf(s: AgentRunState, e: AgentEvent): AgentView {
  return s.agents.get(e.agentId) ?? { id: e.agentId, runId: e.runId, parentAgentId: e.parentAgentId, name: null, status: 'starting', reason: null, location: null, openMessageId: null, updatedAt: e.at };
}

/** Registers an agent first seen through another event, without inventing a status change. */
function touchAgent(s: AgentRunState, e: AgentEvent, max: number): ReadonlyMap<string, AgentView> {
  return s.agents.has(e.agentId) ? s.agents : put(s.agents, e.agentId, agentOf(s, e), max, agentSettled);
}

