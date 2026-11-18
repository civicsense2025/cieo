/* Headless field validation machine: reward-early-on-input, punish-late-on-blur, preserve message. */
import { createMachineStore, unchanged } from './types.js';
export function createInitialFieldValidationState() {
    return { status: 'idle', value: '', message: '', open: false };
}
export function reduceFieldValidation(state, event, validate) {
    switch (event.type) {
        case 'INPUT': {
            const error = validate(event.value);
            const isValid = error === null;
            if (state.status === 'invalid') {
                if (isValid) {
                    // Reward early: immediately transition to valid, preserve existing message
                    const next = { status: 'valid', value: event.value, message: state.message, open: false };
                    return { prev: state, next, event, changed: true, direction: 1, haptic: 'success' };
                }
                // Still invalid during typing — just update value, stay invalid
                const next = { ...state, value: event.value };
                if (next.value === state.value)
                    return unchanged(state, event);
                return { prev: state, next, event, changed: true, direction: 0 };
            }
            if (state.status === 'valid') {
                if (!isValid) {
                    // Breaking a valid value relaxes to idle, not invalid
                    const next = { status: 'idle', value: event.value, message: state.message, open: false };
                    return { prev: state, next, event, changed: true, direction: -1 };
                }
                // Still valid — just update value
                const next = { ...state, value: event.value };
                if (next.value === state.value)
                    return unchanged(state, event);
                return { prev: state, next, event, changed: true, direction: 0 };
            }
            // idle: typing invalid stays idle; typing valid transitions to valid
            if (isValid && event.value.length > 0) {
                const next = { status: 'valid', value: event.value, message: state.message, open: false };
                return { prev: state, next, event, changed: true, direction: 1, haptic: 'success' };
            }
            const next = { ...state, value: event.value };
            if (next.value === state.value)
                return unchanged(state, event);
            return { prev: state, next, event, changed: true, direction: 0 };
        }
        case 'BLUR': {
            const error = validate(state.value);
            if (error !== null) {
                const next = { status: 'invalid', value: state.value, message: error, open: true };
                if (state.status === 'invalid' && state.message === error && state.open)
                    return unchanged(state, event);
                return { prev: state, next, event, changed: true, direction: -1, haptic: 'error' };
            }
            // Valid on blur — if we're already valid, no change
            if (state.status === 'valid')
                return unchanged(state, event);
            if (state.value.length === 0 && state.status === 'idle')
                return unchanged(state, event);
            const next = { status: 'valid', value: state.value, message: state.message, open: false };
            return { prev: state, next, event, changed: true, direction: 1 };
        }
        case 'RESET': {
            const next = createInitialFieldValidationState();
            if (state.status === 'idle' && state.value === '' && state.message === '' && !state.open) {
                return unchanged(state, event);
            }
            return { prev: state, next, event, changed: true, direction: 0 };
        }
    }
}
export function createFieldValidationMachine(options) {
    return createMachineStore(createInitialFieldValidationState(), (state, event) => reduceFieldValidation(state, event, options.validate));
}
