import type { ReactNode } from 'react';
export interface RadioListProps {
    /** Accessible name for the group (e.g. "Delivery speed"). Required. */
    label: string;
    children: ReactNode;
}
export declare function RadioList({ label, children }: RadioListProps): import("react/jsx-runtime").JSX.Element;
