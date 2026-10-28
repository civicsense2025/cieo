import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface AppShellProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        navigation?: PrimitivePartProps;
        content?: PrimitivePartProps;
    };
    /** Navigation rail (SideNav). Optional, at most one. */
    nav?: ReactNode;
    /** Main page content. Required. */
    children: ReactNode;
}
export declare function AppShell({ nav, children, className, slotProps }: AppShellProps): import("react/jsx-runtime").JSX.Element;
