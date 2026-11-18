import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface ClickableCardProps extends Omit<ComponentPropsWithRef<'article'>, 'children'> {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Polymorphic child rendering: merges card classes, ref, and attributes onto the single child element. */
    asChild?: boolean;
    children: ReactNode;
}
export declare function ClickableCard({ children, className, slotProps, asChild, ref, style, ...rest }: ClickableCardProps): import("react/jsx-runtime").JSX.Element;
