import type { ReactNode } from 'react';
export interface TableSelectionToolbarProps {
    /** Number of selected rows. Required. */
    selectedCount: number;
    /** Bulk action buttons. Required. */
    children: ReactNode;
}
export declare function TableSelectionToolbar({ selectedCount, children }: TableSelectionToolbarProps): import("react/jsx-runtime").JSX.Element;
