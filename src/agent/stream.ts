import type { AgentStore } from './store.js';

/* Follows a server-sent event stream into a store. The stream always resumes from the store's cursor, so a
   reconnect never replays or skips work; a hole in a contiguous log reconnects from the last applied event.
   Reconnects back off up to a cap and stop for good when the signal aborts. */
export type StreamStatus = 'connecting' | 'open' | 'retrying' | 'closed';

export interface EventSourceLike {
  onopen: ((event: unknown) => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  close(): void;
}
export type EventSourceFactory = new (url: string, init?: { withCredentials?: boolean }) => EventSourceLike;

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
  retry?: { initialMs?: number; maxMs?: number };
  withCredentials?: boolean;
  EventSource?: EventSourceFactory;
  timers?: Timers;
  random?: () => number;
  onStatus?: (status: StreamStatus, detail: { attempt: number; delayMs?: number }) => void;
}

const defaultTimers: Timers = { set: (callback, ms) => setTimeout(callback, ms), clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>) };

/** Opens the stream and returns a function that closes it. */
export function connectEventStream(options: EventStreamOptions): () => void {
  const found = options.EventSource ?? (globalThis as { EventSource?: EventSourceFactory }).EventSource;
  if (!found) throw new TypeError('EventSource is not available; pass one in options.');
  const Source: EventSourceFactory = found;
  const timers = options.timers ?? defaultTimers;
  const random = options.random ?? Math.random;
  const initialMs = options.retry?.initialMs ?? 500;
  const maxMs = options.retry?.maxMs ?? 15_000;
  if (!(initialMs > 0) || !(maxMs >= initialMs)) throw new RangeError('retry');
  const param = options.cursorParam ?? 'after';
  const base = typeof location === 'undefined' ? undefined : location.href;

  let source: EventSourceLike | null = null;
  let timer: unknown = null;
  let attempt = 0;
  let closed = false;

  const report = (status: StreamStatus, delayMs?: number) => options.onStatus?.(status, delayMs === undefined ? { attempt } : { attempt, delayMs });

  const detach = () => {
    if (!source) return;
    source.onopen = source.onmessage = source.onerror = null;
    source.close();
    source = null;
  };

  const retry = () => {
    detach();
    if (closed) return;
    // Jitter keeps many viewers of one host from reconnecting in lockstep.
    const delayMs = Math.round(Math.min(maxMs, initialMs * 2 ** attempt) * (0.5 + random() / 2));
    attempt += 1;
    report('retrying', delayMs);
    timer = timers.set(open, delayMs);
  };

  function open() {
    timer = null;
    if (closed) return;
    const url = new URL(String(options.url), base);
    url.searchParams.set(param, String(options.store.getSnapshot().cursor));
    report('connecting');
    const next = new Source(url.href, options.withCredentials ? { withCredentials: true } : undefined);
    source = next;
    next.onopen = () => {
      attempt = 0;
      report('open');
    };
    next.onmessage = (message) => {
      let frame: unknown;
      try {
        frame = JSON.parse(message.data);
      } catch {
        return;
      }
      const mapped = options.map ? options.map(frame) : frame;
      if (mapped === null || mapped === undefined) return;
      options.store.apply(Array.isArray(mapped) ? mapped : [mapped]);
      if (options.store.getSnapshot().gap) retry();
    };
    next.onerror = retry;
  }

  const close = () => {
    if (closed) return;
    closed = true;
    if (timer !== null) timers.clear(timer);
    timer = null;
    detach();
    options.signal?.removeEventListener('abort', close);
    report('closed');
  };

  if (options.signal?.aborted) {
    closed = true;
    report('closed');
    return () => {};
  }
  options.signal?.addEventListener('abort', close, { once: true });
  open();
  return close;
}
