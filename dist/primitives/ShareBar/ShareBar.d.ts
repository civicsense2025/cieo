import type { PrimitivePartProps } from '../parts.js';
export interface ShareBarSegment {
    value: number;
    color: string;
    label?: string;
}
export interface ShareBarProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    segments: ShareBarSegment[];
    /** What the bar shows, read by screen readers, such as "Yes 73, No 25". */
    label: string;
}
/** Fractions of the whole, or null when any share is missing, zero, negative or alone. */
export declare function shareFractions(values: number[]): number[] | null;
export declare function ShareBar({ className, slotProps, segments, label }: ShareBarProps): import("react/jsx-runtime").JSX.Element | null;
