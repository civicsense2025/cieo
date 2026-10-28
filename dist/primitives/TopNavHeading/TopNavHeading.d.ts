import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TopNavHeadingProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Brand link target. Defaults to /. */
    href?: string;
    children: ReactNode;
}
export declare function TopNavHeading({ className, slotProps, href, children }: TopNavHeadingProps): import("react/jsx-runtime").JSX.Element;
