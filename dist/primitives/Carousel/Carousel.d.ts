import { type ReactNode } from 'react';
export interface CarouselProps {
    /** Accessible name for the carousel region (e.g. "Featured guides"). Required. */
    label: string;
    children: ReactNode;
}
export declare function Carousel({ label, children }: CarouselProps): import("react/jsx-runtime").JSX.Element;
