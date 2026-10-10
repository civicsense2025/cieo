import type { ReactNode } from 'react';
export interface IconButtonProps {
    label: string;
    size?: 'sm' | 'md';
    children: ReactNode;
}
export declare function IconButton({ label, size, children }: IconButtonProps): import("react/jsx-runtime").JSX.Element;
