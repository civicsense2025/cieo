import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TopicChipProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Colour for the dot, for a chip on a dark or photo ground. Defaults to the accent. */
    dot?: string;
    children: ReactNode;
}
export declare function TopicChip({ className, slotProps, dot, children }: TopicChipProps): import("react/jsx-runtime").JSX.Element;
