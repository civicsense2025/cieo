import type { ReactNode } from 'react';
export interface TopNavHeadingProps {
    /** Brand link target. Defaults to /. */
    href?: string;
    children: ReactNode;
}
export declare function TopNavHeading({ href, children }: TopNavHeadingProps): import("react/jsx-runtime").JSX.Element;
