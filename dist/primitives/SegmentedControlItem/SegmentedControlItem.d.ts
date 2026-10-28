import { type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface SegmentedControlItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Segment key matched against the control value. Required. */
    value: string;
    children: ReactNode;
}
export declare function SegmentedControlItem({ className, slotProps, value, children }: SegmentedControlItemProps): import("react/jsx-runtime").JSX.Element;
