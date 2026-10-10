export interface SkeletonProps {
    /** Line count, 1–12. Defaults to 3. */
    lines?: number;
    /** Screen-reader label. Defaults to Loading. */
    label?: string;
    /** False renders the static bar instantly. Defaults to true. */
    motion?: boolean;
}
export declare function Skeleton({ lines, label, motion }: SkeletonProps): import("react/jsx-runtime").JSX.Element;
