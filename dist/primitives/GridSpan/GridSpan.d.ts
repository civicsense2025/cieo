import type { ReactNode } from 'react';
export interface GridSpanProps {
    /** Columns spanned (1-12). Required. */
    span: number;
    children: ReactNode;
}
export declare function GridSpan({ span, children }: GridSpanProps): import("react/jsx-runtime").JSX.Element;
