/* Headless 4-phase disclosure machine with mid-flight reversal preserving direction. */
import { createMachineStore, unchanged, type AnchorRect, type MachineStore, type TransitionEnvelope, type Vector2 } from './types.js';

export type DisclosurePhase = 'closed' | 'opening' | 'open' | 'closing';

export interface DisclosureState {
  readonly phase: DisclosurePhase;
  readonly open: boolean;
}

export type DisclosureEvent =
  | { readonly type: 'OPEN'; readonly anchorRect?: AnchorRect }
  | { readonly type: 'OPENED' }
  | { readonly type: 'CLOSE'; readonly velocity?: Vector2 }
  | { readonly type: 'CLOSED' }
  | { readonly type: 'TOGGLE'; readonly anchorRect?: AnchorRect };

export interface DisclosureMachineOptions {
  readonly defaultOpen?: boolean;
}

export function createInitialDisclosureState(defaultOpen = false): DisclosureState {
  return defaultOpen ? { phase: 'open', open: true } : { phase: 'closed', open: false };
}

export function reduceDisclosure(
  state: DisclosureState,
  event: DisclosureEvent,
): TransitionEnvelope<DisclosureState, DisclosureEvent> {
  switch (event.type) {
    case 'OPEN': {
      if (state.phase === 'open' || state.phase === 'opening') return unchanged(state, event);
      return {
        prev: state,
        next: { phase: 'opening', open: true },
        event,
        changed: true,
        direction: 1,
        anchorRect: event.anchorRect,
        haptic: 'selection',
      };
    }
    case 'OPENED': {
      if (state.phase !== 'opening') return unchanged(state, event);
      return { prev: state, next: { phase: 'open', open: true }, event, changed: true, direction: 1 };
    }
    case 'CLOSE': {
      if (state.phase === 'closed' || state.phase === 'closing') return unchanged(state, event);
      return {
        prev: state,
        next: { phase: 'closing', open: false },
        event,
        changed: true,
        direction: -1,
        velocity: event.velocity,
      };
    }
    case 'CLOSED': {
      if (state.phase !== 'closing') return unchanged(state, event);
      return { prev: state, next: { phase: 'closed', open: false }, event, changed: true, direction: -1 };
    }
    case 'TOGGLE': {
      if (state.phase === 'closed' || state.phase === 'closing') {
        return {
          prev: state,
          next: { phase: 'opening', open: true },
          event,
          changed: true,
          direction: 1,
          anchorRect: event.anchorRect,
          haptic: 'selection',
        };
      }
      return {
        prev: state,
        next: { phase: 'closing', open: false },
        event,
        changed: true,
        direction: -1,
      };
    }
  }
}

export function createDisclosureMachine(options: DisclosureMachineOptions = {}): MachineStore<DisclosureState, DisclosureEvent> {
  return createMachineStore(createInitialDisclosureState(options.defaultOpen), reduceDisclosure);
}
