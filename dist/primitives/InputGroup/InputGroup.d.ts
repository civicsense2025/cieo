import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface InputGroupProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the group (e.g. "Price in dollars"). Optional; pass when the addons alone do not name the control. */
    label?: string;
    children: ReactNode;
}
export declare function InputGroup({ className, slotProps, label, children }: InputGroupProps): import("react/jsx-runtime").JSX.Element;
