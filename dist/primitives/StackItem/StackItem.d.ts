import type { ReactNode } from 'react';
export interface StackItemProps {
    /** Grow to fill free space. Defaults to false. */
    grow?: boolean;
    children: ReactNode;
}
export declare function StackItem({ grow, children }: StackItemProps): import("react/jsx-runtime").JSX.Element;
