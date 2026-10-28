import type { ReactNode } from 'react';
import { type DropdownMenuProps } from '../DropdownMenu/DropdownMenu.js';
export interface MoreMenuProps {
    className?: string;
    slotProps?: DropdownMenuProps['slotProps'];
    /** Accessible name for the menu and its trigger. Defaults to 'More actions'. */
    label?: string;
    children: ReactNode;
}
export declare function MoreMenu({ label, children, className, slotProps }: MoreMenuProps): import("react/jsx-runtime").JSX.Element;
