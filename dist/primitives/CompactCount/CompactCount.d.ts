import type { PrimitivePartProps } from '../parts.js';
/** Short, locale-aware form of a count: 164, 1.2K, 26.3K, 4M. Negative, fractional and non-finite input is clamped to a whole count of at least 0. */
export declare function formatCompactCount(n: number, locale?: string): string;
/** Exact form for screen readers and titles: 26,300. */
export declare function formatExactCount(n: number, locale?: string): string;
export interface CompactCountProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** The count to show. */
    value: number;
    /** Locale for formatting. Defaults to en. */
    locale?: string;
    /** Word read after the exact number (e.g. "likes", "views"). Optional. */
    unit?: string;
    /** False shows a zero instead of hiding it. Defaults to true (zero renders nothing visible, as feeds do). */
    hideZero?: boolean;
    /** False swaps the number without rolling. Defaults to true; reduced motion never rolls. */
    motion?: boolean;
}
export declare function CompactCount({ className, slotProps, value, locale, unit, hideZero, motion }: CompactCountProps): import("react/jsx-runtime").JSX.Element;
