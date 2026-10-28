import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface BreadcrumbItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    current?: boolean;
    children: ReactNode;
}
export declare function BreadcrumbItem({ className, slotProps, current, children }: BreadcrumbItemProps): import("react/jsx-runtime").JSX.Element;
