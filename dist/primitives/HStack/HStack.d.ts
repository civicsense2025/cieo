import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface HStackProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Gap between children. Defaults to 'md'. */
    gap?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}
export declare function HStack({ className, slotProps, gap, children }: HStackProps): import("react/jsx-runtime").JSX.Element;
