import { type ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TabProps {
    id?: string;
    controls?: string;
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Tab key matched against the shared value. Required. */
    value: string;
    children: ReactNode;
}
export declare function Tab({ value, children, id, controls, className, slotProps }: TabProps): import("react/jsx-runtime").JSX.Element;
