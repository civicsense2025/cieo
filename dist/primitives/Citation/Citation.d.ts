import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface CitationProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        content?: PrimitivePartProps;
    };
    /** Source URL. Omit for offline or print-only sources. */
    href?: string;
    /** The source title. */
    children: ReactNode;
}
export declare function Citation({ className, slotProps, href, children }: CitationProps): import("react/jsx-runtime").JSX.Element;
