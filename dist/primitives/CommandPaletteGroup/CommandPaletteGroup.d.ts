import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface CommandPaletteGroupProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        label?: PrimitivePartProps;
    };
    /** Group heading (e.g. "Pages"). Optional. */
    label?: string;
    children: ReactNode;
}
export declare function CommandPaletteGroup({ className, slotProps, label, children }: CommandPaletteGroupProps): import("react/jsx-runtime").JSX.Element;
