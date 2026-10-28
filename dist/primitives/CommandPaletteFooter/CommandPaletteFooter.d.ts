import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface CommandPaletteFooterProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    children: ReactNode;
}
export declare function CommandPaletteFooter({ className, slotProps, children }: CommandPaletteFooterProps): import("react/jsx-runtime").JSX.Element;
