/* Headless reorder machine: drag, keyboard move, displacement signs, haptics, and announcements. */
import { createMachineStore, unchanged } from './types.js';
function emptyDisplacement(order) {
    const d = {};
    for (const id of order)
        d[id] = 0;
    return d;
}
function computeDisplacement(order, activeId, originIndex, targetIndex) {
    const d = emptyDisplacement(order);
    if (originIndex === targetIndex)
        return d;
    const lo = Math.min(originIndex, targetIndex);
    const hi = Math.max(originIndex, targetIndex);
    const sign = originIndex < targetIndex ? -1 : 1;
    for (let i = lo; i <= hi; i++) {
        const id = order[i];
        if (id !== activeId)
            d[id] = sign;
    }
    d[activeId] = 0;
    return d;
}
function reorder(order, fromIndex, toIndex) {
    const result = [...order];
    const [item] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, item);
    return result;
}
export function createInitialReorderState(options) {
    const order = [...options.order];
    return {
        order,
        activeId: null,
        originIndex: -1,
        targetIndex: -1,
        displacement: emptyDisplacement(order),
        mode: null,
    };
}
export function reduceReorder(state, event, labels = {}) {
    switch (event.type) {
        case 'LIFT': {
            if (state.activeId !== null)
                return unchanged(state, event);
            const idx = state.order.indexOf(event.id);
            if (idx === -1)
                return unchanged(state, event);
            const label = labels[event.id] ?? event.id;
            const next = {
                order: state.order,
                activeId: event.id,
                originIndex: idx,
                targetIndex: idx,
                displacement: emptyDisplacement(state.order),
                mode: event.mode,
            };
            return {
                prev: state,
                next,
                event,
                changed: true,
                direction: 0,
                haptic: 'lift',
                announcement: `${label}, grabbed, position ${idx + 1} of ${state.order.length}`,
            };
        }
        case 'MOVE': {
            if (state.activeId === null)
                return unchanged(state, event);
            const overIndex = Math.max(0, Math.min(state.order.length - 1, event.overIndex));
            if (overIndex === state.targetIndex)
                return unchanged(state, event);
            const displacement = computeDisplacement(state.order, state.activeId, state.originIndex, overIndex);
            const direction = (Math.sign(overIndex - state.targetIndex) || 0);
            const label = labels[state.activeId] ?? state.activeId;
            const next = {
                ...state,
                targetIndex: overIndex,
                displacement,
            };
            return {
                prev: state,
                next,
                event,
                changed: true,
                direction,
                haptic: 'selection',
                announcement: `${label}, position ${overIndex + 1} of ${state.order.length}`,
            };
        }
        case 'DROP': {
            if (state.activeId === null)
                return unchanged(state, event);
            const newOrder = reorder(state.order, state.originIndex, state.targetIndex);
            const finalPos = state.targetIndex;
            const label = labels[state.activeId] ?? state.activeId;
            const next = {
                order: newOrder,
                activeId: null,
                originIndex: -1,
                targetIndex: -1,
                displacement: emptyDisplacement(newOrder),
                mode: null,
            };
            return {
                prev: state,
                next,
                event,
                changed: true,
                direction: 0,
                haptic: 'drop',
                velocity: event.velocity,
                announcement: `${label}, dropped, position ${finalPos + 1} of ${newOrder.length}`,
            };
        }
        case 'CANCEL': {
            if (state.activeId === null)
                return unchanged(state, event);
            const label = labels[state.activeId] ?? state.activeId;
            const next = {
                order: state.order,
                activeId: null,
                originIndex: -1,
                targetIndex: -1,
                displacement: emptyDisplacement(state.order),
                mode: null,
            };
            return {
                prev: state,
                next,
                event,
                changed: true,
                direction: 0,
                announcement: `${label}, canceled reorder`,
            };
        }
    }
}
export function createReorderMachine(options) {
    const labels = options.labels ?? {};
    return createMachineStore(createInitialReorderState(options), (state, event) => reduceReorder(state, event, labels));
}
