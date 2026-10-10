import type { ReactNode } from 'react';
export interface TopNavMenuProps {
    /** Accessible name for the group (e.g. "Products"). Required. */
    label: string;
    children: ReactNode;
}
export declare function TopNavMenu({ label, children }: TopNavMenuProps): import("react/jsx-runtime").JSX.Element;
