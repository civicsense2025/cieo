import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TableCellProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Cell content. Required. */
    children: ReactNode;
}
export declare function TableCell({ className, slotProps, children }: TableCellProps): import("react/jsx-runtime").JSX.Element;
