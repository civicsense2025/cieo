/* The wire shape an agent host speaks: one envelope, a small set of core types, and an x.<ns>.<name>
   escape hatch so a host can carry its own facts without forking the reducer. No DOM, no framework. */
export type AgentStatus = 'starting' | 'running' | 'waiting' | 'completed' | 'stopped' | 'failed' | 'interrupted' | 'disconnected';
export const AGENT_STATUSES: readonly AgentStatus[] = ['starting', 'running', 'waiting', 'completed', 'stopped', 'failed', 'interrupted', 'disconnected'];
/** Statuses after which an agent or run does no further work. */
export const SETTLED_STATUSES: readonly AgentStatus[] = ['completed', 'stopped', 'failed', 'interrupted', 'disconnected'];

export const CORE_EVENT_TYPES = [
  'run.status',
  'agent.status',
  'message.delta',
  'message.complete',
  'tool.call',
  'approval.requested',
  'approval.resolved',
  'draft.begin',
  'draft.update',
  'draft.cancel',
  'draft.complete',
  'artifact.saved',
  'navigation',
] as const;
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

const MAX_ID = 256;
const MAX_AT = 64;
// Single-word core types (navigation) are valid; dotted segments are optional.
const TYPE = /^[a-z][a-z0-9-]*(?:\.[a-z0-9_-]+)*$/;
// Ids are opaque, but whitespace and control characters in one usually mean a host bug or an injected value.
const ID = /^[^\s\u0000-\u001f\u007f]+$/;

export const isCoreType = (type: string): type is CoreEventType => (CORE_EVENT_TYPES as readonly string[]).includes(type);
export const isExtensionType = (type: string): type is ExtensionEventType => type.startsWith('x.') && type.split('.').length >= 3;
export const isAgentStatus = (value: unknown): value is AgentStatus => (AGENT_STATUSES as readonly unknown[]).includes(value);
export const isSettled = (status: AgentStatus): boolean => SETTLED_STATUSES.includes(status);

export function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

const isId = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= MAX_ID && ID.test(value);

/** Returns a well-formed envelope, or null. Payloads are checked per type by the reducer, not here. */
export function parseAgentEvent(value: unknown): AgentEvent | null {
  if (!isRecord(value) || value.v !== 1) return null;
  const { seq, at, runId, agentId, parentAgentId, type, data } = value;
  if (typeof seq !== 'number' || !Number.isSafeInteger(seq) || seq < 1) return null;
  if (typeof at !== 'string' || at.length === 0 || at.length > MAX_AT) return null;
  if (!isId(runId) || !isId(agentId)) return null;
  if (parentAgentId !== null && parentAgentId !== undefined && !isId(parentAgentId)) return null;
  if (typeof type !== 'string' || type.length > 96 || !TYPE.test(type)) return null;
  if (!isRecord(data)) return null;
  return { v: 1, seq, at, runId, agentId, parentAgentId: parentAgentId ?? null, type, data };
}
