import { parseAgentEvent, type AgentEvent } from './event.js';
import { DEFAULT_LIMITS, createAgentState, reduce, type AgentLimits, type AgentRunState } from './reduce.js';

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

export function createAgentStore(options: AgentStoreOptions = {}): AgentStore {
  const limits: Readonly<AgentLimits> = Object.freeze({ ...DEFAULT_LIMITS, ...options.limits });
  for (const key of ['maxActivity', 'maxTextChars', 'maxEntities'] as const) {
    if (!Number.isSafeInteger(limits[key]) || limits[key] < 1) throw new RangeError(key);
  }
  let state = options.initial ?? createAgentState();
  let dropped = 0;
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of [...listeners]) {
      try {
        listener();
      } catch (error) {
        // One broken view must not stop the others from seeing the update.
        console.error(error);
      }
    }
  };

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    apply(input) {
      const events: AgentEvent[] = [];
      for (const raw of input) {
        const event = parseAgentEvent(raw);
        if (event) events.push(event);
        else dropped += 1;
      }
      // A batch may arrive out of order; the log order is the sequence, not arrival.
      events.sort((a, b) => a.seq - b.seq);
      const before = state;
      let changed = 0;
      for (const event of events) {
        const next = reduce(state, event, limits);
        if (next !== state) changed += 1;
        state = next;
      }
      if (state !== before) notify();
      return changed;
    },
    reset(next = createAgentState()) {
      if (next === state) return;
      state = next;
      notify();
    },
    get dropped() {
      return dropped;
    },
  };
}
