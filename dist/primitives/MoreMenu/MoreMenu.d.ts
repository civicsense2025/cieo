import type { ReactNode } from 'react';
export interface MoreMenuProps {
    /** Accessible name for the menu and its trigger. Defaults to 'More actions'. */
    label?: string;
    children: ReactNode;
}
export declare function MoreMenu({ label, children }: MoreMenuProps): import("react/jsx-runtime").JSX.Element;
