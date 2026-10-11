import type { ReactNode } from 'react';
export interface CardProps {
    /** Card heading. Omit for title-less cards. */
    title?: string;
    children: ReactNode;
}
export declare function Card({ title, children }: CardProps): import("react/jsx-runtime").JSX.Element;
