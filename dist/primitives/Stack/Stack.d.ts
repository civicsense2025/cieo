import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface StackProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    gap?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}
export declare function Stack({ className, slotProps, gap, children }: StackProps): import("react/jsx-runtime").JSX.Element;
