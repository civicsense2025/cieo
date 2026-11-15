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
    /** Large keyboard step in points for PageUp/PageDown. Defaults to ten times step. */
    largeStep?: number;
}
/** Pointer fraction from the inline-start edge, so dragging toward inline-start reduces the value in both directions. */
export declare function curtainFraction(clientX: number, left: number, right: number, rtl: boolean): number;
/** Keyboard move in points for a key; 'min'/'max' for Home/End, null when unhandled. Arrows follow APG direction: in RTL, ArrowRight decreases. */
export declare function curtainKeyMove(key: string, step: number, largeStep: number, rtl: boolean): number | 'min' | 'max' | null;
export declare function CompareCurtain({ className, slotProps, label, valueText, before, after, position, onMove, step, largeStep, motion, entering, exiting }: CompareCurtainProps): import("react/jsx-runtime").JSX.Element;
