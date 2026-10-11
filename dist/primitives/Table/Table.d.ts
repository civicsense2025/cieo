import type { ReactNode } from 'react';
export interface TableProps {
    /** Accessible name for the table. Required. */
    label: string;
    /** Header, body, and footer parts. Required. */
    children: ReactNode;
}
export declare function Table({ label, children }: TableProps): import("react/jsx-runtime").JSX.Element;
