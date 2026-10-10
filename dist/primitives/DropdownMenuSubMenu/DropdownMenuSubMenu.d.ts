import type { ReactNode } from 'react';
export interface DropdownMenuSubMenuProps {
    /** Accessible name for the nested menu (e.g. "Export as"). Required. */
    label: string;
    children: ReactNode;
}
export declare function DropdownMenuSubMenu({ label, children }: DropdownMenuSubMenuProps): import("react/jsx-runtime").JSX.Element;
