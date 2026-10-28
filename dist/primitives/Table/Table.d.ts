import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface TableProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the table. Required. */
    label: string;
    /** Header, body, and footer parts. Required. */
    children: ReactNode;
}
export declare function Table({ label, children, className, slotProps }: TableProps): import("react/jsx-runtime").JSX.Element;
