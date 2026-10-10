import type { ReactNode } from 'react';
export interface TableHeaderCellProps {
    /** Header scope. Defaults to col. */
    scope?: 'col' | 'row';
    /** Sort state; none renders a plain th, asc/desc renders a sort button. Defaults to none. */
    sort?: 'none' | 'asc' | 'desc';
    /** Called when the sort button is pressed. Host updates data order. */
    onSort?: () => void;
    /** Header content. Required. */
    children: ReactNode;
}
export declare function TableHeaderCell({ scope, sort, onSort, children }: TableHeaderCellProps): import("react/jsx-runtime").JSX.Element;
