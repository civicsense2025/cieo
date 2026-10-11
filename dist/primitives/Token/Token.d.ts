import type { ReactNode } from 'react';
export interface TokenProps {
    /** Fill emphasis. Defaults to default. */
    tone?: 'default' | 'accent';
    /** The keyword or filter text. */
    children: ReactNode;
}
export declare function Token({ tone, children }: TokenProps): import("react/jsx-runtime").JSX.Element;
