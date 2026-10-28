import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface LayoutProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    children: ReactNode;
}
export declare function Layout({ className, slotProps, children }: LayoutProps): import("react/jsx-runtime").JSX.Element;
