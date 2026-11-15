import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
export interface ClipRangeProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        start?: PrimitivePartProps;
        length?: PrimitivePartProps;
        value?: PrimitivePartProps;
    };
    /** Accessible name for the pair (e.g. "Clip range"). Required. */
    label: string;
    /** Label for the start input (e.g. "Start"). Required. */
    startLabel: string;
    /** Label for the length input (e.g. "Length"). Required. */
    lengthLabel: string;
    /** Range floor in seconds. */
    min?: number;
    /** Media duration in seconds. Required. */
    max: number;
    /** Step in seconds. Defaults to 0.1. */
    step?: number;
    /** Unit shown after values (e.g. "s"). */
    unit?: string;
    /** Clip start in seconds. Host owns the value. Required. */
    start: number;
    /** Clip length in seconds. Host owns the value. Required. */
    length: number;
    /** Called with the clamped start. */
    onStartChange?: (start: number) => void;
    /** Called with the clamped length. */
    onLengthChange?: (length: number) => void;
    /** Disables both sliders. */
    disabled?: boolean;
    /** Formats seconds for the readout. Defaults to m:ss.t. */
    formatValue?: (seconds: number) => string;
    /** Extra help or budget note under the pair. */
    children?: ReactNode;
}
/** Formats seconds as m:ss.t for clip readouts. */
export declare function formatClipTime(seconds: number): string;
export declare function ClipRange({ className, slotProps, label, startLabel, lengthLabel, min, max, step, unit, start, length, disabled, onStartChange, onLengthChange, formatValue, children }: ClipRangeProps): import("react/jsx-runtime").JSX.Element;
