import { type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface SegmentedControlItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Segment key matched against the control value. Required. */
    value: string;
    /** Link target. When set, renders an <a> (with aria-current when picked) so tool switchers keep link semantics. */
    href?: string;
    children: ReactNode;
}
export declare function SegmentedControlItem({ className, slotProps, value, href, children }: SegmentedControlItemProps): import("react/jsx-runtime").JSX.Element;
