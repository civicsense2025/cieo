import type { AgentStore } from './store.js';
export type StreamStatus = 'connecting' | 'open' | 'retrying' | 'closed';
export interface EventSourceLike {
    onopen: ((event: unknown) => void) | null;
    onmessage: ((event: {
        data: string;
    }) => void) | null;
    onerror: ((event: unknown) => void) | null;
    close(): void;
}
export type EventSourceFactory = new (url: string, init?: {
    withCredentials?: boolean;
}) => EventSourceLike;
export interface Timers {
    set(callback: () => void, ms: number): unknown;
    clear(handle: unknown): void;
}
export interface EventStreamOptions {
    url: string | URL;
    store: AgentStore;
    signal?: AbortSignal;
    /** Query parameter that carries the cursor. */
    cursorParam?: string;
    /** Turns one parsed frame into zero or more AgentEvents, for a host whose log has its own shape. */
    map?: (frame: unknown) => unknown;
    retry?: {
        initialMs?: number;
        maxMs?: number;
    };
    withCredentials?: boolean;
    EventSource?: EventSourceFactory;
    timers?: Timers;
    random?: () => number;
    onStatus?: (status: StreamStatus, detail: {
        attempt: number;
        delayMs?: number;
    }) => void;
}
/** Opens the stream and returns a function that closes it. */
export declare function connectEventStream(options: EventStreamOptions): () => void;
