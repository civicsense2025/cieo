import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface RadioListProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the group (e.g. "Delivery speed"). Required. */
    label: string;
    children: ReactNode;
}
export declare function RadioList({ className, slotProps, label, children }: RadioListProps): import("react/jsx-runtime").JSX.Element;
