import { type MotionKind } from '../core/spring.js';
export type Cancel = () => void;
export type Targets = string | Element | Iterable<Element> | null | undefined;
export declare const owners: WeakMap<Element, Cancel>;
export declare const noop: Cancel;
export declare const st: (el: Element) => CSSStyleDeclaration;
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
export declare const paintFrom: (el: Element, p: number, f: From) => void;
