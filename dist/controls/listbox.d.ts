export interface ListItem {
    label: string;
    disabled?: boolean;
}
export interface ListState {
    open: boolean;
    /** The option with visual focus while open. */
    active: number;
    /** The committed option (the native select's selectedIndex). */
    selected: number;
}
export interface KeyInput {
    key: string;
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
}
export interface KeyResult {
    state: ListState;
    /** True when the caller should preventDefault. Tab is never handled, so focus still moves on. */
    handled: boolean;
    /** Index to commit as the new value, if any. */
    commit?: number;
}
export declare function firstEnabled(items: readonly ListItem[]): number;
export declare function lastEnabled(items: readonly ListItem[]): number;
/** Moves `by` enabled steps from `from` without wrapping; stays put at either end. */
export declare function step(items: readonly ListItem[], from: number, by: number): number;
/** Type-ahead: characters typed within `timeout` ms build one search string. Repeating one character cycles through
    the options that start with it. */
export declare class Typeahead {
    private timeout;
    private buffer;
    private last;
    constructor(timeout?: number);
    get pending(): boolean;
    /** Returns the matching index or -1. `t` is in milliseconds. */
    find(char: string, items: readonly ListItem[], from: number, t: number): number;
    reset(): void;
}
/** One key press against the current state. `t` (ms) feeds the type-ahead clock. */
export declare function listboxKey(state: ListState, e: KeyInput, items: readonly ListItem[], ta: Typeahead, t: number): KeyResult;
