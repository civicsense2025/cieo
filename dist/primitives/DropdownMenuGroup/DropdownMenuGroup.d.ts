import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface DropdownMenuGroupProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        label?: PrimitivePartProps;
    };
    /** Section name announced with the group. Optional; omit for unlabeled clusters. */
    label?: string;
    children: ReactNode;
}
export declare function DropdownMenuGroup({ className, slotProps, label, children }: DropdownMenuGroupProps): import("react/jsx-runtime").JSX.Element;
