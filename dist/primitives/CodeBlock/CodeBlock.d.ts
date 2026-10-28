import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface CodeBlockProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        code?: PrimitivePartProps;
    };
    /** Language tag for readers (e.g. "tsx"). Display only; no highlighting. */
    language?: string;
    /** The snippet text. */
    children: ReactNode;
}
export declare function CodeBlock({ className, slotProps, language, children }: CodeBlockProps): import("react/jsx-runtime").JSX.Element;
