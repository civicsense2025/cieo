import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface TimestampProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Machine-readable instant (ISO 8601). Required. */
    dateTime: string;
    /** Human-readable rendering of the instant. */
    children: ReactNode;
}
export declare function Timestamp({ className, slotProps, dateTime, children }: TimestampProps): import("react/jsx-runtime").JSX.Element;
