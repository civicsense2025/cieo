import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface BreadcrumbsProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    label?: string;
    children: ReactNode;
}
export declare function Breadcrumbs({ className, slotProps, label, children }: BreadcrumbsProps): import("react/jsx-runtime").JSX.Element;
