import type { ReactNode } from 'react';
export interface NavHeadingMenuProps {
    /** Visible heading and accessible name. Required. */
    label: string;
    children: ReactNode;
}
export declare function NavHeadingMenu({ label, children }: NavHeadingMenuProps): import("react/jsx-runtime").JSX.Element;
