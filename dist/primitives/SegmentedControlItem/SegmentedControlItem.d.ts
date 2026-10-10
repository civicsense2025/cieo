import { type ReactNode } from 'react';
export interface SegmentedControlItemProps {
    /** Segment key matched against the control value. Required. */
    value: string;
    children: ReactNode;
}
export declare function SegmentedControlItem({ value, children }: SegmentedControlItemProps): import("react/jsx-runtime").JSX.Element;
