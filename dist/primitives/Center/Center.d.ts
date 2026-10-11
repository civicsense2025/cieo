import type { ReactNode } from 'react';
export interface CenterProps {
    /** Max inline width of the column. Defaults to '60rem'. */
    maxWidth?: string;
    children: ReactNode;
}
export declare function Center({ maxWidth, children }: CenterProps): import("react/jsx-runtime").JSX.Element;
