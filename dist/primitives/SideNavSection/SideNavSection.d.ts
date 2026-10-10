import type { ReactNode } from 'react';
export interface SideNavSectionProps {
    /** Accessible name for the group. */
    label?: string;
    children: ReactNode;
}
export declare function SideNavSection({ label, children }: SideNavSectionProps): import("react/jsx-runtime").JSX.Element;
