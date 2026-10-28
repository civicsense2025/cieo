import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface TableSelectionToolbarProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Number of selected rows. Required. */
    selectedCount: number;
    /** Bulk action buttons. Required. */
    children: ReactNode;
}
export declare function TableSelectionToolbar({ className, slotProps, selectedCount, children }: TableSelectionToolbarProps): import("react/jsx-runtime").JSX.Element;
