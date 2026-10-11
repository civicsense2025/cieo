import type { ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export interface DropdownMenuSubMenuProps extends MotionProps {
    /** Accessible name for the nested menu (e.g. "Export as"). Required. */
    label: string;
    children: ReactNode;
}
export declare function DropdownMenuSubMenu({ label, children, motion, entering, exiting }: DropdownMenuSubMenuProps): import("react/jsx-runtime").JSX.Element;
