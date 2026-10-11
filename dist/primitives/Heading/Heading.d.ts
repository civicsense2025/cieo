import type { ReactNode } from 'react';
export interface HeadingProps {
    /** Heading level. Defaults to 2. */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** The title text. */
    children: ReactNode;
}
export declare function Heading({ level, children }: HeadingProps): import("react/jsx-runtime").JSX.Element;
