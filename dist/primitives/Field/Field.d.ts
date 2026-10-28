import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface FieldProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        label?: PrimitivePartProps;
        help?: PrimitivePartProps;
    };
    label: string;
    htmlFor?: string;
    description?: string;
    error?: string;
    children: ReactNode;
}
export declare function Field({ className, slotProps, label, htmlFor, description, error, children }: FieldProps): import("react/jsx-runtime").JSX.Element;
