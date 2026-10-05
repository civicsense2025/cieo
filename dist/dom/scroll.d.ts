import { type MotionKind, type SpringConfig } from '../core/spring.js';
import { type Cancel, type From } from './index.js';
/** Elements inside root that still wait to reveal take their final state at once. Call before a user-requested scrollTo. */
export declare function revealNow(root: Element | null | undefined): void;
/** Elements wait in their start state and enter once, the first time they scroll into view (staggered, total ≤ 300 ms). */
export declare function reveal(targets: string | Element | Iterable<Element>, opts?: {
    kind?: MotionKind;
    from?: Partial<From>;
    cfg?: SpringConfig;
    stagger?: number;
    rootMargin?: string;
    threshold?: number;
}): Cancel;
/** A user-requested scroll of the page (pass window) or an element, on the soft spring. Any user input stops it in place. */
export declare function scrollTo(scroller: Element | Window | null, x?: number, y?: number, opts?: {
    kind?: MotionKind;
    cfg?: SpringConfig;
    done?: () => void;
}): Cancel;
