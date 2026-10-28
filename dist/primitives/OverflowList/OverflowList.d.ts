import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
export interface OverflowListProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        more?: PrimitivePartProps;
    };
    /** Visible child budget. Defaults to 4. */
    max?: number;
    children: ReactNode;
}
export declare function OverflowList({ className, slotProps, max, children }: OverflowListProps): import("react/jsx-runtime").JSX.Element;
