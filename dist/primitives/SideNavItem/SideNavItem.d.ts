import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface SideNavItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Link target. Required. */
    href: string;
    /** Current page state; renders aria-current=page. Defaults to false. */
    current?: boolean;
    children: ReactNode;
}
export declare function SideNavItem({ className, slotProps, href, current, children }: SideNavItemProps): import("react/jsx-runtime").JSX.Element;
