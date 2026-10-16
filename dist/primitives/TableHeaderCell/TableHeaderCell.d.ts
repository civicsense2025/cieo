import type { ReactNode } from 'react';
export interface TableHeaderCellProps {
    /** Header scope. Defaults to col. */
    scope?: 'col' | 'row';
    /** Current sort direction. Defaults to none. */
    sort?: 'none' | 'asc' | 'desc';
    /** Called when the sort button is pressed. Makes the header sortable. */
    onSort?: () => void;
    children: ReactNode;
}
export declare function TableHeaderCell({ scope, sort, onSort, children }: TableHeaderCellProps): import("react/jsx-runtime").JSX.Element;
