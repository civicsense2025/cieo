import { type ReactNode } from 'react';
export interface TabProps {
    /** Tab key matched against the shared value. Required. */
    value: string;
    children: ReactNode;
}
export declare function Tab({ value, children }: TabProps): import("react/jsx-runtime").JSX.Element;
