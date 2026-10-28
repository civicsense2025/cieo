import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
export interface MultiSelectorProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        input?: PrimitivePartProps;
    };
    /** Visible label naming the set. Required. */
    label: string;
    /** Controlled selected values. Optional. */
    values?: string[];
    /** Host change hook with the full selected set. Optional. */
    onChange?: (values: string[]) => void;
    children: ReactNode;
}
export declare function MultiSelector({ className, slotProps, label, values, onChange, children }: MultiSelectorProps): import("react/jsx-runtime").JSX.Element;
