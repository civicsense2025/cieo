import { type MotionKind, type SpringConfig } from '../core/spring.js';
export type Cancel = () => void;
type Targets = string | Element | Iterable<Element> | null | undefined;
export declare const owners: WeakMap<Element, Cancel>;
export declare const list: (x: Targets) => Element[];
export declare const gapFor: (n: number, gap?: number) => number;
/** Saves the inline values this module may write and returns a function that puts them back. */
export declare function hold(el: Element, moving?: boolean): () => void;
/** One motion per element: claiming finishes any earlier motion on it first. */
export declare function animate(els: Element[], job: {
    kind?: MotionKind;
    step: (t: number) => boolean | void;
    finish?: () => void;
}): Cancel;
export declare function paint(el: Element, o: number, y?: number, blur?: number, x?: number, scale?: number): void;
export interface From {
    x: number;
    y: number;
    scale: number;
    opacity: number;
    blur: number;
}
export interface PresenceOptions {
    kind?: MotionKind;
    from?: Partial<From>;
    cfg?: SpringConfig;
    delay?: number;
    stagger?: number;
    remove?: boolean;
    done?: () => void;
}
export declare function enter(target: Targets, opts?: PresenceOptions): Cancel;
export declare const exit: (el: HTMLElement, opts?: PresenceOptions) => Cancel;
export interface SwapOptions {
    kind?: MotionKind;
    y?: number;
    blur?: number;
    cfg?: SpringConfig;
    done?: () => void;
}
/** The old content leaves in EXIT (100 ms, ease-in), then the new content springs in. Never overlapping. */
export declare function swap(host: Element, next: string | Node, opts?: SwapOptions): Cancel;
export declare const longMove: (a: DOMRect, b: DOMRect) => boolean;
export interface FlipOptions {
    kind?: MotionKind;
    cfg?: SpringConfig;
    stagger?: number;
    clip?: Element;
    arrive?: number;
    y?: number;
    /** Positions measured before a mutation that already happened (React renders); skips the internal measure. */
    before?: Map<Element, DOMRect>;
    done?: () => void;
}
export declare function flip(container: Element, mutate: () => void, opts?: FlipOptions): Cancel;
/** Rolling number: changed characters leave in EXIT, then new ones spring in from the direction of change. Ends as plain text. */
export declare function digits(el: Element, value: string | number, opts?: {
    kind?: MotionKind;
    dir?: 1 | -1;
    y?: number;
    cfg?: SpringConfig;
    done?: () => void;
}): Cancel;
type Span = {
    left: number;
    right: number;
};
/** An indicator already laid out at its new place springs from an old span; the leading edge moves first, the trailing edge LAG later. */
export declare function edges(el: Element, from: Element | Span, to?: Element | Span, opts?: {
    kind?: MotionKind;
    cfg?: SpringConfig;
    lag?: number;
    done?: () => void;
}): Cancel;
export declare function track(el: Element, prop: string, value: number, opts?: {
    kind?: MotionKind;
    cfg?: SpringConfig;
}): Cancel;
export { reveal, revealNow, scrollTo } from './scroll.js';
