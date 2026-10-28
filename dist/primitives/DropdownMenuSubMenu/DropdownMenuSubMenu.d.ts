import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
import { type MotionProps } from '../motion.js';
export interface DropdownMenuSubMenuProps extends MotionProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        dropdownMenuSubmenuTrigger?: PrimitivePartProps;
        dropdownMenuSubmenuPanel?: PrimitivePartProps;
    };
    /** Accessible name for the nested menu (e.g. "Export as"). Required. */
    label: string;
    children: ReactNode;
}
export declare function DropdownMenuSubMenu({ className, slotProps, label, children, motion, entering, exiting }: DropdownMenuSubMenuProps): import("react/jsx-runtime").JSX.Element;
