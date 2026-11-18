import { type ComponentPropsWithRef, type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TopNavMegaMenuItemProps extends Omit<ComponentPropsWithRef<'a'>, 'href' | 'title' | 'children'> {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        title?: PrimitivePartProps;
        description?: PrimitivePartProps;
    };
    /** Link target. Required unless rendering a router link via asChild. */
    href?: string;
    /** Row title. Required. */
    title: string;
    /** One-line supporting text. */
    description?: string;
    /** Polymorphic child rendering (e.g. Next.js <Link>). */
    asChild?: boolean;
    children?: ReactNode;
}
export declare function TopNavMegaMenuItem({ className, slotProps, href, title, description, asChild, ref, style, children, ...rest }: TopNavMegaMenuItemProps): import("react/jsx-runtime").JSX.Element;
