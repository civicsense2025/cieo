import type { ReactNode } from 'react';
export interface TimestampProps {
    /** Machine-readable instant (ISO 8601). Required. */
    dateTime: string;
    /** Human-readable rendering of the instant. */
    children: ReactNode;
}
export declare function Timestamp({ dateTime, children }: TimestampProps): import("react/jsx-runtime").JSX.Element;
