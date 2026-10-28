import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface CheckboxListProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Accessible name for the group (e.g. "Notification channels"). Required. */
    label: string;
    children: ReactNode;
}
export declare function CheckboxList({ className, slotProps, label, children }: CheckboxListProps): import("react/jsx-runtime").JSX.Element;
