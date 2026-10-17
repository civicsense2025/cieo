'use client';
/* React bindings for the agent store. The store owns state; these hooks only subscribe and connect. */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { AgentRunState } from './reduce.js';
import type { AgentStore } from './store.js';
import { connectEventStream, type EventStreamOptions, type StreamStatus } from './stream.js';

/** Reads a slice of the store. Pass a selector from cieo/agent (or one as stable) so renders stay bounded. */
export function useAgentStore<T>(store: AgentStore, selector: (state: AgentRunState) => T): T {
  const read = () => selector(store.getSnapshot());
  return useSyncExternalStore(store.subscribe, read, read);
}

export type AgentStreamOptions = Omit<EventStreamOptions, 'store' | 'signal' | 'onStatus'>;

/** Follows a stream into the store while mounted. Pass null to stay disconnected. Reconnects when the url changes. */
export function useAgentStream(store: AgentStore, options: AgentStreamOptions | null): StreamStatus {
  const [status, setStatus] = useState<StreamStatus>('closed');
  const latest = useRef(options);
  latest.current = options;
  const url = options ? String(options.url) : null;

  useEffect(() => {
    const current = latest.current;
    if (!current || url === null) {
      setStatus('closed');
      return;
    }
    const controller = new AbortController();
    connectEventStream({ ...current, store, signal: controller.signal, onStatus: (next) => setStatus(next) });
    return () => controller.abort();
  }, [store, url]);

  return status;
}
