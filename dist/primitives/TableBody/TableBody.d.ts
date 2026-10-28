import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface TableBodyProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Data rows. Required. */
    children: ReactNode;
}
export declare function TableBody({ className, slotProps, children }: TableBodyProps): import("react/jsx-runtime").JSX.Element;
