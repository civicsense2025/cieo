import { type MotionKind, type SpringConfig } from '../core/spring.js';
import { type Cancel } from './paint.js';
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
