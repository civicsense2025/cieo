/* Headless physics-coupled state machine contracts and pure store factory. Zero DOM/React dependencies. */
export function unchanged(state, event) {
    return { prev: state, next: state, event, changed: false, direction: 0 };
}
/** Creates a pure external store compatible with React's useSyncExternalStore. */
export function createMachineStore(initialState, reducer) {
    let state = initialState;
    let lastEnvelope = null;
    const listeners = new Set();
    return {
        getSnapshot: () => state,
        getLastEnvelope: () => lastEnvelope,
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        send(event) {
            const envelope = reducer(state, event);
            lastEnvelope = envelope;
            if (envelope.changed && !Object.is(envelope.next, state)) {
                state = envelope.next;
                for (const listener of [...listeners])
                    listener();
            }
            return envelope;
        },
    };
}
