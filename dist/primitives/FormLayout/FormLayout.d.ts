import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface FormLayoutProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Column count (1-4). Defaults to 1. */
    columns?: number;
    children: ReactNode;
}
export declare function FormLayout({ className, slotProps, columns, children }: FormLayoutProps): import("react/jsx-runtime").JSX.Element;
