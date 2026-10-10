import type { ReactNode } from 'react';
export interface AspectRatioProps {
    /** Box ratio as CSS, e.g. '16/9'. Required. */
    ratio: string;
    children: ReactNode;
}
export declare function AspectRatio({ ratio, children }: AspectRatioProps): import("react/jsx-runtime").JSX.Element;
