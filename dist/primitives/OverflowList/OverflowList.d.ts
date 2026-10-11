import { type ReactNode } from 'react';
export interface OverflowListProps {
    /** Visible child budget. Defaults to 4. */
    max?: number;
    children: ReactNode;
}
export declare function OverflowList({ max, children }: OverflowListProps): import("react/jsx-runtime").JSX.Element;
