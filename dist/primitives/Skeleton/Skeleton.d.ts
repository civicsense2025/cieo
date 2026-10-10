export interface SkeletonProps {
    /** Line count, 1–12. Defaults to 3. */
    lines?: number;
    /** Screen-reader label. Defaults to Loading. */
    label?: string;
}
export declare function Skeleton({ lines, label }: SkeletonProps): import("react/jsx-runtime").JSX.Element;
