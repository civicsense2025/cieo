import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface BreadcrumbItemProps extends Omit<ComponentPropsWithRef<'li'>, 'children'> {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    current?: boolean;
    /** Polymorphic child rendering. */
    asChild?: boolean;
    children: ReactNode;
}
export declare function BreadcrumbItem({ className, slotProps, current, asChild, ref, style, children, ...rest }: BreadcrumbItemProps): import("react/jsx-runtime").JSX.Element;
