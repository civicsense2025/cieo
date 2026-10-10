import type { ReactNode } from 'react';
export interface CheckboxListProps {
    /** Accessible name for the group (e.g. "Notification channels"). Required. */
    label: string;
    children: ReactNode;
}
export declare function CheckboxList({ label, children }: CheckboxListProps): import("react/jsx-runtime").JSX.Element;
