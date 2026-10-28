import type { PrimitivePartProps } from '../parts.js';
export interface SkeletonProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        lines?: PrimitivePartProps;
        line?: PrimitivePartProps;
        label?: PrimitivePartProps;
    };
    /** Line count, 1–12. Defaults to 3. */
    lines?: number;
    /** Screen-reader label. Defaults to Loading. */
    label?: string;
    /** False renders the static bar instantly. Defaults to true. */
    motion?: boolean;
}
export declare function Skeleton({ className, slotProps, lines, label, motion }: SkeletonProps): import("react/jsx-runtime").JSX.Element;
