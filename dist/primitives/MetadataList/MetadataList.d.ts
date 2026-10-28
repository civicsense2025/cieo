import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface MetadataListProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Metadata items. Required. */
    children: ReactNode;
}
export declare function MetadataList({ className, slotProps, children }: MetadataListProps): import("react/jsx-runtime").JSX.Element;
