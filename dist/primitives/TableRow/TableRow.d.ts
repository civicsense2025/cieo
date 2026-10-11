import type { ReactNode } from 'react';
export interface TableRowProps {
    /** Selected state; adds data-selected and a highlight. Defaults to false. */
    selected?: boolean;
    /** Cells for the row. Required. */
    children: ReactNode;
}
export declare function TableRow({ selected, children }: TableRowProps): import("react/jsx-runtime").JSX.Element;
