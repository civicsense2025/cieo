import type { ReactNode } from 'react';
export interface FormLayoutProps {
    /** Column count (1-4). Defaults to 1. */
    columns?: number;
    children: ReactNode;
}
export declare function FormLayout({ columns, children }: FormLayoutProps): import("react/jsx-runtime").JSX.Element;
