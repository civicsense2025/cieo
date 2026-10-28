import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface StackItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Grow to fill free space. Defaults to false. */
    grow?: boolean;
    children: ReactNode;
}
export declare function StackItem({ className, slotProps, grow, children }: StackItemProps): import("react/jsx-runtime").JSX.Element;
