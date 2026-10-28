import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-label' | 'children'> {
    slotProps?: {
        root?: PrimitivePartProps;
    };
    label: string;
    size?: 'sm' | 'md';
    children: ReactNode;
}
export declare function IconButton({ slotProps, label, size, children, type, className, ...rest }: IconButtonProps): import("react/jsx-runtime").JSX.Element;
