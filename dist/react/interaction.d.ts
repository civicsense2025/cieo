import { type RefObject } from 'react';
export type RoveKey = 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End';
/** Next index for a roving-focus key, or null when the key does not move focus. Wraps at both ends unless loop is false. */
export declare function roveIndex(key: string, current: number, count: number, opts?: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
}): number | null;
/** Enabled elements matching selector inside container, in document order. */
export declare function enabledIn(container: Element | null, selector: string): HTMLElement[];
/** Moves focus among `selector` items in response to a roving key; returns true when it handled the key. */
export declare function roveFocus(event: {
    key: string;
    preventDefault(): void;
}, container: Element | null, selector: string, opts?: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    activate?: boolean;
}): boolean;
/** While open, calls onDismiss for Escape and for presses outside every inside ref. Listeners are removed on close and unmount. */
export declare function useDismiss(open: boolean, onDismiss: (reason: 'escape' | 'outside') => void, inside: Array<RefObject<Element | null>>, opts?: {
    escape?: boolean;
    outside?: boolean;
}): void;
/** While active: moves focus into the container, keeps Tab inside it, and restores the previous focus on close. Returns the keydown handler to attach. */
export declare function useModalFocus(active: boolean, ref: RefObject<HTMLElement | null>): (event: {
    key: string;
    shiftKey: boolean;
    preventDefault(): void;
}) => void;
/** Hover/focus hints that Escape can dismiss until the pointer and focus leave. Spread `handlers` on the wrapper; style from `dismissed`. */
export declare function useDismissibleHint(): {
    dismissed: boolean;
    handlers: {
        onMouseEnter(): void;
        onMouseLeave(): void;
        onFocus(): void;
        onBlur(): void;
    };
};
