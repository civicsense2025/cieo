import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface AspectRatioProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Box ratio as CSS, e.g. '16/9'. Required. */
    ratio: string;
    children: ReactNode;
}
export declare function AspectRatio({ className, slotProps, ratio, children }: AspectRatioProps): import("react/jsx-runtime").JSX.Element;
