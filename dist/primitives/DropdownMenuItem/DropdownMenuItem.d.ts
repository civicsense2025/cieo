import { type ComponentPropsWithRef, type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface DropdownMenuItemProps extends Omit<ComponentPropsWithRef<'button'>, 'onSelect' | 'children'> {
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
    /** Polymorphic child rendering. */
    asChild?: boolean;
    children?: ReactNode;
}
export declare function DropdownMenuItem({ className, slotProps, label, disabled, onSelect, asChild, ref, style, children, ...rest }: DropdownMenuItemProps): import("react/jsx-runtime").JSX.Element;
