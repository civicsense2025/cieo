import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface CommandPaletteEmptyProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Override text. Defaults to "No results". */
    children?: ReactNode;
}
export declare function CommandPaletteEmpty({ className, slotProps, children }: CommandPaletteEmptyProps): import("react/jsx-runtime").JSX.Element;
