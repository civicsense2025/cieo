import type { ReactNode } from 'react';
import type { PrimitivePartProps } from '../parts.js';
export interface ChatMessageBubbleProps {
    className?: string;
    slotProps?: {
        root?: PrimitivePartProps;
    };
    /** Bubble side. Defaults to incoming. */
    variant?: 'incoming' | 'outgoing';
    children: ReactNode;
}
export declare function ChatMessageBubble({ className, slotProps, variant, children }: ChatMessageBubbleProps): import("react/jsx-runtime").JSX.Element;
