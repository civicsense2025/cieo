import type { ReactNode } from 'react';
export interface BlockquoteProps {
    /** Source credit shown under the quote. Omit when unknown. */
    cite?: string;
    /** The quoted passage. */
    children: ReactNode;
}
export declare function Blockquote({ cite, children }: BlockquoteProps): import("react/jsx-runtime").JSX.Element;
