import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface ButtonGroupProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the group (e.g. "Clipboard actions"). Required. */
    label: string;
    /** Layout direction. Defaults to horizontal. */
    orientation?: 'horizontal' | 'vertical';
    children: ReactNode;
}
export declare function ButtonGroup({ className, slotProps, label, orientation, children }: ButtonGroupProps): import("react/jsx-runtime").JSX.Element;
