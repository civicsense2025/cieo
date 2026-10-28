import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface SideNavHeadingProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    children: ReactNode;
}
export declare function SideNavHeading({ className, slotProps, children }: SideNavHeadingProps): import("react/jsx-runtime").JSX.Element;
