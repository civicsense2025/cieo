import { type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface DropdownMenuItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name when children carry no readable text. */
    label?: string;
    /** Removes the item from selection. Defaults to false. */
    disabled?: boolean;
    /** Called when the host should run the action (and usually close the menu). */
    onSelect?: () => void;
    children?: ReactNode;
}
export declare function DropdownMenuItem({ className, slotProps, label, disabled, onSelect, children }: DropdownMenuItemProps): import("react/jsx-runtime").JSX.Element;
