import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface QuotedTextProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Shown above the passage, such as "Endangered Species Act §1302". */
    reference?: string;
    /** Source URL for the quotation. */
    cite?: string;
    children: ReactNode;
}
export declare function QuotedText({ className, slotProps, reference, cite, children }: QuotedTextProps): import("react/jsx-runtime").JSX.Element;
