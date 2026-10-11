import type { ReactNode } from 'react';
export interface ListProps {
    ordered?: boolean;
    label?: string;
    children: ReactNode;
}
export declare function List({ ordered, label, children }: ListProps): import("react/jsx-runtime").JSX.Element;
