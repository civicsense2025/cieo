import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface TableHeaderProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Header rows. Required. */
    children: ReactNode;
}
export declare function TableHeader({ className, slotProps, children }: TableHeaderProps): import("react/jsx-runtime").JSX.Element;
