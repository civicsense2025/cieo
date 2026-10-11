import type { ReactNode } from 'react';
export interface SideNavItemProps {
    /** Link target. Required. */
    href: string;
    /** Current page state; renders aria-current=page. Defaults to false. */
    current?: boolean;
    children: ReactNode;
}
export declare function SideNavItem({ href, current, children }: SideNavItemProps): import("react/jsx-runtime").JSX.Element;
