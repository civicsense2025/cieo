import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-label' | 'children'> {
    slotProps?: {
        root?: PrimitivePartProps;
    };
    label: string;
    size?: 'sm' | 'md';
    /** Polymorphic child rendering: merges icon-button semantics and styling onto the single child element. */
    asChild?: boolean;
    children: ReactNode;
}
export declare function IconButton({ slotProps, label, size, asChild, children, type, className, style, ref, ...rest }: IconButtonProps): import("react/jsx-runtime").JSX.Element;
