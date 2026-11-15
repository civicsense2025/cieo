import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export interface CompareCurtainProps extends MotionProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        before?: PrimitivePartProps;
        after?: PrimitivePartProps;
        divider?: PrimitivePartProps;
    };
    /** Accessible name for the divider slider (e.g. "Comparison divider"). Required. */
    label: string;
    /** Words spoken after the percentage (e.g. "vector result visible"). Required. */
    valueText: string;
    /** Full-bleed layer underneath. Required. */
    before: ReactNode;
    /** Layer clipped from the inline end by position. Required. */
    after: ReactNode;
    /** Divider position, 0–100. Clamped. */
    position: number;
    /** Called with the clamped 0–100 position. Host owns the value. */
    onMove?: (position: number) => void;
    /** Keyboard step in points. Defaults to 4. */
    step?: number;
}
export declare function CompareCurtain({ className, slotProps, label, valueText, before, after, position, onMove, step, motion, entering, exiting }: CompareCurtainProps): import("react/jsx-runtime").JSX.Element;
