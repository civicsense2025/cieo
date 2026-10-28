import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface ScrollableAreaProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Scroll axes allowed. Defaults to 'vertical'. */
    orientation?: 'vertical' | 'horizontal' | 'both';
    /** Max block height before scrolling, e.g. '16rem'. Optional. */
    maxHeight?: string;
    children: ReactNode;
}
export declare function ScrollableArea({ className, slotProps, orientation, maxHeight, children }: ScrollableAreaProps): import("react/jsx-runtime").JSX.Element;
