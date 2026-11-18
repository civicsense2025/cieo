import { type MotionKind, type SpringConfig } from '../core/spring.js';
import { type Cancel } from './paint.js';
export type EdgesAxis = 'x' | 'y' | 'both';
export interface Span {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
}
export interface EdgesOptions {
    kind?: MotionKind;
    cfg?: SpringConfig;
    lag?: number;
    axis?: EdgesAxis;
    done?: () => void;
}
/** An indicator already laid out at its new place springs from an old span; the leading edge moves first, the trailing edge LAG later. */
export declare function edges(el: Element, from: Element | Span, to?: Element | Span, opts?: EdgesOptions): Cancel;
