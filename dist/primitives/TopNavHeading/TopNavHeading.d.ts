import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TopNavHeadingProps extends Omit<ComponentPropsWithRef<'a'>, 'href' | 'children'> {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Brand link target. Defaults to /. */
    href?: string;
    /** Polymorphic child rendering (e.g. Next.js <Link>). */
    asChild?: boolean;
    children: ReactNode;
}
export declare function TopNavHeading({ className, slotProps, href, asChild, ref, style, children, ...rest }: TopNavHeadingProps): import("react/jsx-runtime").JSX.Element;
