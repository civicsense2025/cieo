import { type ReactNode, type Ref } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface SegmentedControlItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    ref?: Ref<HTMLElement>;
    /** Polymorphic child rendering. */
    asChild?: boolean;
    /** Segment key matched against the control value. Required. */
    value: string;
    /** Link target. When set, renders an <a> (with aria-current when picked) so tool switchers keep link semantics. */
    href?: string;
    children: ReactNode;
}
export declare function SegmentedControlItem({ className, slotProps, ref, asChild, value, href, children }: SegmentedControlItemProps): import("react/jsx-runtime").JSX.Element;
