import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface DropdownMenuCheckboxItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the setting (e.g. "Show line numbers"). Required. */
    label: string;
    /** Checked state. Defaults to false. */
    checked?: boolean;
    /** Called with the next checked state. */
    onCheckedChange?: (checked: boolean) => void;
    children?: ReactNode;
}
export declare function DropdownMenuCheckboxItem({ className, slotProps, label, checked, onCheckedChange, children }: DropdownMenuCheckboxItemProps): import("react/jsx-runtime").JSX.Element;
