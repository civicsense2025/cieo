import { type ReactNode } from 'react';
export interface HoverCardProps {
    /** Card body shown on hover and focus. Required. */
    content: ReactNode;
    children: ReactNode;
}
export declare function HoverCard({ content, children }: HoverCardProps): import("react/jsx-runtime").JSX.Element;
