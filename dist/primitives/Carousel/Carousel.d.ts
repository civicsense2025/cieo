import type { PrimitivePartProps } from '../parts.js';
import { type ReactNode } from 'react';
export interface CarouselProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        track?: PrimitivePartProps;
        previous?: PrimitivePartProps;
        next?: PrimitivePartProps;
    };
    /** Accessible name for the carousel region (e.g. "Featured guides"). Required. */
    label: string;
    /** False renders the end state instantly via data-motion="off". Defaults to true. */
    motion?: boolean;
    children: ReactNode;
}
export declare function Carousel({ label, motion, children, className, slotProps }: CarouselProps): import("react/jsx-runtime").JSX.Element;
