import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface CommandPaletteListProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the option list. Optional. */
    label?: string;
    children: ReactNode;
}
export declare function CommandPaletteList({ className, slotProps, label, children }: CommandPaletteListProps): import("react/jsx-runtime").JSX.Element;
