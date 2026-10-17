import { type AgentLimits, type AgentRunState } from './reduce.js';
export interface AgentStore {
    getSnapshot(): AgentRunState;
    /** Matches useSyncExternalStore: the listener runs once per apply() that changed the state. */
    subscribe(listener: () => void): () => void;
    /** Validates, orders and applies a batch. Returns how many events changed the state. */
    apply(events: Iterable<unknown>): number;
    /** Replaces the state, for a host that loaded a snapshot or wants to start over. */
    reset(state?: AgentRunState): void;
    /** Frames that failed envelope validation. They cannot advance the cursor because they carry no trusted sequence. */
    readonly dropped: number;
}
export interface AgentStoreOptions {
    initial?: AgentRunState;
    limits?: Partial<AgentLimits>;
}
export declare function createAgentStore(options?: AgentStoreOptions): AgentStore;
