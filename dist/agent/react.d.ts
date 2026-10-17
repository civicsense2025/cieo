import type { AgentRunState } from './reduce.js';
import type { AgentStore } from './store.js';
import { type EventStreamOptions, type StreamStatus } from './stream.js';
/** Reads a slice of the store. Pass a selector from cieo/agent (or one as stable) so renders stay bounded. */
export declare function useAgentStore<T>(store: AgentStore, selector: (state: AgentRunState) => T): T;
export type AgentStreamOptions = Omit<EventStreamOptions, 'store' | 'signal' | 'onStatus'>;
/** Follows a stream into the store while mounted. Pass null to stay disconnected. Reconnects when the url changes. */
export declare function useAgentStream(store: AgentStore, options: AgentStreamOptions | null): StreamStatus;
