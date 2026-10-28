import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TopNavItemProps {
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
export declare function TopNavItem({ className, slotProps, href, current, children }: TopNavItemProps): import("react/jsx-runtime").JSX.Element;
