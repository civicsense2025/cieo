import type { ReactNode } from 'react';
export interface ScrollableAreaProps {
    /** Scroll axes allowed. Defaults to 'vertical'. */
    orientation?: 'vertical' | 'horizontal' | 'both';
    /** Max block height before scrolling, e.g. '16rem'. Optional. */
    maxHeight?: string;
    children: ReactNode;
}
export declare function ScrollableArea({ orientation, maxHeight, children }: ScrollableAreaProps): import("react/jsx-runtime").JSX.Element;
