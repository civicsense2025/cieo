/* Headless 4-phase disclosure machine with mid-flight reversal preserving direction. */
import { createMachineStore, unchanged } from './types.js';
export function createInitialDisclosureState(defaultOpen = false) {
    return defaultOpen ? { phase: 'open', open: true } : { phase: 'closed', open: false };
}
export function reduceDisclosure(state, event) {
    switch (event.type) {
        case 'OPEN': {
            if (state.phase === 'open' || state.phase === 'opening')
                return unchanged(state, event);
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
            if (state.phase !== 'opening')
                return unchanged(state, event);
            return { prev: state, next: { phase: 'open', open: true }, event, changed: true, direction: 1 };
        }
        case 'CLOSE': {
            if (state.phase === 'closed' || state.phase === 'closing')
                return unchanged(state, event);
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
            if (state.phase !== 'closing')
                return unchanged(state, event);
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
export function createDisclosureMachine(options = {}) {
    return createMachineStore(createInitialDisclosureState(options.defaultOpen), reduceDisclosure);
}
