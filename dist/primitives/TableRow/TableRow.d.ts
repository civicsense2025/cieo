import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TableRowProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Selected state; adds data-selected and a highlight. Defaults to false. */
    selected?: boolean;
    /** Cells for the row. Required. */
    children: ReactNode;
}
export declare function TableRow({ className, slotProps, selected, children }: TableRowProps): import("react/jsx-runtime").JSX.Element;
