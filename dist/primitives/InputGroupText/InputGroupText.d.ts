import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface InputGroupTextProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    children: ReactNode;
}
export declare function InputGroupText({ className, slotProps, children }: InputGroupTextProps): import("react/jsx-runtime").JSX.Element;
