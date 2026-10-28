import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface HeadingProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Heading level. Defaults to 2. */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** The title text. */
    children: ReactNode;
}
export declare function Heading({ className, slotProps, level, children }: HeadingProps): import("react/jsx-runtime").JSX.Element;
