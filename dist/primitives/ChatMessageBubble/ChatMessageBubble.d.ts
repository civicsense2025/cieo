import type { ReactNode } from 'react';
export interface ChatMessageBubbleProps {
    /** Bubble side. Defaults to incoming. */
    variant?: 'incoming' | 'outgoing';
    children: ReactNode;
}
export declare function ChatMessageBubble({ variant, children }: ChatMessageBubbleProps): import("react/jsx-runtime").JSX.Element;
