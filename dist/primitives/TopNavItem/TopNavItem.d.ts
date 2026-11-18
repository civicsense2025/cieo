import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TopNavItemProps extends Omit<ComponentPropsWithRef<'a'>, 'href' | 'children'> {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Link target. Required unless rendering a router link via asChild. */
    href?: string;
    /** Current page state; renders aria-current=page. Defaults to false. */
    current?: boolean;
    /** Polymorphic child rendering (e.g. Next.js <Link>). */
    asChild?: boolean;
    children: ReactNode;
}
export declare function TopNavItem({ className, slotProps, href, current, asChild, ref, style, children, ...rest }: TopNavItemProps): import("react/jsx-runtime").JSX.Element;
