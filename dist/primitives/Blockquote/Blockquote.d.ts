import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface BlockquoteProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        attribution?: PrimitivePartProps;
        source?: PrimitivePartProps;
    };
    /** Source credit shown under the quote. Omit when unknown. */
    cite?: string;
    /** The quoted passage. */
    children: ReactNode;
}
export declare function Blockquote({ className, slotProps, cite, children }: BlockquoteProps): import("react/jsx-runtime").JSX.Element;
