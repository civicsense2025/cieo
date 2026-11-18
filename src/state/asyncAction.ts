/* Headless async action machine: double-submit lock, attemptId preservation on retry, truthful timeout -> uncertain. */
import { createMachineStore, unchanged, type AnchorRect, type MachineStore, type TransitionEnvelope } from './types.js';

export type AsyncActionStatus = 'idle' | 'pending' | 'succeeded' | 'failed' | 'canceled' | 'uncertain';

export interface AsyncActionState {
  readonly status: AsyncActionStatus;
  readonly attemptId: string | null;
  readonly attemptCount: number;
  readonly error?: string;
}

export type AsyncActionEvent =
  | { readonly type: 'SUBMIT'; readonly attemptId?: string; readonly anchorRect?: AnchorRect }
  | { readonly type: 'RESOLVE'; readonly attemptId?: string; readonly announcement?: string }
  | { readonly type: 'REJECT'; readonly attemptId?: string; readonly error?: string; readonly announcement?: string }
  | { readonly type: 'TIMEOUT'; readonly attemptId?: string; readonly announcement?: string }
  | { readonly type: 'CANCEL'; readonly announcement?: string }
  | { readonly type: 'RESET' };

export interface AsyncActionOptions {
  readonly initialStatus?: AsyncActionStatus;
  readonly createAttemptId?: (attemptNumber: number) => string;
}

/** Unguessable by default: the id is often forwarded as an idempotency key, so two visitors must never share one. */
export const defaultAttemptId = (): string =>
  typeof globalThis.crypto?.randomUUID === 'function' ? globalThis.crypto.randomUUID() : `attempt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

/** A late answer to a canceled or superseded attempt must not complete the current one. */
const staleAnswer = (state: AsyncActionState, attemptId: string | undefined): boolean =>
  attemptId !== undefined && attemptId !== state.attemptId;

export function createInitialAsyncActionState(initialStatus: AsyncActionStatus = 'idle'): AsyncActionState {
  return { status: initialStatus, attemptId: null, attemptCount: 0 };
}

export function reduceAsyncAction(
  state: AsyncActionState,
  event: AsyncActionEvent,
  mintId: (attemptNumber: number) => string = defaultAttemptId,
): TransitionEnvelope<AsyncActionState, AsyncActionEvent> {
  switch (event.type) {
    case 'SUBMIT': {
      // Double-submit lock while in-flight.
      if (state.status === 'pending') return unchanged(state, event);
      const nextCount = state.attemptCount + 1;
      const preserve = (state.status === 'failed' || state.status === 'uncertain') && state.attemptId !== null;
      const attemptId = event.attemptId ?? (preserve ? state.attemptId : mintId(nextCount));
      const next: AsyncActionState = { status: 'pending', attemptId, attemptCount: nextCount };
      return {
        prev: state,
        next,
        event,
        changed: true,
        direction: 1,
        anchorRect: event.anchorRect,
      };
    }
    case 'RESOLVE': {
      if (state.status !== 'pending' || staleAnswer(state, event.attemptId)) return unchanged(state, event);
      const next: AsyncActionState = { status: 'succeeded', attemptId: state.attemptId, attemptCount: state.attemptCount };
      return {
        prev: state,
        next,
        event,
        changed: true,
        direction: 1,
        haptic: 'success',
        announcement: event.announcement ?? 'Completed.',
      };
    }
    case 'REJECT': {
      if (state.status !== 'pending' || staleAnswer(state, event.attemptId)) return unchanged(state, event);
      const next: AsyncActionState = {
        status: 'failed',
        attemptId: state.attemptId,
        attemptCount: state.attemptCount,
        ...(event.error !== undefined ? { error: event.error } : {}),
      };
      return {
        prev: state,
        next,
        event,
        changed: true,
        direction: -1,
        haptic: 'error',
        announcement: event.announcement ?? event.error ?? 'Action failed.',
      };
    }
    case 'TIMEOUT': {
      if (state.status !== 'pending' || staleAnswer(state, event.attemptId)) return unchanged(state, event);
      const next: AsyncActionState = { status: 'uncertain', attemptId: state.attemptId, attemptCount: state.attemptCount };
      return {
        prev: state,
        next,
        event,
        changed: true,
        direction: 0,
        haptic: 'warning',
        announcement: event.announcement ?? 'Sending could not be confirmed.',
      };
    }
    case 'CANCEL': {
      if (state.status !== 'pending') return unchanged(state, event);
      const next: AsyncActionState = { status: 'canceled', attemptId: state.attemptId, attemptCount: state.attemptCount };
      return {
        prev: state,
        next,
        event,
        changed: true,
        direction: -1,
        announcement: event.announcement ?? 'Canceled.',
      };
    }
    case 'RESET': {
      if (state.status === 'pending' || (state.status === 'idle' && state.attemptId === null && state.error === undefined)) {
        return unchanged(state, event);
      }
      const next: AsyncActionState = { status: 'idle', attemptId: null, attemptCount: state.attemptCount };
      return { prev: state, next, event, changed: true, direction: 0 };
    }
  }
}

export function createAsyncActionMachine(options: AsyncActionOptions = {}): MachineStore<AsyncActionState, AsyncActionEvent> {
  const mint = options.createAttemptId ?? defaultAttemptId;
  return createMachineStore(
    createInitialAsyncActionState(options.initialStatus),
    (state, event) => reduceAsyncAction(state, event, mint),
  );
}
