import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface ReferenceTextProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** What a screen reader hears instead, such as "Page 4 of 18". */
    spoken?: string;
    children: ReactNode;
}
/** Keeps a page count truthful: at least page 1, never past the total. */
export declare function pageBounds(page: number, total: number): [number, number];
export declare function ReferenceText({ className, slotProps, spoken, children }: ReferenceTextProps): import("react/jsx-runtime").JSX.Element;
