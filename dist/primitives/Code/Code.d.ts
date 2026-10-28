import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface CodeProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Inline code content. */
    children: ReactNode;
}
export declare function Code({ className, slotProps, children }: CodeProps): import("react/jsx-runtime").JSX.Element;
