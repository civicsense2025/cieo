import { type MachineStore, type TransitionEnvelope } from './types.js';
import { type AsyncActionOptions, type AsyncActionState, type AsyncActionEvent } from './asyncAction.js';
import { type DisclosureMachineOptions, type DisclosureState, type DisclosureEvent } from './disclosure.js';
import { type SheetDetentsOptions, type SheetDetentsState, type SheetDetentsEvent } from './sheetDetents.js';
import { type ToastQueueOptions } from './toastQueue.js';
import { type FieldValidationOptions, type FieldValidationState, type FieldValidationEvent } from './fieldValidation.js';
import { type ReorderOptions, type ReorderState, type ReorderEvent } from './reorder.js';
import { type ListboxMenuOptions, type ListboxMenuState, type ListboxMenuEvent } from './listboxMenu.js';
import { type SelectionOptions, type SelectionState, type SelectionEvent } from './selection.js';
export interface UseControllableStateOptions<T> {
    value?: T;
    defaultValue?: T;
    onChange?: (next: T) => void;
}
export declare function useControllableState<T>(opts: UseControllableStateOptions<T>): [T, (next: T | ((prev: T) => T)) => void];
export declare function useMachine<S, E>(factory: () => MachineStore<S, E>): [S, (event: E) => TransitionEnvelope<S, E>, MachineStore<S, E>];
export declare function useAsyncAction(opts?: AsyncActionOptions): {
    submit: (o?: {
        attemptId?: string;
    }) => TransitionEnvelope<AsyncActionState, AsyncActionEvent>;
    resolve: (o?: {
        announcement?: string;
    }) => TransitionEnvelope<AsyncActionState, AsyncActionEvent>;
    reject: (o?: {
        error?: string;
        announcement?: string;
    }) => TransitionEnvelope<AsyncActionState, AsyncActionEvent>;
    timeout: () => TransitionEnvelope<AsyncActionState, AsyncActionEvent>;
    cancel: () => TransitionEnvelope<AsyncActionState, AsyncActionEvent>;
    reset: () => TransitionEnvelope<AsyncActionState, AsyncActionEvent>;
    status: import("./asyncAction.js").AsyncActionStatus;
    attemptId: string | null;
    attemptCount: number;
    error?: string;
};
export declare function useDisclosure(opts?: DisclosureMachineOptions): {
    onOpen: () => TransitionEnvelope<DisclosureState, DisclosureEvent>;
    onOpened: () => TransitionEnvelope<DisclosureState, DisclosureEvent>;
    onClose: () => TransitionEnvelope<DisclosureState, DisclosureEvent>;
    onClosed: () => TransitionEnvelope<DisclosureState, DisclosureEvent>;
    toggle: () => TransitionEnvelope<DisclosureState, DisclosureEvent>;
    phase: import("./disclosure.js").DisclosurePhase;
    open: boolean;
};
export declare function useSheetDetents(opts?: SheetDetentsOptions): {
    drag: (position: number) => TransitionEnvelope<SheetDetentsState, SheetDetentsEvent>;
    release: (velocity?: {
        x: number;
        y: number;
    }) => TransitionEnvelope<SheetDetentsState, SheetDetentsEvent>;
    snapTo: (index: number) => TransitionEnvelope<SheetDetentsState, SheetDetentsEvent>;
    dismiss: () => TransitionEnvelope<SheetDetentsState, SheetDetentsEvent>;
    detents: readonly number[];
    index: number;
    position: number;
    dragging: boolean;
};
export declare function useToastQueue(opts?: ToastQueueOptions): {
    enqueue: (options: import("./toastQueue.js").ToastEnqueueOptions) => void;
    pause: () => void;
    resume: () => void;
    dismiss: (id: string, velocity?: import("./types.js").Vector2) => TransitionEnvelope<import("./toastQueue.js").ToastQueueState, {
        type: "DISMISS";
    }>;
    tick: (deltaMs: number) => void;
    visible: readonly import("./toastQueue.js").ToastEntry[];
    queued: readonly import("./toastQueue.js").ToastEntry[];
    paused: boolean;
};
export declare function useFieldValidation(opts: FieldValidationOptions): {
    input: (value: string) => TransitionEnvelope<FieldValidationState, FieldValidationEvent>;
    blur: () => TransitionEnvelope<FieldValidationState, FieldValidationEvent>;
    reset: () => TransitionEnvelope<FieldValidationState, FieldValidationEvent>;
    status: import("./fieldValidation.js").FieldValidationStatus;
    value: string;
    message: string;
    open: boolean;
};
export declare function useReorder(opts: ReorderOptions): {
    lift: (id: string, mode: "keyboard" | "pointer") => TransitionEnvelope<ReorderState, ReorderEvent>;
    move: (overIndex: number) => TransitionEnvelope<ReorderState, ReorderEvent>;
    drop: (velocity?: {
        x: number;
        y: number;
    }) => TransitionEnvelope<ReorderState, ReorderEvent>;
    cancel: () => TransitionEnvelope<ReorderState, ReorderEvent>;
    order: readonly string[];
    activeId: string | null;
    originIndex: number;
    targetIndex: number;
    displacement: Readonly<Record<string, -1 | 0 | 1>>;
    mode: "keyboard" | "pointer" | null;
};
export declare function useListboxMenu(opts?: ListboxMenuOptions): {
    send: (event: ListboxMenuEvent) => TransitionEnvelope<ListboxMenuState, ListboxMenuEvent>;
    options: readonly import("./listboxMenu.js").ListboxOption[];
    open: boolean;
    activeIndex: number;
    selectedId: string | null;
    typeaheadBuffer: string;
    lastTypeaheadMs: number;
};
export declare function useSelection<T extends string = string>(opts?: SelectionOptions<T>): {
    select: (value: T) => TransitionEnvelope<SelectionState<T>, SelectionEvent<T>>;
    toggle: (value: T) => TransitionEnvelope<SelectionState<T>, SelectionEvent<T>>;
    moveFocus: (delta: -1 | 1) => TransitionEnvelope<SelectionState<T>, SelectionEvent<T>>;
    clear: () => TransitionEnvelope<SelectionState<T>, SelectionEvent<T>>;
    items: readonly T[];
    selected: readonly T[];
    value: T | null;
    multiple: boolean;
    focusedIndex: number;
    loop: boolean;
};
