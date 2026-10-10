import type { ReactNode } from 'react';
export interface ToolbarProps {
    label: string;
    title?: ReactNode;
    children: ReactNode;
}
export declare function Toolbar({ label, title, children }: ToolbarProps): import("react/jsx-runtime").JSX.Element;
