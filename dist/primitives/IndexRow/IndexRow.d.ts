import type { PrimitivePartProps } from '../parts.js';
export interface IndexRowProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    rank: number;
    title: string;
    note?: string;
    /** 0 to 1; the row's figure drawn as a bar. */
    fraction?: number;
    href?: string;
}
/** Two digits: 1 becomes "01". */
export declare function rankLabel(rank: number): string;
/** A bar fraction clamped to 0..1, or null when it is not a number. */
export declare function barFraction(value?: number): number | null;
export declare function IndexRow({ className, slotProps, rank, title, note, fraction, href }: IndexRowProps): import("react/jsx-runtime").JSX.Element;
