import { type MotionKind, type SpringConfig } from '../core/spring.js';
import { type Cancel } from './paint.js';
export declare function digits(el: Element, value: string | number, opts?: {
    kind?: MotionKind;
    dir?: 1 | -1;
    y?: number;
    cfg?: SpringConfig;
    done?: () => void;
}): Cancel;
