import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface TableFooterProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Summary rows. Required. */
    children: ReactNode;
}
export declare function TableFooter({ className, slotProps, children }: TableFooterProps): import("react/jsx-runtime").JSX.Element;
