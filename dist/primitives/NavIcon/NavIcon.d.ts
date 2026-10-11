import type { ReactNode } from 'react';
export interface NavIconProps {
    /** Icon size. Defaults to md. */
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}
export declare function NavIcon({ size, children }: NavIconProps): import("react/jsx-runtime").JSX.Element;
