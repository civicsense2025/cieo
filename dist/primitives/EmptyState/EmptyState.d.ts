import type { PrimitivePartProps } from '../parts.js';
import type { ReactNode } from 'react';
export interface EmptyStateProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
        title?: PrimitivePartProps;
        description?: PrimitivePartProps;
        action?: PrimitivePartProps;
    };
    /** Headline naming the empty situation. Required. */
    title: string;
    slots?: {
        icon?: ReactNode;
        title?: ReactNode;
        description?: ReactNode;
        action?: ReactNode;
    };
    /** One line of next-step guidance. Omit when the title says it all. */
    description?: string;
    /** The recovery action (button or link). */
    children: ReactNode;
}
export declare function EmptyState({ className, slotProps, slots, title, description, children }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
