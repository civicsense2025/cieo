import type { ReactNode } from 'react';
export interface CodeBlockProps {
    /** Language tag for readers (e.g. "tsx"). Display only; no highlighting. */
    language?: string;
    /** The snippet text. */
    children: ReactNode;
}
export declare function CodeBlock({ language, children }: CodeBlockProps): import("react/jsx-runtime").JSX.Element;
