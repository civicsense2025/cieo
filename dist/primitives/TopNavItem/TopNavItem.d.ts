import type { ReactNode } from 'react';
export interface TopNavItemProps {
    /** Link target. Required. */
    href: string;
    /** Current page state; renders aria-current=page. Defaults to false. */
    current?: boolean;
    children: ReactNode;
}
export declare function TopNavItem({ href, current, children }: TopNavItemProps): import("react/jsx-runtime").JSX.Element;
