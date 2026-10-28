import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface GridSpanProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Columns spanned (1-12). Required. */
    span: number;
    children: ReactNode;
}
export declare function GridSpan({ className, slotProps, span, children }: GridSpanProps): import("react/jsx-runtime").JSX.Element;
