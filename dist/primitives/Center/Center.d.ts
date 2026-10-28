import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface CenterProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Max inline width of the column. Defaults to '60rem'. */
    maxWidth?: string;
    children: ReactNode;
}
export declare function Center({ className, slotProps, maxWidth, children }: CenterProps): import("react/jsx-runtime").JSX.Element;
