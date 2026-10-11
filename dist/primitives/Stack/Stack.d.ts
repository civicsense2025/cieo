import type { ReactNode } from 'react';
export interface StackProps {
    gap?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}
export declare function Stack({ gap, children }: StackProps): import("react/jsx-runtime").JSX.Element;
