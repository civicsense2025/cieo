import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface NavIconProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Icon size. Defaults to md. */
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}
export declare function NavIcon({ className, slotProps, size, children }: NavIconProps): import("react/jsx-runtime").JSX.Element;
