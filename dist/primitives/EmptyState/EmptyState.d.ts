import type { ReactNode } from 'react';
export interface EmptyStateProps {
    /** Headline naming the empty situation. Required. */
    title: string;
    /** One line of next-step guidance. Omit when the title says it all. */
    description?: string;
    /** The recovery action (button or link). */
    children: ReactNode;
}
export declare function EmptyState({ title, description, children }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
