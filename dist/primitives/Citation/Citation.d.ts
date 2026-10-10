import type { ReactNode } from 'react';
export interface CitationProps {
    /** Source URL. Omit for offline or print-only sources. */
    href?: string;
    /** The source title. */
    children: ReactNode;
}
export declare function Citation({ href, children }: CitationProps): import("react/jsx-runtime").JSX.Element;
