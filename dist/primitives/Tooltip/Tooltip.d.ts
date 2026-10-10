import { type ReactNode } from 'react';
export interface TooltipProps {
    text: string;
    children: ReactNode;
}
export declare function Tooltip({ text, children }: TooltipProps): import("react/jsx-runtime").JSX.Element;
