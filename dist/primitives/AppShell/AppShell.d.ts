import type { ReactNode } from 'react';
export interface AppShellProps {
    /** Navigation rail (SideNav). Optional, at most one. */
    nav?: ReactNode;
    /** Main page content. Required. */
    children: ReactNode;
}
export declare function AppShell({ nav, children }: AppShellProps): import("react/jsx-runtime").JSX.Element;
