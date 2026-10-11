import type { ReactNode } from 'react';
export interface GridProps {
    /** Column count (1-12). Defaults to 12. */
    columns?: number;
    /** Gap between cells. Defaults to 'md'. */
    gap?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}
export declare function Grid({ columns, gap, children }: GridProps): import("react/jsx-runtime").JSX.Element;
