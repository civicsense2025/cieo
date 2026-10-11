import type { ReactNode } from 'react';
export interface SideNavProps {
    /** Accessible name for the rail. Defaults to Sections. */
    label?: string;
    /** Narrow icon-rail mode. Defaults to false. */
    collapsed?: boolean;
    children: ReactNode;
}
export declare function SideNav({ label, collapsed, children }: SideNavProps): import("react/jsx-runtime").JSX.Element;
