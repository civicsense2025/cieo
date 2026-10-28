import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface MetadataListItemProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        term?: PrimitivePartProps;
        description?: PrimitivePartProps;
    };
    /** Term name (the dt). Required. */
    term: string;
    /** Description content (the dd). Required. */
    children: ReactNode;
}
export declare function MetadataListItem({ className, slotProps, term, children }: MetadataListItemProps): import("react/jsx-runtime").JSX.Element;
