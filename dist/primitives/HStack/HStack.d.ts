import type { ReactNode } from 'react';
export interface HStackProps {
    /** Gap between children. Defaults to 'md'. */
    gap?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}
export declare function HStack({ gap, children }: HStackProps): import("react/jsx-runtime").JSX.Element;
